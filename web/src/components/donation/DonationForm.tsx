import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { cn } from "@/lib/cn";
import { formatLargeNumber } from "@/lib/formatNumber";
import type { SectionTheme } from "@/lib/types";
import { eyebrowClassName } from "@/lib/typography";
import { SECTION_CARD_NESTED_RADIUS_CLASS } from "@/sections/sectionCardConfig";
import { useState, type ReactNode } from "react";

export type DonationFrequency = "one-time" | "monthly";
export type DonationFormVariant = "default" | "hero";

export interface DonationFormProps {
  /** Preset amount options shown in the grid — `default` variant only */
  presetAmounts?: number[];
  /** Initial selected preset amount */
  defaultAmount?: number;
  /** Initial frequency toggle — `default` variant only */
  defaultFrequency?: DonationFrequency;
  submitLabel?: string;
  /** Home hero donate card — impact presets with Give Now / Give Monthly CTAs */
  variant?: DonationFormVariant;
  /** Eyebrow above the hero card heading — e.g. impact stat line */
  eyebrow?: string;
  /** Hide the built-in hero card heading — use when the parent section supplies title/body */
  hideHeader?: boolean;
  /** Hide the built-in hero card heading — use when the parent section supplies title/body */
  hideHeader?: boolean;
  /** Parent section theme — light uses neutral-050 card fill */
  sectionTheme?: SectionTheme;
  /** Nested inside a section card — reduces corner radius for even inset */
  inCard?: boolean;
  className?: string;
  onSubmit?: (data: { frequency: DonationFrequency; amount: number; currency: string }) => void;
}

const HERO_PRESETS = [
  { amount: 20, impact: "240 meals" },
  { amount: 60, impact: "720 meals" },
  { amount: 120, impact: "1,440 meals" },
  { amount: 1290, impact: "a full truckload" },
] as const;

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
        "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-3xl border px-4 py-3 text-base font-semibold leading-none transition-colors lg:rounded-full",
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
        "cursor-pointer rounded-3xl border px-4 py-3 text-base font-semibold leading-none transition-colors lg:rounded-full",
        selected
          ? "border-kale bg-se-green-100 text-kale"
          : "border-neutral-250 bg-white text-kale hover:border-neutral-300",
      )}
    >
      ${amount}
    </button>
  );
}

/** Per-index accent themes for the hero preset buttons (green → banana → tangerine → blueberry) */
const HERO_BUTTON_THEMES = [
  {
    selected: "border-kale bg-se-green-100 text-kale",
    impact: "text-kale",
  },
  {
    selected: "border-banana-700 bg-banana-100 text-banana-700",
    impact: "text-banana-700",
  },
  {
    selected: "border-tangerine-700 bg-tangerine-100 text-tangerine-700",
    impact: "text-tangerine-700",
  },
  {
    selected: "border-blueberry-700 bg-blueberry-100 text-blueberry-700",
    impact: "text-blueberry-700",
  },
] as const;

function ImpactAmountButton({
  amount,
  impact,
  selected,
  onClick,
  colorIndex = 0,
}: {
  amount: number;
  impact?: string;
  selected: boolean;
  onClick: () => void;
  colorIndex?: number;
}) {
  const formattedAmount =
    amount >= 1000 ? formatLargeNumber(amount) : String(amount);

  const theme = HERO_BUTTON_THEMES[colorIndex % HERO_BUTTON_THEMES.length];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 transition-colors sm:px-3 sm:py-3",
        selected
          ? theme.selected
          : "border-neutral-250 bg-white text-kale hover:border-neutral-300",
      )}
    >
      <span className="text-sm font-semibold leading-none sm:text-base">
        ${formattedAmount}
      </span>
      {impact && (
        <span
          className={cn(
            "text-center text-xs font-medium leading-tight",
            selected ? theme.impact : "text-kale/70",
          )}
        >
          {impact}
        </span>
      )}
    </button>
  );
}

