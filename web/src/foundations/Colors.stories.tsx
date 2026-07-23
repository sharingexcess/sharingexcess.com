import type { Meta, StoryObj } from "@storybook/react";

interface SwatchData {
  label: string;
  cssVar: string;
  hex: string;
}

const brand: SwatchData[] = [
  { label: "se-green",     cssVar: "--color-se-green-base", hex: "#00843D" },
  { label: "bright-kelly", cssVar: "--color-bright-kelly",  hex: "#00BC57" },
  { label: "kale",         cssVar: "--color-kale",          hex: "#003619" },
];

const seGreen: SwatchData[] = [
  { label: "se-green",     cssVar: "--color-se-green-base", hex: "#00843D" },
  { label: "se-green-050", cssVar: "--color-se-green-050",  hex: "#ECF8EC" },
  { label: "se-green-100", cssVar: "--color-se-green-100",  hex: "#D8F0D8" },
  { label: "se-green-200", cssVar: "--color-se-green-200",  hex: "#AFDBB8" },
  { label: "se-green-300", cssVar: "--color-se-green-300",  hex: "#69B57B" },
  { label: "se-green-400", cssVar: "--color-se-green-400",  hex: "#279D54" },
  { label: "se-green-500", cssVar: "--color-se-green-500",  hex: "#00662E" },
  { label: "se-green-600", cssVar: "--color-se-green-600",  hex: "#004D20" },
  { label: "kale",         cssVar: "--color-kale",          hex: "#003619" },
  { label: "se-green-800", cssVar: "--color-se-green-800",  hex: "#001F0A" },
];

const guava: SwatchData[] = [
  { label: "guava",     cssVar: "--color-guava-base", hex: "#F66B4F" },
  { label: "guava-050", cssVar: "--color-guava-050",  hex: "#FEF6F5" },
  { label: "guava-100", cssVar: "--color-guava-100",  hex: "#FDECEA" },
  { label: "guava-200", cssVar: "--color-guava-200",  hex: "#FBDAD5" },
  { label: "guava-300", cssVar: "--color-guava-300",  hex: "#F9C5BE" },
  { label: "guava-400", cssVar: "--color-guava-400",  hex: "#F89A89" },
  { label: "guava-500", cssVar: "--color-guava-500",  hex: "#CA5844" },
  { label: "guava-600", cssVar: "--color-guava-600",  hex: "#A34B3E" },
  { label: "guava-700", cssVar: "--color-guava-700",  hex: "#6C3128" },
  { label: "guava-800", cssVar: "--color-guava-800",  hex: "#3A1812" },
  { label: "dark-cherry", cssVar: "--color-dark-cherry",  hex: "#360F0F" },
];

const banana: SwatchData[] = [
  { label: "banana",     cssVar: "--color-banana-base", hex: "#FFD951" },
  { label: "banana-050", cssVar: "--color-banana-050",  hex: "#FFFCF0" },
  { label: "banana-100", cssVar: "--color-banana-100",  hex: "#FFF8E1" },
  { label: "banana-200", cssVar: "--color-banana-200",  hex: "#FFF1C2" },
  { label: "banana-300", cssVar: "--color-banana-300",  hex: "#FFE9A2" },
  { label: "banana-400", cssVar: "--color-banana-400",  hex: "#FFE17E" },
  { label: "banana-500", cssVar: "--color-banana-500",  hex: "#E2BB2E" },
  { label: "banana-600", cssVar: "--color-banana-600",  hex: "#BEA13A" },
  { label: "banana-700", cssVar: "--color-banana-700",  hex: "#806C24" },
  { label: "banana-800", cssVar: "--color-banana-800",  hex: "#4B3B10" },
  { label: "banana-900", cssVar: "--color-banana-900",  hex: "#2F2607" },
];

const tangerine: SwatchData[] = [
  { label: "tangerine",     cssVar: "--color-tangerine-base", hex: "#FBA62F" },
  { label: "tangerine-050", cssVar: "--color-tangerine-050",  hex: "#FFF7ED" },
  { label: "tangerine-100", cssVar: "--color-tangerine-100",  hex: "#FFEEDB" },
  { label: "tangerine-200", cssVar: "--color-tangerine-200",  hex: "#FFDDB6" },
  { label: "tangerine-300", cssVar: "--color-tangerine-300",  hex: "#FFCB91" },
  { label: "tangerine-400", cssVar: "--color-tangerine-400",  hex: "#FDB967" },
  { label: "tangerine-500", cssVar: "--color-tangerine-500",  hex: "#EB8B05" },
  { label: "tangerine-600", cssVar: "--color-tangerine-600",  hex: "#BA7413" },
  { label: "tangerine-700", cssVar: "--color-tangerine-700",  hex: "#7E5112" },
  { label: "tangerine-800", cssVar: "--color-tangerine-800",  hex: "#462B06" },
  { label: "tangerine-900", cssVar: "--color-tangerine-900",  hex: "#301E06" },
];

