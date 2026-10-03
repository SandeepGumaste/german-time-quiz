export function StatsRow({ items }: { items: [string, string | number][] }) {
  return (
    <div className="flex gap-4 sm:gap-6 text-center">
      {items.map(([label, value]) => (
        <div key={label}>
          <div className="text-xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}
