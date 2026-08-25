import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { cn } from "@/lib/cn";
import { formatDollarAmount, formatLargeNumber } from "@/lib/formatNumber";
import {
  buttonSecondaryScaleSpring,
  motion,
  useReducedMotion,
} from "@/lib/motion";
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
  /** Compact intro widget — narrow card, single amount row, dynamic submit label */
  compact?: boolean;
  /** Hero card surface — dark: kale / brand-green; light: white / green-100 */
  formCard?: "white" | "brand-green" | "kale" | "green-100";
  /** Parent section theme — light uses neutral-050 card fill */
  sectionTheme?: SectionTheme;
  /** Nested inside a section card — reduces corner radius for even inset */
  inCard?: boolean;
  /** Omit card shell — controls sit flush in a parent container (e.g. donate overlay) */
  embedded?: boolean;
  className?: string;
  onSubmit?: (data: { frequency: DonationFrequency; amount: number; currency: string }) => void;
}

const HERO_PRESET_AMOUNTS = [20, 60, 120, 1290] as const;

/** Selected-state solid fills — brand base tokens (bg-banana, not bg-banana-base) */
const HERO_AMOUNT_SELECTED_THEMES: Record<(typeof HERO_PRESET_AMOUNTS)[number], string> = {
  20: "bg-banana text-kale",
  60: "bg-tangerine text-kale",
  120: "bg-blueberry text-kale",
  1290: "bg-se-green text-white",
};

const HERO_AMOUNT_UNSELECTED_CLASS =
  "border border-neutral-250 bg-white text-kale hover:border-[var(--section-btn-hover,#003619)] hover:text-[var(--section-btn-hover,#003619)]";

const HERO_COMPACT_PILL_CLASS =
  "flex h-9 w-full min-w-0 cursor-pointer items-center justify-center rounded-[99px] px-2.5 text-base font-semibold leading-none transition-[border-color,color] duration-200";

const HERO_COMPACT_CONTROL_HEIGHT = "h-9";

function CompactAmountPill({
  children,
  className,
  onClick,
  selected,
  theme,
  ariaPressed,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
  selected: boolean;
  theme?: string;
  ariaPressed?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const classNames = cn(
    HERO_COMPACT_PILL_CLASS,
    className,
    selected && theme ? theme : HERO_AMOUNT_UNSELECTED_CLASS,
  );

  if (reduceMotion) {
    return (
      <button
        type="button"
        aria-pressed={ariaPressed ?? selected}
        onClick={onClick}
        className={classNames}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      aria-pressed={ariaPressed ?? selected}
      onClick={onClick}
      className={classNames}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.04 }}
      transition={{ scale: buttonSecondaryScaleSpring }}
    >
      {children}
    </motion.button>
  );
}

/** Matches donation page copy — $1 provides 12 meals. */
const MEALS_PER_DOLLAR = 12;

function heroMealsFromAmount(dollars: number): number {
  return Math.round(Math.max(0, dollars) * MEALS_PER_DOLLAR);
}

