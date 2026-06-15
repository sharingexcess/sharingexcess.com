import { cn } from "@/lib/cn";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  theme?: "onColor" | "onWhite";
  className?: string;
}

export function TextInput({ theme = "onWhite", className, ...props }: TextInputProps) {
  return (
    <input
      type="text"
      className={cn(
        "w-full rounded-full px-4 py-3 text-base leading-[1.4] placeholder:text-neutral-400 outline-none transition-colors",
        theme === "onWhite"
          ? "border border-neutral-250 bg-neutral-100 text-kale focus:border-se-green"
          : "bg-white text-kale focus:ring-2 focus:ring-white/40",
        className,
      )}
      {...props}
    />
  );
}

export default TextInput;
