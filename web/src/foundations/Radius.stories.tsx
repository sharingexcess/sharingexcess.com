import type { Meta, StoryObj } from "@storybook/react";

// ---------------------------------------------------------------------------
// Token data — mirrors web/tokens/tokens.json
// ---------------------------------------------------------------------------

interface RadiusToken {
  label: string;
  cssVar: string;
  value: string;
  px: number;
  usage: string;
}

const radiusTokens: RadiusToken[] = [
  {
    label: "radius.md",
    cssVar: "--radius-md",
    value: "40px",
    px: 40,
    usage: "Standard content card corners — team cards, blog cards, stat cards, and other content containers.",
  },
  {
    label: "radius.lg",
    cssVar: "--radius-lg",
    value: "80px",
    px: 80,
    usage: "Large featured section containers and hero cards that span edge-to-edge or fill a column.",
  },
  {
    label: "radius.xl",
    cssVar: "--radius-xl",
    value: "120px",
    px: 120,
    usage: "Image treatments, headshots, and icon containers that call for heavy rounding.",
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
          The brand uses distinctly rounded corners. Avoid sharp (0px) or fully circular (9999px) treatments outside of images.
          Use <code style={{ fontFamily: "monospace", fontSize: 12 }}>--radius-*</code> CSS custom properties directly.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
        {radiusTokens.map((t) => (
          <div key={t.cssVar} style={{
            border: "1px solid #e7e7e7",
            borderRadius: 12,
            padding: 24,
            backgroundColor: "#f9f9f9",
          }}>
            {/* Demo shape */}
            <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 24px" }}>
              <div style={{
                width: 160,
                height: 100,
                borderRadius: t.px,
                backgroundColor: "#00843D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 13,
                fontFamily: "monospace",
                fontWeight: 600,
              }}>
                {t.value}
              </div>
            </div>

            {/* Meta */}
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 11, color: "#747474", fontFamily: "monospace", marginBottom: 10 }}>{t.cssVar}</div>
            <p style={{ fontSize: 12, color: "#747474", lineHeight: 1.6, margin: 0 }}>{t.usage}</p>

            {/* Relative comparison */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 16, marginTop: 16, borderTop: "1px solid #e7e7e7" }}>
              {radiusTokens.map((r) => (
                <div key={r.cssVar} title={r.value} style={{
                  width: 36,
                  height: 36,
                  borderRadius: r.px,
                  backgroundColor: r.cssVar === t.cssVar ? "#00843D" : "#AFDBB8",
                  flexShrink: 0,
                }} />
              ))}
              <span style={{ fontSize: 10, color: "#9f9f9f", fontFamily: "system-ui" }}>relative</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reference table */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>Reference</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13, fontFamily: "system-ui, sans-serif" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e7e7e7" }}>
            {["Token", "CSS variable", "Value", "Usage"].map((h) => (
              <th key={h} style={{ textAlign: "left" as const, padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#9f9f9f", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {radiusTokens.map((t, i) => (
            <tr key={t.cssVar} style={{ borderBottom: "1px solid #f1efef", backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
              <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1a1a1a" }}>{t.label}</td>
              <td style={{ padding: "10px 12px", fontFamily: "monospace", color: "#747474", fontSize: 12 }}>{t.cssVar}</td>
              <td style={{ padding: "10px 12px", fontFamily: "monospace", color: "#747474", fontSize: 12 }}>{t.value}</td>
              <td style={{ padding: "10px 12px", color: "#747474" }}>{t.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
