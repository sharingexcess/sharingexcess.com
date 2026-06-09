import { cn } from "@/lib/cn";

export interface StatProps {
  value: string;
  label: string;
  className?: string;
}

export function Stat({ value, label, className }: StatProps) {
  return (
    <div className={cn("rounded-xl bg-black/10 p-6 text-center", className)}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm opacity-80">{label}</p>
    </div>
  );
}

export default Stat;
