interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  color: 'pink' | 'purple' | 'rose' | 'fuchsia';
}

export default function StatCard({
  icon,
  value,
  label,
  color,
}: StatCardProps) {
  const colors = {
    pink: 'border-pink-100',
    purple: 'border-purple-100',
    rose: 'border-rose-100',
    fuchsia: 'border-fuchsia-100',
  };

  return (
    <div
      className={`rounded-3xl border bg-white p-5 shadow-sm ${colors[color]}`}
    >
      <div className="mb-4 text-2xl">
        {icon}
      </div>

      <p className="text-3xl font-bold text-slate-800">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {label}
      </p>
    </div>
  );
}