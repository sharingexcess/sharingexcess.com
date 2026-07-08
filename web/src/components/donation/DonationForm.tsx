import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { SectionTheme } from "@/lib/types";
import { useState, type ReactNode } from "react";

export type DonationFrequency = "one-time" | "monthly";

export interface DonationFormProps {
  /** Preset amount options shown in the grid */
  presetAmounts?: number[];
  /** Initial selected preset amount */
  defaultAmount?: number;
  /** Initial frequency toggle */
  defaultFrequency?: DonationFrequency;
  submitLabel?: string;
  /** Parent section theme — light uses neutral-050 card fill */
  sectionTheme?: SectionTheme;
  className?: string;
  onSubmit?: (data: { frequency: DonationFrequency; amount: number; currency: string }) => void;
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-4 shrink-0", className)}
    >
      <path
        d="M11 14H13C13.5304 14 14.0391 13.7893 14.4142 13.4142C14.7893 13.0391 15 12.5304 15 12C15 11.4696 14.7893 10.9609 14.4142 10.5858C14.0391 10.2107 13.5304 10 13 10H10C9.4 10 8.9 10.2 8.6 10.6L3 16M7 20L8.6 18.6C8.9 18.2 9.4 18 10 18H14C15.1 18 16.1 17.6 16.8 16.8L21.4 12.4C21.7859 12.0353 22.0111 11.5323 22.0261 11.0016C22.0411 10.4708 21.8447 9.95589 21.48 9.57C21.1153 9.18411 20.6123 8.95889 20.0816 8.94389C19.5508 8.92889 19.0359 9.12533 18.65 9.49L14.45 13.39M2 15L8 21M19.5 8.5C20.2 7.8 21 6.9 21 5.8C21.0699 5.18893 20.9314 4.57216 20.6069 4.04964C20.2825 3.52712 19.7911 3.12947 19.2124 2.92114C18.6337 2.71281 18.0016 2.706 17.4185 2.90182C16.8355 3.09763 16.3356 3.4846 16 4C15.643 3.52458 15.143 3.17613 14.5735 3.00578C14.0039 2.83544 13.3947 2.85219 12.8353 3.05356C12.2759 3.25494 11.7958 3.63034 11.4655 4.12465C11.1352 4.61896 10.972 5.20614 11 5.8C11 7 11.8 7.8 12.5 8.6L16 12L19.5 8.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className={cn("size-3 shrink-0", className)}>
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToggleButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-3xl border px-4 py-3 text-base font-semibold leading-none transition-colors lg:rounded-full",
        selected
          ? "border-kale bg-se-green-100 text-kale"
          : "border-neutral-250 bg-white text-kale hover:border-neutral-300",
      )}
    >
      {children}
    </button>
  );
}

function AmountButton({
  amount,
  selected,
  onClick,
}: {
  amount: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-3xl border px-4 py-3 text-base font-semibold leading-none transition-colors lg:rounded-full",
        selected
          ? "border-kale bg-se-green-100 text-kale"
          : "border-neutral-250 bg-white text-kale hover:border-neutral-300",
      )}
    >
      ${amount}
    </button>
  );
}

const DEFAULT_PRESETS = [500, 130, 85, 55, 25, 10];

export function DonationForm({
  presetAmounts = DEFAULT_PRESETS,
  defaultAmount = 10,
  defaultFrequency = "one-time",
  submitLabel = "Make a donation",
  sectionTheme = "dark",
  className,
  onSubmit,
}: DonationFormProps) {
  const [frequency, setFrequency] = useState<DonationFrequency>(defaultFrequency);
  const [amount, setAmount] = useState(defaultAmount);
  const [showComment, setShowComment] = useState(false);

  const presetSelected = presetAmounts.includes(amount);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.({ frequency, amount, currency: "USD" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-6 rounded-[var(--radius-md)] p-6 text-kale lg:rounded-[var(--radius-lg)] lg:p-10",
        sectionTheme === "light" ? "bg-neutral-050" : "bg-white",
        className,
      )}
    >
      <div className="flex gap-3">
        <ToggleButton
          selected={frequency === "one-time"}
          onClick={() => setFrequency("one-time")}
        >
          One-time
        </ToggleButton>
        <ToggleButton
          selected={frequency === "monthly"}
          onClick={() => setFrequency("monthly")}
        >
          <HeartIcon className="text-se-green-base" />
          Monthly
        </ToggleButton>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {presetAmounts.map((preset) => (
          <AmountButton
            key={preset}
            amount={preset}
            selected={presetSelected && amount === preset}
            onClick={() => setAmount(preset)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-3xl border border-neutral-250 px-5 py-4 lg:rounded-full">
          <label className="flex min-w-0 flex-1 items-baseline gap-2">
            <span className="text-xl font-semibold text-kale/70">$</span>
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value) || 0)}
              aria-label="Donation amount"
              className="min-w-0 flex-1 bg-transparent text-[clamp(28px,6vw,40px)] font-semibold leading-none tracking-[-0.04em] text-se-green-base outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-kale/70"
            aria-label="Currency"
          >
            USD
            <ChevronDownIcon />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowComment((open) => !open)}
          className="self-start text-sm font-medium text-kale underline underline-offset-2"
        >
          Add comment
        </button>

        {showComment && (
          <textarea
            rows={3}
            placeholder="Leave a note with your gift"
            aria-label="Donation comment"
            className="w-full resize-none rounded-2xl border border-neutral-250 bg-neutral-100 px-4 py-3 text-base leading-[1.4] text-kale placeholder:text-neutral-400 outline-none transition-colors focus:border-se-green-base lg:rounded-3xl"
          />
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        colorScheme="light"
        size="md"
        className="w-full rounded-3xl lg:rounded-[99px]"
      >
        {submitLabel}
      </Button>
    </form>
  );
}

export default DonationForm;
