import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import type { FormSectionVariant } from "@/lib/types";
import { SectionShell } from "./SectionShell";

const variantClasses: Record<FormSectionVariant, string> = {
  "dark-green": "bg-se-green-700 text-neutral-000",
  "light-green": "bg-se-green-100 text-se-green-800",
  white: "bg-neutral-000 text-neutral-900 border border-neutral-200",
  tangerine: "bg-tangerine-100 text-tangerine-800",
  banana: "bg-banana-100 text-banana-800",
};

export interface FormSectionProps {
  variant?: FormSectionVariant;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FormSection({
  variant = "white",
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <SectionShell theme="light" className={className}>
      <div className={cn("rounded-xl p-8", variantClasses[variant])}>
        <Heading level={2}>{title}</Heading>
        {description && <Text className="mt-2 opacity-80">{description}</Text>}
        <div className="mt-6">{children ?? <p className="text-sm opacity-60">Form embed placeholder</p>}</div>
      </div>
    </SectionShell>
  );
}

export default FormSection;
