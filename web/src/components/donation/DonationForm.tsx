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
  /** @deprecated Default variant now uses hero presets ($20 / $60 / $120 / $1,290) */
  presetAmounts?: number[];
  /** Initial selected preset amount */
  defaultAmount?: number;
  /** Initial frequency toggle — `default` variant only */
  defaultFrequency?: DonationFrequency;
  /** @deprecated Submit button uses dynamic "Give $N Now / Monthly" labels */
  submitLabel?: string;
  /** Home hero donate card — impact presets with Give Now / Give Monthly CTAs */
  variant?: DonationFormVariant;
  /** Eyebrow above the hero card heading — e.g. impact stat line */
  eyebrow?: string;
  /** Hide the built-in hero card heading — use when the parent section supplies title/body */
  hideHeader?: boolean;
  /** Replace the default hero card heading */
  headerTitle?: string;
  /** Hide the dynamic dollar-to-meals impact line */
  hideMealsImpact?: boolean;
  /** Compact intro widget — narrow card, single amount row, dynamic submit label */
  compact?: boolean;
  /** Tighter mobile sizing for hero overlay donate card (max-lg only) */
  mobileTight?: boolean;
  /** White hero card — per-amount color fills (banana, tangerine, etc.) without compact layout */
  coloredAmounts?: boolean;
  /** Hero card surface — dark: kale / brand-green; light: white / green-100 */
  formCard?: "white" | "brand-green" | "kale" | "green-100";
  /** Parent section theme — light uses neutral-050 card fill */
  sectionTheme?: SectionTheme;
  /** Nested inside a section card — reduces corner radius for even inset */
  inCard?: boolean;
  /** Looser gap between amount pills — default variant / DonationSection */
  relaxedAmountGrid?: boolean;
  /** Omit card shell — controls sit flush in a parent container (e.g. donate overlay) */
  embedded?: boolean;
  className?: string;
  onSubmit?: (data: { frequency: DonationFrequency; amount: number; currency: string }) => void;
}

const HERO_PRESET_AMOUNTS = [20, 60, 120, 1290] as const;

/** Selected-state solid fills — brand base tokens (bg-banana, not bg-banana-base) */
const HERO_AMOUNT_SELECTED_THEMES: Record<(typeof HERO_PRESET_AMOUNTS)[number], string> = {
  20: "border-0 bg-banana text-kale",
  60: "border-0 bg-tangerine text-kale",
  120: "border-0 bg-blueberry text-kale",
  1290: "border-0 bg-se-green text-white",
};

const HERO_AMOUNT_UNSELECTED_CLASS =
  "border border-neutral-250 bg-white text-kale hover:border-[var(--section-btn-hover,#003619)] hover:text-[var(--section-btn-hover,#003619)]";

const HERO_COMPACT_PILL_CLASS =
  "flex h-9 w-full min-w-0 cursor-pointer items-center justify-center rounded-[99px] px-2.5 text-base font-semibold leading-none transition-[border-color,color] duration-200";

const HERO_COMPACT_CONTROL_HEIGHT = "h-9";

/** Matches preset amount pills — keep Other control in sync */
const HERO_AMOUNT_CONTROL_HEIGHT = "h-11 lg:h-[45px]";

const HERO_AMOUNT_PILL_BASE_CLASS =
  "flex w-full min-w-0 cursor-pointer items-center justify-center rounded-3xl px-4 text-base font-semibold leading-none transition-[border-color,color,background-color] duration-200 lg:rounded-full";

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