function getHeroSelectedAmount(amount: number): number {
  return Math.max(0, amount);
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

function FrequencyToggleGroup({
  frequency,
  onFrequencyChange,
  onBrandGreen,
  onceLabel = "Give Now",
  monthlyLabel = "Give Monthly",
  compactLight = false,
  compact = false,
}: {
  frequency: DonationFrequency;
  onFrequencyChange: (frequency: DonationFrequency) => void;
  onBrandGreen: boolean;
  onceLabel?: string;
  monthlyLabel?: string;
  /** White intro widget — green-100 sliding pill, kale labels */
  compactLight?: boolean;
  compact?: boolean;
}) {
  const segments: { id: DonationFrequency; label: string }[] = [
    { id: "one-time", label: onceLabel },
    { id: "monthly", label: monthlyLabel },
  ];

  const useGreen100Indicator = compactLight && !onBrandGreen;

  return (
    <div
      role="group"
      aria-label="Donation frequency"
      className={cn(
        "relative grid w-full grid-cols-2 rounded-[99px] p-0.5",
        onBrandGreen ? "border border-white/30 bg-white/10" : "border border-neutral-250 bg-white",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-[99px] transition-transform duration-200 ease-out",
          onBrandGreen
            ? "bg-white"
            : useGreen100Indicator
              ? "bg-se-green-100"
              : "bg-[var(--section-btn-primary-bg,#00843d)]",
          frequency === "monthly" && "translate-x-full",
        )}
      />
      {segments.map((segment) => {
        const selected = frequency === segment.id;

        return (
          <button
            key={segment.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onFrequencyChange(segment.id)}
            className={cn(
              "relative z-10 flex cursor-pointer items-center justify-center rounded-[99px] border-0 bg-transparent px-2.5 font-semibold leading-none transition-colors",
              compact ? cn(HERO_COMPACT_CONTROL_HEIGHT, "text-base") : "h-9 px-3 text-sm lg:h-[45px] lg:py-0",
              selected
                ? onBrandGreen
                  ? "text-[var(--section-btn-primary-label,#003619)]"
                  : useGreen100Indicator
                    ? "text-kale"
                    : "text-[var(--section-btn-primary-label,#ffffff)]"
                : onBrandGreen
                  ? "text-white/85 hover:text-white"
                  : "text-kale/70 hover:text-kale",
            )}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
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

const HERO_AMOUNT_PILL_CLASS = "w-auto shrink-0";

function HeroAmountPill({
  amount,
  selected,
  onClick,
  onBrandGreen,
  compact = false,
  className,
}: {
  amount: number;
  selected: boolean;
  onClick: () => void;
  onBrandGreen: boolean;
  compact?: boolean;
  className?: string;
}) {
  const formattedAmount =
    amount >= 1000 ? formatLargeNumber(amount) : String(amount);

  if (compact && !onBrandGreen) {
    const theme =
      HERO_AMOUNT_SELECTED_THEMES[amount as (typeof HERO_PRESET_AMOUNTS)[number]];

    return (
      <CompactAmountPill
        selected={selected}
        theme={selected ? theme : undefined}
        className={className}
        onClick={onClick}
      >
        ${formattedAmount}
      </CompactAmountPill>
    );
  }

  const colorScheme = onBrandGreen ? "dark" : "light";

  return (
    <Button
      type="button"
      variant={selected ? "primary" : "secondary"}
      colorScheme={colorScheme}
      size="sm"
      simpleLabel
      aria-pressed={selected}
      onClick={onClick}
      className={cn(HERO_AMOUNT_PILL_CLASS, className, !onBrandGreen && !selected && "bg-white")}
    >
      ${formattedAmount}
    </Button>
  );
}

function HeroOtherAmountInput({
  selected,
  value,
  onFocus,
  onChange,
  onBrandGreen,
  compact = false,
  className,
}: {
  selected: boolean;
  value: string;
  onFocus: () => void;
  onChange: (value: string) => void;
  onBrandGreen: boolean;
  compact?: boolean;
  className?: string;
}) {
  if (compact && !onBrandGreen) {
    if (!selected) {
      return (
        <CompactAmountPill
          selected={false}
          ariaPressed={false}
          className={className}
          onClick={onFocus}
        >
          $ Other
        </CompactAmountPill>
      );
    }

    return (
      <label className={cn("relative flex w-full min-w-0 items-center", HERO_COMPACT_CONTROL_HEIGHT, className)}>
        <span className="pointer-events-none absolute left-3 z-10 text-base font-semibold leading-none text-kale/70">
          $
        </span>
        <TextInput
          type="number"
          min={1}
          step={1}
          value={value}
          placeholder="Other"
          autoFocus
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Custom donation amount"
          theme="onWhite"
          className={cn(
            "h-full w-full min-w-0 rounded-[99px] py-0 pl-7 pr-2 text-base font-semibold leading-none",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
        />
      </label>
    );
  }

  const colorScheme = onBrandGreen ? "dark" : "light";

  if (!selected) {
    return (
      <Button
        type="button"
        variant="secondary"
        colorScheme={colorScheme}
        size="sm"
        simpleLabel
        aria-pressed={false}
        onClick={onFocus}
        className={cn(HERO_AMOUNT_PILL_CLASS, className, !onBrandGreen && "bg-white")}
      >
        $ Other
      </Button>
    );
  }

  return (
    <label
      className={cn(
        "relative inline-flex h-11 w-full min-w-0 items-center lg:h-[45px]",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-4 z-10 text-sm font-semibold leading-none lg:text-base",
          onBrandGreen
            ? "text-[var(--section-btn-primary-label,#003619)]"
            : "text-[var(--section-btn-primary-label,#ffffff)]",
        )}
      >
        $
      </span>
      <TextInput
        type="number"
        min={1}
        step={1}
        value={value}
        placeholder="Other"
        autoFocus
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Custom donation amount"
        theme={onBrandGreen ? "onColor" : "onWhite"}
        className={cn(
          "h-full w-full min-w-0 rounded-[99px] pl-8 pr-4 text-sm font-semibold leading-none lg:text-base",
          onBrandGreen
            ? "border-0 bg-white text-[var(--section-btn-primary-label,#003619)] placeholder:text-[var(--section-btn-primary-label,#003619)]/60 focus:border-0"
            : "border-0 bg-[var(--section-btn-primary-bg,#00843d)] text-[var(--section-btn-primary-label,#ffffff)] placeholder:text-[var(--section-btn-primary-label,#ffffff)]/70 focus:border-0",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
      />
    </label>
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

const DEFAULT_PRESETS = [500, 130, 85, 55, 25, 10];

function DonationFormShell({
  sectionTheme,
  inCard,
  className,
  children,
  onSubmit,
  formCard,
  compact = false,
  embedded = false,
}: {
  sectionTheme: SectionTheme;
  inCard: boolean;
  className?: string;
  children: ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
  /** Form card tone — drives button tokens via `data-form-card` in global.css */
  formCard?: "white" | "brand-green" | "kale" | "green-100";
  /** Tight card inset — overrides default shell padding at all breakpoints */
  compact?: boolean;
  embedded?: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      data-form-card={formCard}
      className={cn(
        "@container flex w-full min-w-0 flex-col",
        embedded
          ? "gap-4 text-kale"
          : cn(
              compact ? "p-4 sm:p-4 lg:p-5" : "gap-6 p-4 sm:p-6 lg:p-10",
              compact
                ? "rounded-[var(--radius-md)] lg:rounded-[var(--radius-lg)]"
                : inCard
                  ? SECTION_CARD_NESTED_RADIUS_CLASS
                  : "rounded-[var(--radius-lg)] lg:rounded-[var(--radius-xl)]",
              formCard === "brand-green"
                ? "bg-se-green text-white"
                : formCard === "kale"
                  ? "bg-kale text-white"
                  : formCard === "green-100"
                    ? "bg-se-green-100 text-kale"
                    : cn(
                        "text-kale",
                        formCard === "white"
                          ? "bg-white"
                          : sectionTheme === "light"
                            ? "bg-neutral-050"
                            : "bg-white",
                      ),
            ),
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
  compact = false,
  embedded = false,
  formCard = "brand-green",
  onSubmit,
}: Pick<
  DonationFormProps,
  | "sectionTheme"
  | "inCard"
  | "className"
  | "defaultAmount"
  | "eyebrow"
  | "hideHeader"
  | "compact"
  | "embedded"
  | "formCard"
  | "onSubmit"
>) {
  const [frequency, setFrequency] = useState<DonationFrequency>("one-time");
  const [amount, setAmount] = useState(defaultAmount);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const isDarkFormCard = formCard === "brand-green" || formCard === "kale";
  const buttonScheme = isDarkFormCard ? "dark" : "light";
  const selectedAmount = getHeroSelectedAmount(
    isCustomAmount ? Number(customAmount) || amount : amount,
  );
  const selectedMeals = heroMealsFromAmount(selectedAmount);
  const headerEmphasisClass = isDarkFormCard ? "text-bright-kelly" : "text-se-green-base";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.({ frequency, amount: selectedAmount, currency: "USD" });
  };

  const dynamicSubmitLabel =
    frequency === "monthly"
      ? `Give ${formatDollarAmount(selectedAmount)} Monthly`
      : `Give ${formatDollarAmount(selectedAmount)} Now`;

  return (
    <DonationFormShell
      sectionTheme={sectionTheme ?? "dark"}
      inCard={inCard ?? false}
      compact={compact}
      embedded={embedded}
      className={cn(
        !embedded && compact && "border border-neutral-250",
        !embedded && !compact && "gap-4 p-4 sm:p-5 lg:p-6",
        className,
      )}
      formCard={formCard}
      onSubmit={handleSubmit}
    >
      <div className={cn("flex w-full min-w-0 flex-col", compact ? "gap-3" : "gap-4")}>
        {!hideHeader && (
          <div
            className={cn(
              "flex w-full min-w-0 flex-col gap-1.5",
              !isDarkFormCard && "items-center text-center",
            )}
          >
            {eyebrow && (
              <p className={cn(eyebrowClassName, isDarkFormCard ? "text-white/80" : "text-kale/70")}>
                {eyebrow}
              </p>
            )}
            <h3
              className={cn(
                "w-full min-w-0 font-sans text-[clamp(1.25rem,4vw,1.75rem)] font-medium leading-[1.2] tracking-[-0.03em] lg:text-[1.75rem] lg:whitespace-nowrap",
                isDarkFormCard ? "text-white" : "text-kale",
              )}
            >
              The food is donated;{" "}
              <em className={cn("not-italic", headerEmphasisClass)}>your gift moves it.</em>
            </h3>
            <p
              aria-live="polite"
              className={cn(
                "text-base font-medium leading-snug",
                isDarkFormCard ? "text-white/85" : "text-kale/80",
              )}
            >
              {formatDollarAmount(selectedAmount)} ={" "}
              <span className={cn("font-semibold", headerEmphasisClass)}>
                {formatLargeNumber(selectedMeals)} meals
              </span>
              .
            </p>
          </div>
        )}

        <FrequencyToggleGroup
          frequency={frequency}
          onFrequencyChange={setFrequency}
          onBrandGreen={isDarkFormCard}
          compactLight={compact && !isDarkFormCard}
          compact={compact}
        />

        {compact ? (
          <div className="grid grid-cols-3 gap-1">
            {HERO_PRESET_AMOUNTS.slice(0, 3).map((presetAmount) => (
              <HeroAmountPill
                key={presetAmount}
                amount={presetAmount}
                selected={!isCustomAmount && amount === presetAmount}
                onBrandGreen={isDarkFormCard}
                compact
                onClick={() => {
                  setIsCustomAmount(false);
                  setCustomAmount("");
                  setAmount(presetAmount);
                }}
              />
            ))}
            <HeroAmountPill
              amount={HERO_PRESET_AMOUNTS[3]}
              selected={!isCustomAmount && amount === HERO_PRESET_AMOUNTS[3]}
              onBrandGreen={isDarkFormCard}
              compact
              onClick={() => {
                setIsCustomAmount(false);
                setCustomAmount("");
                setAmount(HERO_PRESET_AMOUNTS[3]);
              }}
            />
            <div className="col-span-2 min-w-0">
              <HeroOtherAmountInput
                selected={isCustomAmount}
                value={customAmount}
                onBrandGreen={isDarkFormCard}
                compact
                className="w-full"
                onFocus={() => {
                  if (!isCustomAmount) {
                    setCustomAmount("");
                  }
                  setIsCustomAmount(true);
                }}
                onChange={(value) => {
                  setIsCustomAmount(true);
                  setCustomAmount(value);
                  setAmount(Number(value) || 0);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {HERO_PRESET_AMOUNTS.slice(0, 3).map((presetAmount) => (
              <HeroAmountPill
                key={presetAmount}
                amount={presetAmount}
                selected={!isCustomAmount && amount === presetAmount}
                onBrandGreen={isDarkFormCard}
                className="w-full"
                onClick={() => {
                  setIsCustomAmount(false);
                  setCustomAmount("");
                  setAmount(presetAmount);
                }}
              />
            ))}
            <HeroAmountPill
              amount={HERO_PRESET_AMOUNTS[3]}
              selected={!isCustomAmount && amount === HERO_PRESET_AMOUNTS[3]}
              onBrandGreen={isDarkFormCard}
              className="w-full"
              onClick={() => {
                setIsCustomAmount(false);
                setCustomAmount("");
                setAmount(HERO_PRESET_AMOUNTS[3]);
              }}
            />
            <div className="col-span-2 min-w-0">
              <HeroOtherAmountInput
                selected={isCustomAmount}
                value={customAmount}
                onBrandGreen={isDarkFormCard}
                className="w-full"
                onFocus={() => {
                  if (!isCustomAmount) {
                    setCustomAmount("");
                  }
                  setIsCustomAmount(true);
                }}
                onChange={(value) => {
                  setIsCustomAmount(true);
                  setCustomAmount(value);
                  setAmount(Number(value) || 0);
                }}
              />
            </div>
          </div>
        )}

        {compact && (
          <p
            aria-live="polite"
            className="text-center text-base font-medium leading-snug text-kale lg:text-lg"
          >
            {formatDollarAmount(selectedAmount)} ={" "}
            <span className="font-semibold text-se-green">
              {formatLargeNumber(selectedMeals)} meals
            </span>
            .
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          colorScheme={buttonScheme}
          size="md"
          className="w-full"
        >
          {compact ? dynamicSubmitLabel : frequency === "monthly" ? "Give Monthly" : "Give Now"}
        </Button>
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
