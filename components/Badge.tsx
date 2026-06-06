export default function Badge({ value, type }: { value: string; type?: string }) {
  const cls = type ? `badge badge-${type}` : `badge badge-${value.toLowerCase()}`;
  return <span className={cls}>{value}</span>;
}
