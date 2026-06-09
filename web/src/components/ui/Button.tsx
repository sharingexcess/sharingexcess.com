import { cn } from "@/lib/cn";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variants = {
  primary: "bg-bright-kelly text-se-green-800 hover:bg-se-green-300",
  secondary: "bg-banana text-se-green-800 hover:bg-banana-300",
  ghost: "bg-transparent text-[var(--section-text)] underline hover:opacity-80",
};

export function Button({
  children,
  variant = "primary",
  href,
  className,
  type = "button",
  disabled,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors",
    variants[variant],
    disabled && "pointer-events-none opacity-50",
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