function OtherAmountInput({
  selected,
  value,
  onFocus,
  onChange,
}: {
  selected: boolean;
  value: string;
  onFocus: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative flex h-full w-full min-w-0 items-center">
      <span className="pointer-events-none absolute left-4 z-10 text-base font-semibold leading-none text-kale/70">
        $
      </span>
      <TextInput
        type="number"
        min={1}
        step={1}
        value={value}
        placeholder="Other"
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Custom donation amount"
        theme="onWhite"
        className={cn(
          "h-full rounded-2xl pl-8 font-semibold leading-none placeholder:text-kale/70",
          selected
            ? "border-kale bg-se-green-100 focus:border-kale"
            : "border-neutral-250 bg-white",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
      />
    </label>
  );
}

const DEFAULT_PRESETS = [500, 130, 85, 55, 25, 10];

function DonationFormShell({
  sectionTheme,
  inCard,
  className,
  children,
  onSubmit,
  formCard,
}: {
  sectionTheme: SectionTheme;
  inCard: boolean;
  className?: string;
  children: ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
  /** White/nested form cards reset button tokens inside dark sections */
  formCard?: "white";
}) {
  return (
    <form
      onSubmit={onSubmit}
      data-form-card={formCard}
      className={cn(
        "@container flex w-full min-w-0 flex-col gap-6 p-4 text-kale sm:p-6 lg:p-10",
        inCard
          ? SECTION_CARD_NESTED_RADIUS_CLASS
          : "rounded-[var(--radius-lg)] lg:rounded-[var(--radius-xl)]",
        sectionTheme === "light" ? "bg-neutral-050" : "bg-white",
        className,
      )}
    >
      {children}
    </form>
  );
}

function HeroDonationForm({
  sectionTheme,
  inCard,
  className,
  defaultAmount = 20,
  eyebrow,
  hideHeader = false,
  onSubmit,
}: Pick<
  DonationFormProps,
  "sectionTheme" | "inCard" | "className" | "defaultAmount" | "eyebrow" | "hideHeader" | "onSubmit"
>) {
  const [amount, setAmount] = useState(defaultAmount);
  const [isOther, setIsOther] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const handleGive = (frequency: DonationFrequency) => {
    const donationAmount = isOther ? Number(customAmount) || 0 : amount;
    onSubmit?.({ frequency, amount: donationAmount, currency: "USD" });
  };

  return (
    <DonationFormShell
      sectionTheme={sectionTheme ?? "dark"}
      inCard={inCard ?? false}
      className={className}
      formCard="white"
    >
      <div className="flex w-full min-w-0 flex-col gap-6">
        {!hideHeader && (
          <div className="flex w-full min-w-0 flex-col gap-2">
            {eyebrow && (
              <p className={cn(eyebrowClassName, "text-kale")}>{eyebrow}</p>
            )}
            <h3 className="w-full min-w-0 font-sans text-[clamp(1.875rem,10cqw,3rem)] font-medium leading-[1.12] tracking-[-0.04em] text-kale">
              The food is donated;{" "}
              <em className="not-italic text-se-green">your gift moves it.</em>
            </h3>
          </div>
        )}

        <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
          {HERO_PRESETS.slice(0, 3).map((preset, i) => (
            <ImpactAmountButton
              key={preset.amount}
              amount={preset.amount}
              impact={preset.impact}
              selected={!isOther && amount === preset.amount}
              colorIndex={i}
              onClick={() => {
                setIsOther(false);
                setCustomAmount("");
                setAmount(preset.amount);
              }}
            />
          ))}
        </div>

        <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
          <ImpactAmountButton
            amount={HERO_PRESETS[3].amount}
            impact={HERO_PRESETS[3].impact}
            selected={!isOther && amount === HERO_PRESETS[3].amount}
            colorIndex={3}
            onClick={() => {
              setIsOther(false);
              setCustomAmount("");
              setAmount(HERO_PRESETS[3].amount);
            }}
          />
          <div className="col-span-2 min-w-0">
            <OtherAmountInput
              selected={isOther}
              value={customAmount}
              onFocus={() => {
                if (!isOther) {
                  setCustomAmount("");
                }
                setIsOther(true);
              }}
              onChange={(value) => {
                setIsOther(true);
                setCustomAmount(value);
              }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="primary"
            colorScheme="light"
            size="md"
            className="flex-1 rounded-2xl"
            onClick={() => handleGive("one-time")}
          >
            Give Now
          </Button>
          <Button
            type="button"
            variant="secondary"
            colorScheme="light"
            size="md"
            className="flex-1 rounded-2xl"
            onClick={() => handleGive("monthly")}
          >
            Give Monthly
          </Button>
        </div>
      </div>
    </DonationFormShell>
  );
}

function DefaultDonationForm({
  presetAmounts = DEFAULT_PRESETS,
  defaultAmount = 10,
  defaultFrequency = "one-time",
  submitLabel = "Make a donation",
  sectionTheme = "dark",
  inCard = false,
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
    <DonationFormShell
      sectionTheme={sectionTheme}
      inCard={inCard}
      className={className}
      formCard="white"
      onSubmit={handleSubmit}
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
            className="flex shrink-0 cursor-pointer items-center gap-1 text-sm font-medium text-kale/70"
            aria-label="Currency"
          >
            USD
            <ChevronDownIcon />
          </button>
        </div>

        <Button
          type="button"
          variant="tertiary"
          colorScheme="light"
          size="sm"
          onClick={() => setShowComment((open) => !open)}
          className="self-start"
        >
          Add comment
        </Button>

        {showComment && (
          <textarea
            rows={3}
            placeholder="Leave a note with your gift"
            aria-label="Donation comment"
            className="w-full resize-none rounded-[var(--radius-sm)] border border-neutral-250 bg-neutral-100 px-4 py-3 text-base leading-[1.4] text-kale placeholder:text-neutral-400 outline-none transition-colors focus:border-se-green-base"
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
    </DonationFormShell>
  );
}

export function DonationForm({
  variant = "default",
  ...props
}: DonationFormProps) {
  if (variant === "hero") {
    return <HeroDonationForm {...props} />;
  }

  return <DefaultDonationForm {...props} />;
}

export default DonationForm;
