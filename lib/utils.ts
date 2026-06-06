export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const fmt = (d: Date | string) =>
  d instanceof Date ? d.toISOString().split('T')[0] : d;

export const today = () => fmt(new Date());

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
};

export const daysAhead = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(d);
};

export const formatCurrency = (n: number) =>
  '₹' + Number(n).toLocaleString('en-IN');

export const formatDate = (s: string) => {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const escape = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
