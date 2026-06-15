import { cn } from "@/lib/cn";

export interface StatProps {
  value: string;
  label: string;
  className?: string;
}

export function Stat({ value, label, className }: StatProps) {
  return (
    <div className={cn("rounded-xl bg-black/10 p-6 text-center", className)}>
      {/* Metric Number style */}
      <p className="font-display text-[72px] font-bold leading-[1.06] tracking-[-2.88px] text-kale">
        {value}
      </p>
      {/* Paragraph MD */}
      <p className="mt-2 text-base leading-[1.4] text-kale opacity-80">
        {label}
      </p>
    </div>
  );
}

export default Stat;
