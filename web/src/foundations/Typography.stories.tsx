import type { Meta, StoryObj } from "@storybook/react";

interface TypeSpecimen {
  name: string;
  usage: string;
  family: string;
  size: string;
  weight: string;
  tracking: string;
  sample: string;
  style?: React.CSSProperties;
}

const specimens: TypeSpecimen[] = [
  {
    name: "Metric Number",
    usage: "Large stat figures on cards and in sections",
    family: "Malila",
    size: "128px",
    weight: "700 ExtraBold",
    tracking: "−5.12px",
    sample: "1.2M",
    style: { fontFamily: '"malila", sans-serif', fontSize: 128, fontWeight: 700, lineHeight: 1.06, letterSpacing: "-5.12px", color: "#003619" },
  },
  {
    name: "Hero H1",
    usage: "Homepage hero headline",
    family: "Poppins",
    size: "120px (approx.)",
    weight: "500 Medium",
    tracking: "−4px",
    sample: "Lorem ipsum dolor sit",
    style: { fontFamily: '"Poppins", sans-serif', fontSize: 96, fontWeight: 500, lineHeight: 1.06, letterSpacing: "-3.84px", color: "#003619" },
  },
  {
    name: "Section H1",
    usage: "Primary heading within page sections",
    family: "Poppins",
    size: "96px",
    weight: "500 Medium",
    tracking: "−3.84px",
    sample: "Lorem ipsum dolor sit amet",
    style: { fontFamily: '"Poppins", sans-serif', fontSize: 72, fontWeight: 500, lineHeight: 1.06, letterSpacing: "-2.88px", color: "#003619" },
  },
  {
    name: "Section H2",
    usage: "Secondary heading within sections",
    family: "Poppins",
    size: "72px",
    weight: "500 Medium",
    tracking: "−2.88px",
    sample: "Lorem ipsum dolor",
    style: { fontFamily: '"Poppins", sans-serif', fontSize: 56, fontWeight: 500, lineHeight: 1.06, letterSpacing: "-2.24px", color: "#003619" },
  },
  {
    name: "Eyebrow",
    usage: "Label above section headings",
    family: "Malila",
    size: "24px",
    weight: "700 Bold",
    tracking: "0",
    sample: "Lorem ipsum",
    style: { fontFamily: '"malila", sans-serif', fontSize: 24, fontWeight: 700, lineHeight: 1.1, letterSpacing: 0, color: "#003619" },
  },
  {
    name: "Paragraph XL",
    usage: "Lead body copy",
    family: "Poppins",
    size: "20px",
    weight: "400 Regular",
    tracking: "0",
    sample: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    style: { fontFamily: '"Poppins", sans-serif', fontSize: 20, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0, color: "#003619" },
  },
  {
    name: "Paragraph LG",
    usage: "Standard section body copy",
    family: "Poppins",
    size: "18px",
    weight: "400 Regular",
    tracking: "0",
    sample: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    style: { fontFamily: '"Poppins", sans-serif', fontSize: 18, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0, color: "#003619" },
  },
  {
    name: "Paragraph MD",
    usage: "Default body text, captions, UI labels",
    family: "Poppins",
    size: "16px",
    weight: "400 Regular",
    tracking: "0",
    sample: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    style: { fontFamily: '"Poppins", sans-serif', fontSize: 16, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0, color: "#003619" },
  },
];

function TypeRow({ name, usage, family, size, weight, tracking, sample, style }: TypeSpecimen) {
  return (
    <div style={{ borderBottom: "1px solid #f1efef", padding: "32px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 4, fontFamily: "system-ui" }}>{name}</div>
          <div style={{ fontSize: 11, color: "#747474", fontFamily: "system-ui", marginBottom: 8 }}>{usage}</div>
          <table style={{ fontSize: 11, fontFamily: "monospace", color: "#9f9f9f", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Family", family],
                ["Size", size],
                ["Weight", weight],
                ["Tracking", tracking],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ paddingRight: 8, color: "#acacac" }}>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ overflow: "hidden" }}>
          <p style={{ margin: 0, ...style }}>{sample}</p>
        </div>
      </div>
    </div>
  );
}

function TypographyPage() {
  return (
    <div style={{ padding: 48, backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px", fontFamily: "system-ui" }}>
          Typography
        </h1>
        <p style={{ fontSize: 14, color: "#747474", maxWidth: 640, margin: 0, fontFamily: "system-ui" }}>
          Type scale from the 2026 brand system. <strong>Malila</strong> is used for display/metric figures;{" "}
          <strong>Poppins</strong> for headings and body. Sizes shown are design spec values — rendered samples
          use proportional scaling for readability in this view.
        </p>
      </div>
      <div style={{ borderTop: "2px solid #e7e7e7" }}>
        {specimens.map((s) => (
          <TypeRow key={s.name} {...s} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Foundations/Typography",
  component: TypographyPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TypographyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};
