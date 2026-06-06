import { BankRow } from './types';
import { normalizeDate, parseAmount, guessCategory } from './categories';
import { uid } from './utils';

export { normalizeDate, parseAmount, guessCategory };

function csvSplit(line: string, delimiter: string): string[] {
  const cols: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (!inQ && ch === delimiter) { cols.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  cols.push(cur.trim());
  return cols;
}

export function parseBankCsv(text: string): BankRow[] | { error: string } {
  const rawLines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const delimiter = rawLines.slice(0, 5).join('').includes(';') ? ';' : ',';

  let headerRow = -1;
  let cols: string[] = [];
  for (let i = 0; i < Math.min(rawLines.length, 30); i++) {
    const line = rawLines[i].toLowerCase();
    if (
      line.includes('date') &&
      (line.includes('debit') || line.includes('amount') || line.includes('withdrawal'))
    ) {
      headerRow = i;
      cols = csvSplit(rawLines[i], delimiter).map((c) => c.toLowerCase().trim());
      break;
    }
  }
  if (headerRow === -1) return { error: 'Could not find transaction headers (Date, Debit/Credit, Amount). Check the CSV format.' };

  const idx = (keys: string[]) => keys.reduce((f, k) => (f === -1 ? cols.findIndex((c) => c.includes(k)) : f), -1);

  const dateCol    = idx(['date']);
  const descCol    = idx(['narration', 'description', 'particulars', 'remarks', 'details', 'transaction']);
  const debitCol   = idx(['debit', 'withdrawal', 'dr']);
  const creditCol  = idx(['credit', 'deposit', 'cr']);
  const amountCol  = debitCol === -1 && creditCol === -1 ? idx(['amount']) : -1;
  const balanceCol = idx(['balance']);

  if (dateCol === -1) return { error: 'Date column not found.' };

  const rows: BankRow[] = [];
  for (let i = headerRow + 1; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;
    const c = csvSplit(line, delimiter);
    const rawDate = c[dateCol] || '';
    if (!rawDate || rawDate.toLowerCase().includes('date')) continue;
    if (!/\d/.test(rawDate)) continue;

    const desc   = c[descCol] || 'Transaction';
    const debit  = debitCol  !== -1 ? parseAmount(c[debitCol]  || '0') : 0;
    const credit = creditCol !== -1 ? parseAmount(c[creditCol] || '0') : 0;
    let amount   = amountCol !== -1 ? parseAmount(c[amountCol] || '0') : 0;
    let type: 'debit' | 'credit';

    if (amountCol !== -1) {
      const { isRevenue } = guessCategory(desc);
      type = isRevenue ? 'credit' : 'debit';
    } else {
      amount = credit > 0 ? credit : debit;
      type = credit > 0 ? 'credit' : 'debit';
    }
    if (amount === 0) continue;

    const { cat, isRevenue } = guessCategory(desc);
    rows.push({
      id: uid(),
      date: normalizeDate(rawDate),
      description: desc,
      amount,
      type,
      category: cat,
      importAs: isRevenue ? 'revenue' : type === 'credit' ? 'revenue' : 'personal-expense',
      selected: true,
      balance: balanceCol !== -1 ? parseAmount(c[balanceCol] || '0') : undefined,
    });
  }

  if (rows.length === 0) return { error: 'No valid transactions found. Check that debit/credit columns have numeric values.' };
  return rows;
}

export async function parseBankPdf(arrayBuffer: ArrayBuffer): Promise<BankRow[] | { error: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import('pdfjs-dist');
  const pdfjsLib = pdfjs.default ?? pdfjs;
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pdf: any;
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (e: unknown) {
    return { error: 'Could not open PDF: ' + (e instanceof Error ? e.message : String(e)) };
  }

  const allLines: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const lineMap: { y: number; parts: { t: string; x: number }[] }[] = [];
    for (const item of content.items as { str: string; transform: number[] }[]) {
      if (!item.str?.trim()) continue;
      const y = item.transform[5];
      const x = item.transform[4];
      const existing = lineMap.find((l) => Math.abs(l.y - y) < 4);
      if (existing) existing.parts.push({ t: item.str, x });
      else lineMap.push({ y, parts: [{ t: item.str, x }] });
    }
    lineMap.sort((a, b) => b.y - a.y);
    for (const line of lineMap) {
      line.parts.sort((a, b) => a.x - b.x);
      const text = line.parts.map((p) => p.t).join(' ').replace(/\s{2,}/g, ' ').trim();
      if (text) allLines.push(text);
    }
  }

  if (allLines.length < 5) {
    return { error: 'This PDF appears to be a scanned image. No text was extracted. Please download the statement as CSV instead.' };
  }

  return extractPdfTransactions(allLines);
}

function extractPdfTransactions(lines: string[]): BankRow[] | { error: string } {
  const DATE_RE = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/;
  const AMT_RE = /\b(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\b/g;
  const rows: BankRow[] = [];

  for (const line of lines) {
    const dm = line.match(DATE_RE);
    if (!dm) continue;
    const rawDate = dm[1];
    const dateEnd = line.indexOf(rawDate) + rawDate.length;
    const amts = [...line.matchAll(AMT_RE)]
      .map((m) => ({ v: parseFloat(m[1].replace(/,/g, '')), idx: m.index! }))
      .filter((m) => m.v >= 1 && m.v < 100_000_000);
    if (amts.length === 0) continue;

    const firstAmtIdx = amts[0].idx;
    let desc = line.slice(dateEnd, firstAmtIdx > dateEnd ? firstAmtIdx : undefined)
      .replace(/[^\w\s\-\/]/g, ' ').replace(/\s+/g, ' ').trim();
    if (desc.length < 3) desc = line.slice(dateEnd).replace(AMT_RE, '').replace(/[^\w\s\-\/]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!desc || desc.length < 2) desc = 'Bank Transaction';

    const amounts = amts.map((a) => a.v);
    const ctx = (desc + ' ' + line).toLowerCase();
    const isDr = /\bdr\b|\bdebit\b|\bwdl\b|\bwithdrawal\b/.test(ctx);
    const isCr = /\bcr\b|\bcredit\b|\bdeposit\b/.test(ctx);

    let debit = 0, credit = 0;
    if (amounts.length >= 3) {
      const maxVal = Math.max(...amounts);
      const txAmts = amounts.filter((v) => v !== maxVal);
      if (isDr) debit = txAmts[0] || amounts[0];
      else if (isCr) credit = txAmts[0] || amounts[0];
      else { debit = amounts[0]; credit = amounts[1]; }
    } else {
      const txAmt = amounts[0];
      if (isDr) debit = txAmt;
      else if (isCr) credit = txAmt;
      else {
        const { isRevenue } = guessCategory(desc);
        if (isRevenue) credit = txAmt; else debit = txAmt;
      }
    }

    const isCredit = credit > 0 && credit >= debit;
    const amount = isCredit ? credit : debit;
    if (amount === 0 || amount > 50_000_000) continue;

    const { cat, isRevenue } = guessCategory(desc);
    rows.push({
      id: uid(),
      date: normalizeDate(rawDate),
      description: desc,
      amount,
      type: isCredit ? 'credit' : 'debit',
      category: cat,
      importAs: isRevenue ? 'revenue' : isCredit ? 'revenue' : 'personal-expense',
      selected: true,
      balance: amounts[amounts.length - 1],
    });
  }

  if (rows.length === 0) {
    return { error: 'No transactions found in this PDF. Try downloading as CSV instead.' };
  }
  return rows;
}
