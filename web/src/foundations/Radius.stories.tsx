import type { Meta, StoryObj } from "@storybook/react";

// ---------------------------------------------------------------------------
// Token data — mirrors web/tokens/tokens.json
// ---------------------------------------------------------------------------

interface RadiusToken {
  label: string;
  cssVar: string;
  value: string;
  px: number | null;
  usage: string;
}

const radiusTokens: RadiusToken[] = [
  {
    label: "radius.none",
    cssVar: "--radius-none",
    value: "0",
    px: 0,
    usage: "Sharp corners — rare; reserved for nested elements inside already-rounded containers.",
  },
  {
    label: "radius.sm",
    cssVar: "--radius-sm",
    value: "16px",
    px: 16,
    usage: "Small UI surfaces — buttons, inputs, dropdown panels, and compact cards.",
  },
  {
    label: "radius.md",
    cssVar: "--radius-md",
    value: "24px",
    px: 24,
    usage: "Mid-weight UI rounding — nested panels, modals, and components stepping toward brand cards.",
  },
  {
    label: "radius.lg",
    cssVar: "--radius-lg",
    value: "32px",
    px: 32,
    usage: "Heavy UI rounding — featured tiles and inset containers that approach brand card corners.",
  },
  {
    label: "radius.xl",
    cssVar: "--radius-xl",
    value: "40px",
    px: 40,
    usage: "Brand default for content cards — team cards, blog cards, stat cards, and other content containers.",
  },
  {
    label: "radius.2xl",
    cssVar: "--radius-2xl",
    value: "80px",
    px: 80,
    usage: "Large featured section containers and hero cards that span edge-to-edge or fill a column.",
  },
  {
    label: "radius.3xl",
    cssVar: "--radius-3xl",
    value: "120px",
    px: 120,
    usage: "Image treatments, headshots, and icon containers that call for heavy rounding.",
  },
  {
    label: "radius.4xl",
    cssVar: "--radius-4xl",
    value: "160px",
    px: 160,
    usage: "Maximum brand rounding for full-bleed hero sections and oversized featured panels.",
  },
  {
    label: "radius.full",
    cssVar: "--radius-full",
    value: "9999px",
    px: null,
    usage: "Pill shapes and circular avatars — use for elements that should read as fully round.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function RadiusPage() {
  return (
    <div style={{ padding: 40, backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px" }}>Border Radius</h1>
        <p style={{ fontSize: 14, color: "#747474", maxWidth: 640, margin: 0 }}>
          T-shirt scale from <code style={{ fontFamily: "monospace", fontSize: 12 }}>sm</code>–<code style={{ fontFamily: "monospace", fontSize: 12 }}>lg</code> for UI chrome, <code style={{ fontFamily: "monospace", fontSize: 12 }}>xl</code> as the brand default for cards, and <code style={{ fontFamily: "monospace", fontSize: 12 }}>2xl</code>–<code style={{ fontFamily: "monospace", fontSize: 12 }}>4xl</code> for large featured containers.
          Use <code style={{ fontFamily: "monospace", fontSize: 12 }}>--radius-*</code> CSS custom properties directly.
        </p>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "180px 160px 1fr 80px",
        gap: 24,
        paddingBottom: 8,
        borderBottom: "2px solid #e7e7e7",
        marginBottom: 4,
      }}>
        {["Token", "Preview", "Usage", "Value"].map((h) => (
          <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9f9f9f", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
            {h}
          </div>
        ))}
      </div>

      {radiusTokens.map((t) => (
        <div key={t.cssVar} style={{
          display: "grid",
          gridTemplateColumns: "180px 160px 1fr 80px",
          alignItems: "center",
          gap: 24,
          padding: "20px 0",
          borderBottom: "1px solid #f1efef",
        }}>
          {/* Meta */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{t.label}</div>
            <div style={{ fontSize: 11, color: "#747474", fontFamily: "monospace", marginTop: 2 }}>{t.cssVar}</div>
          </div>

          {/* Preview */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              width: t.label === "radius.full" ? 80 : 120,
              height: t.label === "radius.full" ? 40 : 72,
              borderRadius: t.label === "radius.full" ? 9999 : t.px ?? 0,
              backgroundColor: "#00843D",
              flexShrink: 0,
            }} />
          </div>

          {/* Usage */}
          <p style={{ fontSize: 12, color: "#747474", lineHeight: 1.6, margin: 0 }}>{t.usage}</p>

          {/* Value */}
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "#1a1a1a", fontWeight: 600 }}>{t.value}</div>
        </div>
      ))}

      {/* Relative comparison */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "48px 0 16px" }}>Scale comparison</h2>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 16, alignItems: "flex-end" }}>
        {radiusTokens.filter((t) => t.label !== "radius.full").map((t) => (
          <div key={t.cssVar} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: t.px ?? 0,
              backgroundColor: "#AFDBB8",
              border: "2px solid #00843D",
            }} />
            <span style={{ fontSize: 10, color: "#747474", fontFamily: "monospace" }}>{t.label.replace("radius.", "")}</span>
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8 }}>
          <div style={{
            width: 64,
            height: 32,
            borderRadius: 9999,
            backgroundColor: "#AFDBB8",
            border: "2px solid #00843D",
          }} />
          <span style={{ fontSize: 10, color: "#747474", fontFamily: "monospace" }}>full</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

const meta = {
  title: "Foundations/Radius",
  component: RadiusPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof RadiusPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};
