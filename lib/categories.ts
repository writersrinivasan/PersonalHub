export const AUTO_CATEGORIES: Record<string, string[]> = {
  Food: ['zomato', 'swiggy', 'restaurant', 'cafe', 'pizza', 'burger', 'food', 'eat', 'kitchen', 'dining', 'hotel'],
  Transport: ['petrol', 'fuel', 'uber', 'ola', 'cab', 'auto', 'metro', 'bus', 'flight', 'train', 'irctc', 'namma'],
  Utilities: ['electricity', 'jio', 'airtel', 'vi ', 'bsnl', 'water', 'gas', 'broadband', 'recharge', 'bill'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa', 'reliance', 'mall', 'store'],
  Health: ['pharmacy', 'hospital', 'clinic', 'doctor', 'medical', 'apollo', 'med', 'lab', 'diagnostics'],
  Entertainment: ['netflix', 'hotstar', 'prime', 'spotify', 'youtube', 'movie', 'cinema', 'pvr', 'inox'],
  Finance: ['insurance', 'lic', 'sip', 'mutual fund', 'fd ', 'loan', 'emi', 'credit card', 'investment'],
  Education: ['course', 'udemy', 'coursera', 'books', 'school', 'college', 'tuition', 'fees'],
};

export const REVENUE_MARKERS = [
  'salary', 'sal cr', 'advance cr', 'neft cr', 'rtgs cr', 'imps cr',
  'credit by', 'inward neft', 'interest credit', 'interest cr',
  'dividend', 'refund', 'cashback', 'reversal', 'payment received',
];

export function guessCategory(desc: string): { cat: string; isRevenue: boolean } {
  const d = desc.toLowerCase();
  const isRevenue = REVENUE_MARKERS.some((m) => d.includes(m));
  for (const [cat, keywords] of Object.entries(AUTO_CATEGORIES)) {
    if (keywords.some((k) => d.includes(k))) return { cat, isRevenue };
  }
  return { cat: 'Other', isRevenue };
}

export function normalizeDate(raw: string): string {
  if (!raw) return '';
  const parts = raw.split(/[\/\-]/);
  if (parts.length !== 3) return raw;
  if (parts[0].length === 4) return raw; // already YYYY-MM-DD
  const [d, m, y] = parts;
  const year = y.length === 2 ? '20' + y : y;
  return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export function parseAmount(v: string | number): number {
  const n = parseFloat(String(v).replace(/[₹,\s]/g, ''));
  return isNaN(n) ? 0 : Math.abs(n);
}
