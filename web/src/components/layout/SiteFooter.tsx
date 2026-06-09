import { cn } from "@/lib/cn";

export interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("bg-se-green-800 px-6 py-12 text-neutral-000", className)}>
      <div className="mx-auto max-w-6xl">
        <p className="text-sm text-se-green-200">
          © {new Date().getFullYear()} Sharing Excess. National food rescue nonprofit.
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