function FrequencyToggleGroup({
  frequency,
  onFrequencyChange,
  onBrandGreen,
  onceLabel = "Give Now",
  monthlyLabel = "Give Monthly",
  compactLight = false,
  compact = false,
  mobileTight = false,
}: {
  frequency: DonationFrequency;
  onFrequencyChange: (frequency: DonationFrequency) => void;
  onBrandGreen: boolean;
  onceLabel?: string;
  monthlyLabel?: string;
  /** White intro widget — green-100 sliding pill, kale labels */
  compactLight?: boolean;
  compact?: boolean;
  mobileTight?: boolean;
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
              compact
                ? cn(HERO_COMPACT_CONTROL_HEIGHT, "text-base")
                : cn(
                    "h-9 px-3 text-sm lg:h-[45px] lg:py-0",
                    mobileTight && "max-lg:h-8 max-lg:px-2 max-lg:text-xs",
                  ),
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

const HERO_AMOUNT_PILL_CLASS = "w-auto shrink-0";

function HeroAmountPill({
  amount,
  selected,
  onClick,
  onBrandGreen,
  compact = false,
  coloredPillStyle = false,
  mobileTight = false,
  className,
}: {
  amount: number;
  selected: boolean;
  onClick: () => void;
  onBrandGreen: boolean;
  compact?: boolean;
  coloredPillStyle?: boolean;
  mobileTight?: boolean;
  className?: string;
}) {
  const formattedAmount =
    amount >= 1000 ? formatLargeNumber(amount) : String(amount);

  if (coloredPillStyle) {
    const theme =
      HERO_AMOUNT_SELECTED_THEMES[amount as (typeof HERO_PRESET_AMOUNTS)[number]];

    if (compact) {
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

    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onClick}
        className={cn(
          HERO_AMOUNT_PILL_BASE_CLASS,
          HERO_AMOUNT_CONTROL_HEIGHT,
          mobileTight && "max-lg:h-10 max-lg:px-3 max-lg:text-sm",
          selected && theme ? theme : HERO_AMOUNT_UNSELECTED_CLASS,
          className,
        )}
      >
        ${formattedAmount}
      </button>
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
  coloredPillStyle = false,
  mobileTight = false,
  className,
}: {
  selected: boolean;
  value: string;
  onFocus: () => void;
  onChange: (value: string) => void;
  onBrandGreen: boolean;
  compact?: boolean;
  coloredPillStyle?: boolean;
  mobileTight?: boolean;
  className?: string;
}) {
  if (coloredPillStyle) {
    const controlHeightClass = compact
      ? HERO_COMPACT_CONTROL_HEIGHT
      : cn(HERO_AMOUNT_CONTROL_HEIGHT, mobileTight && "max-lg:h-10");
    const textSizeClass = compact
      ? "text-base"
      : cn("text-sm lg:text-base", mobileTight && "max-lg:text-sm");

    if (!selected) {
      if (compact) {
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
        <button
          type="button"
          aria-pressed={false}
          onClick={onFocus}
          className={cn(
            HERO_AMOUNT_PILL_BASE_CLASS,
            HERO_AMOUNT_CONTROL_HEIGHT,
            mobileTight && "max-lg:h-10 max-lg:px-3 max-lg:text-sm",
            HERO_AMOUNT_UNSELECTED_CLASS,
            className,
          )}
        >
          $ Other
        </button>
      );
    }

    return (
      <label
        className={cn(
          "relative flex w-full min-w-0 shrink-0 items-center",
          controlHeightClass,
          className,
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute left-3 z-10 font-semibold leading-none text-kale/70 lg:left-4",
            textSizeClass,
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
          theme="onWhite"
          className={cn(
            "box-border h-full min-h-0 w-full min-w-0 rounded-[99px] border py-0 pl-7 pr-2 font-semibold leading-none lg:pl-8 lg:pr-4",
            textSizeClass,
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
        "relative inline-flex w-full min-w-0 shrink-0 items-center",
        HERO_AMOUNT_CONTROL_HEIGHT,
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
          "box-border h-full min-h-0 w-full min-w-0 rounded-[99px] border py-0 pl-8 pr-4 text-sm font-semibold leading-none lg:text-base",
          onBrandGreen
            ? "border-0 bg-white text-[var(--section-btn-primary-label,#003619)] placeholder:text-[var(--section-btn-primary-label,#003619)]/60 focus:border-0"
            : "border-0 bg-[var(--section-btn-primary-bg,#00843d)] text-[var(--section-btn-primary-label,#ffffff)] placeholder:text-[var(--section-btn-primary-label,#ffffff)]/70 focus:border-0",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
      />
    </label>
  );
}

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
  defaultFrequency = "one-time",
  eyebrow,
  hideHeader = false,
  headerTitle,
  hideMealsImpact = false,
  compact = false,
  coloredAmounts = false,
  mobileTight = false,
  relaxedAmountGrid = false,
  embedded = false,
  formCard = "brand-green",
  onSubmit,
}: Pick<
  DonationFormProps,
  | "sectionTheme"
  | "inCard"
  | "className"
  | "defaultAmount"
  | "defaultFrequency"
  | "eyebrow"
  | "hideHeader"
  | "headerTitle"
  | "hideMealsImpact"
  | "compact"
  | "coloredAmounts"
  | "mobileTight"
  | "relaxedAmountGrid"
  | "embedded"
  | "formCard"
  | "onSubmit"
>) {
  const [frequency, setFrequency] = useState<DonationFrequency>(defaultFrequency);
  const [amount, setAmount] = useState(defaultAmount);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const isDarkFormCard = formCard === "brand-green" || formCard === "kale";
  const coloredPillStyle = !isDarkFormCard && (compact || coloredAmounts);
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
        !embedded && !compact && cn("gap-4 p-4 sm:p-5 lg:p-6", mobileTight && "max-lg:gap-3 max-lg:p-3"),
        className,
      )}
      formCard={formCard}
      onSubmit={handleSubmit}
    >
      <div
        className={cn(
          "flex w-full min-w-0 flex-col",
          compact ? "gap-3" : cn("gap-4", mobileTight && "max-lg:gap-2.5"),
        )}
      >
        {!hideHeader && (
          <div
            className={cn(
              "flex w-full min-w-0 flex-col gap-1.5",
              mobileTight && "max-lg:gap-1",
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
                "w-full min-w-0 font-sans font-medium leading-[1.2] tracking-[-0.03em]",
                mobileTight
                  ? "text-[clamp(1.25rem,4vw,1.75rem)] max-lg:text-lg max-lg:leading-[1.25] max-lg:tracking-[-0.025em] lg:text-[1.75rem]"
                  : "text-[clamp(1.25rem,4vw,1.75rem)] lg:text-[1.75rem]",
                !headerTitle && "lg:whitespace-nowrap",
                isDarkFormCard ? "text-white" : "text-kale",
              )}
            >
              {headerTitle ?? (
                <>
                  <span className="max-lg:block">The food is donated;</span>
                  <em className={cn("not-italic", headerEmphasisClass)}>your gift moves it.</em>
                </>
              )}
            </h3>
            {!hideMealsImpact && !coloredPillStyle && (
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
            )}
          </div>
        )}

        <FrequencyToggleGroup
          frequency={frequency}
          onFrequencyChange={setFrequency}
          onBrandGreen={isDarkFormCard}
          compactLight={coloredPillStyle}
          compact={compact}
          mobileTight={mobileTight}
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
                coloredPillStyle={coloredPillStyle}
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
              coloredPillStyle={coloredPillStyle}
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
                coloredPillStyle={coloredPillStyle}
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
          <div
            className={cn(
              "grid grid-cols-3",
              coloredPillStyle
                ? relaxedAmountGrid
                  ? "gap-2 sm:gap-3"
                  : cn(
                      "gap-x-1 gap-y-1.5",
                      mobileTight && "max-lg:gap-x-0.5 max-lg:gap-y-1",
                    )
                : "gap-2 sm:gap-3",
            )}
          >
            {HERO_PRESET_AMOUNTS.slice(0, 3).map((presetAmount) => (
              <HeroAmountPill
                key={presetAmount}
                amount={presetAmount}
                selected={!isCustomAmount && amount === presetAmount}
                onBrandGreen={isDarkFormCard}
                coloredPillStyle={coloredPillStyle}
                mobileTight={mobileTight}
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
              coloredPillStyle={coloredPillStyle}
              mobileTight={mobileTight}
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
                coloredPillStyle={coloredPillStyle}
                mobileTight={mobileTight}
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

        {coloredPillStyle && !hideMealsImpact && (
          <p
            aria-live="polite"
            className={cn(
              "text-center font-medium leading-snug text-kale",
              mobileTight
                ? "text-sm max-lg:leading-tight lg:text-lg"
                : "text-base lg:text-lg",
            )}
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
          className={cn("w-full", mobileTight && "max-lg:h-10 max-lg:text-sm")}
        >
          {dynamicSubmitLabel}
        </Button>
      </div>
    </DonationFormShell>
  );
}

function DefaultDonationForm({
  defaultAmount = 20,
  defaultFrequency = "one-time",
  sectionTheme = "dark",
  inCard = false,
  className,
  hideHeader = true,
  hideMealsImpact = false,
  headerTitle,
  eyebrow,
  onSubmit,
}: DonationFormProps) {
  return (
    <HeroDonationForm
      sectionTheme={sectionTheme}
      inCard={inCard}
      className={className}
      defaultAmount={defaultAmount}
      defaultFrequency={defaultFrequency}
      hideHeader={hideHeader}
      hideMealsImpact={hideMealsImpact}
      headerTitle={headerTitle}
      eyebrow={eyebrow}
      coloredAmounts
      relaxedAmountGrid
      formCard="white"
      onSubmit={onSubmit}
    />
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
