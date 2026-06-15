import type { Meta, StoryObj } from "@storybook/react";

// ---------------------------------------------------------------------------
// Token data — mirrors web/tokens/tokens.json
// ---------------------------------------------------------------------------

interface SpacingToken {
  label: string;
  cssVar: string;
  value: string;
  px: number;
  usage: string;
}

const spacingTokens: SpacingToken[] = [
  {
    label: "spacing.xxl",
    cssVar: "--spacing-xxl",
    value: "120px",
    px: 120,
    usage: "Standard vertical rhythm for major page sections — hero padding, section-to-section gaps, and large content breathing room. Pair with smaller Tailwind base spacing for component-level spacing.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function SpacingPage() {
  return (
    <div style={{ padding: 40, backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px" }}>Spacing</h1>
        <p style={{ fontSize: 14, color: "#747474", maxWidth: 640, margin: 0 }}>
          Named size steps for padding, gaps, and margins. Bars below are rendered at 1:1 pixel scale.
          Use <code style={{ fontFamily: "monospace", fontSize: 12 }}>--spacing-*</code> CSS custom properties directly.
        </p>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr 80px",
        gap: 24,
        paddingBottom: 8,
        borderBottom: "2px solid #e7e7e7",
        marginBottom: 4,
      }}>
        {["Token", "Visual", "Value"].map((h) => (
          <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9f9f9f", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
            {h}
          </div>
        ))}
      </div>

      {spacingTokens.map((t) => (
        <div key={t.cssVar} style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr 80px",
          alignItems: "start",
          gap: 24,
          padding: "20px 0",
          borderBottom: "1px solid #f1efef",
        }}>
          {/* Meta */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{t.label}</div>
            <div style={{ fontSize: 11, color: "#747474", fontFamily: "monospace", marginTop: 2 }}>{t.cssVar}</div>
            <p style={{ fontSize: 12, color: "#9f9f9f", marginTop: 8, lineHeight: 1.6 }}>{t.usage}</p>
          </div>

          {/* Bar */}
          <div style={{ display: "flex", alignItems: "center", paddingTop: 4 }}>
            <div style={{
              height: 32,
              width: t.px,
              backgroundColor: "#00843D",
              borderRadius: 4,
            }} />
          </div>

          {/* Value */}
          <div style={{ fontSize: 13, fontFamily: "monospace", color: "#747474", paddingTop: 4 }}>
            {t.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

const meta = {
  title: "Foundations/Spacing",
  component: SpacingPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SpacingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};