const blueberry: SwatchData[] = [
  { label: "blueberry",     cssVar: "--color-blueberry-base", hex: "#67C3E4" },
  { label: "blueberry-050", cssVar: "--color-blueberry-050",  hex: "#F1F9FC" },
  { label: "blueberry-100", cssVar: "--color-blueberry-100",  hex: "#E3F3FA" },
  { label: "blueberry-200", cssVar: "--color-blueberry-200",  hex: "#C6E7F5" },
  { label: "blueberry-300", cssVar: "--color-blueberry-300",  hex: "#A8DBEF" },
  { label: "blueberry-400", cssVar: "--color-blueberry-400",  hex: "#89CFEA" },
  { label: "blueberry-500", cssVar: "--color-blueberry-500",  hex: "#448EA9" },
  { label: "blueberry-600", cssVar: "--color-blueberry-600",  hex: "#2E5F72" },
  { label: "blueberry-700", cssVar: "--color-blueberry-700",  hex: "#17343F" },
  { label: "blueberry-800", cssVar: "--color-blueberry-800",  hex: "#040E12" },
];

const neutral: SwatchData[] = [
  { label: "neutral-000", cssVar: "--color-neutral-000", hex: "#FFFFFF" },
  { label: "neutral-050", cssVar: "--color-neutral-050", hex: "#F9F9F9" },
  { label: "neutral-100", cssVar: "--color-neutral-100", hex: "#F7F6F6" },
  { label: "neutral-150", cssVar: "--color-neutral-150", hex: "#F1EFEF" },
  { label: "neutral-200", cssVar: "--color-neutral-200", hex: "#E7E7E7" },
  { label: "neutral-250", cssVar: "--color-neutral-250", hex: "#E2E2E2" },
  { label: "neutral-300", cssVar: "--color-neutral-300", hex: "#C9C9C9" },
  { label: "neutral-350", cssVar: "--color-neutral-350", hex: "#ACACAC" },
  { label: "neutral-400", cssVar: "--color-neutral-400", hex: "#9F9F9F" },
  { label: "neutral-450", cssVar: "--color-neutral-450", hex: "#8E8E8E" },
  { label: "neutral-500", cssVar: "--color-neutral-500", hex: "#7F7F7F" },
  { label: "neutral-550", cssVar: "--color-neutral-550", hex: "#747474" },
  { label: "neutral-750", cssVar: "--color-neutral-750", hex: "#2B2B2B" },
  { label: "neutral-800", cssVar: "--color-neutral-800", hex: "#252525" },
  { label: "neutral-850", cssVar: "--color-neutral-850", hex: "#1F1F1F" },
  { label: "neutral-900", cssVar: "--color-neutral-900", hex: "#1A1A1A" },
  { label: "neutral-950", cssVar: "--color-neutral-950", hex: "#0C0C0C" },
];

function Swatch({ label, cssVar, hex }: SwatchData) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          height: 56,
          borderRadius: 8,
          backgroundColor: hex,
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      />
      <div style={{ fontSize: 11, lineHeight: 1.5, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{label}</div>
        <div style={{ color: "#747474", fontFamily: "monospace", fontSize: 10 }}>{cssVar}</div>
        <div style={{ color: "#9f9f9f", fontFamily: "monospace", fontSize: 10 }}>{hex.toLowerCase()}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  swatches,
  cols = 5,
}: {
  title: string;
  swatches: SwatchData[];
  cols?: number;
}) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>
        {title}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
        {swatches.map((s) => (
          <Swatch key={s.cssVar} {...s} />
        ))}
      </div>
    </section>
  );
}

function ColorPage() {
  return (
    <div style={{ padding: 40, backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px" }}>Color</h1>
        <p style={{ fontSize: 14, color: "#747474", maxWidth: 640, margin: 0 }}>
          All colors are defined as CSS custom properties and available as Tailwind utilities.
          Use <code style={{ fontFamily: "monospace", fontSize: 12 }}>--color-*</code> vars directly
          or Tailwind classes like <code style={{ fontFamily: "monospace", fontSize: 12 }}>bg-se-green</code>, <code style={{ fontFamily: "monospace", fontSize: 12 }}>text-banana-500</code>, etc.
        </p>
      </div>

      <Section title="Brand primitives" cols={3} swatches={brand} />
      <Section title="SE Green" cols={5} swatches={seGreen} />
      <Section title="Banana" cols={5} swatches={banana} />
      <Section title="Tangerine" cols={5} swatches={tangerine} />
      <Section title="Guava" cols={5} swatches={guava} />
      <Section title="Blueberry" cols={5} swatches={blueberry} />
      <Section title="Neutral" cols={6} swatches={neutral} />
    </div>
  );
}

const meta = {
  title: "Foundations/Colors",
  component: ColorPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ColorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {};
