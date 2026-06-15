import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { StatCard } from "./StatCard";

const IMG_TOMATOES = "/images/tomatoes.jpg";
const IMG_BANANAS = "/images/bananas.png";
const IMG_PEPPERS = "/images/peppers.jpg";
const IMG_ORANGES = "/images/oranges.jpg";

/** Figma card width — keeps centered canvas previews from collapsing. */
const STAT_CARD_WIDTH = 445;

const withStatCardPreview: Decorator = (Story, { parameters, globals }) => {
  if (parameters.layout === "fullscreen") return <Story />;

  const theme = (globals.sectionTheme as "light" | "dark" | undefined) ?? "light";

  return (
    <div
      data-theme={theme}
      style={{
        width: STAT_CARD_WIDTH,
        maxWidth: "100%",
        minWidth: 280,
        padding: 48,
        background: "var(--section-bg)",
      }}
    >
      <Story />
    </div>
  );
};

const statCardGridItem = {
  flex: `1 1 ${STAT_CARD_WIDTH}px`,
  minWidth: 280,
  maxWidth: STAT_CARD_WIDTH,
  width: "100%",
} as const;

const meta = {
  title: "UI/StatCard",
  component: StatCard,
  decorators: [withStatCardPreview],
  parameters: { layout: "centered" },
  args: {
    value: "1.2M",
    label: "Lorem ipsum",
    type: "color",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["green", "yellow", "orange"],
      if: { arg: "type", eq: "color" },
    },
    tilt: {
      control: "radio",
      options: ["tiltLeft", "tiltRight"],
      if: { arg: "type", eq: "image" },
    },
    type: { control: "radio", options: ["color", "image"] },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Color type ──────────────────────────────────────────────────────────────

export const ColorGreen: Story = {
  name: "Color / Green",
  args: { variant: "green", type: "color" },
};

export const ColorYellow: Story = {
  name: "Color / Yellow",
  args: { variant: "yellow", type: "color", value: "480K", label: "Lorem ipsum" },
};

export const ColorOrange: Story = {
  name: "Color / Orange",
  args: { variant: "orange", type: "color", value: "320+", label: "Lorem ipsum" },
};

// ── Image type (tilt only — Figma node 967:1028) ─────────────────────────────

export const ImageTiltLeft: Story = {
  name: "Image / Tilt left",
  args: {
    type: "image",
    tilt: "tiltLeft",
    imageSrc: IMG_TOMATOES,
  },
};

export const ImageTiltRight: Story = {
  name: "Image / Tilt right",
  args: {
    type: "image",
    tilt: "tiltRight",
    value: "480K",
    label: "Lorem ipsum",
    imageSrc: IMG_ORANGES,
  },
};

// ── Overview grids ────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: "All variants",
  parameters: { layout: "fullscreen" },
  render: (_, { globals }) => {
    const theme = (globals.sectionTheme as "light" | "dark" | undefined) ?? "light";

    return (
    <div
      data-theme={theme}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 48,
        padding: 48,
        background: "var(--section-bg)",
        color: "var(--section-text)",
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "system-ui",
            fontSize: 11,
            fontWeight: 600,
            color: "#9f9f9f",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          Type: Color
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={statCardGridItem}>
            <StatCard variant="green" type="color" value="1.2M" label="Lorem ipsum" />
          </div>
          <div style={statCardGridItem}>
            <StatCard variant="yellow" type="color" value="480K" label="Lorem ipsum" />
          </div>
          <div style={statCardGridItem}>
            <StatCard variant="orange" type="color" value="320+" label="Lorem ipsum" />
          </div>
        </div>
      </div>
      <div>
        <p
          style={{
            fontFamily: "system-ui",
            fontSize: 11,
            fontWeight: 600,
            color: "#9f9f9f",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          Type: Image
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={statCardGridItem}>
            <StatCard
              type="image"
              tilt="tiltLeft"
              value="1.2M"
              label="Lorem ipsum"
              imageSrc={IMG_TOMATOES}
            />
          </div>
          <div style={statCardGridItem}>
            <StatCard
              type="image"
              tilt="tiltRight"
              value="480K"
              label="Lorem ipsum"
              imageSrc={IMG_BANANAS}
            />
          </div>
          <div style={statCardGridItem}>
            <StatCard
              type="image"
              tilt="tiltLeft"
              value="320+"
              label="Lorem ipsum"
              imageSrc={IMG_PEPPERS}
            />
          </div>
        </div>
      </div>
    </div>
    );
  },
};

export const HoveredState: Story = {
  name: "Hover states (static preview)",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 48,
        padding: 48,
        background: "#f9f9f9",
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "system-ui",
            fontSize: 11,
            fontWeight: 600,
            color: "#9f9f9f",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          Color — hover
        </p>
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div style={{ transform: `rotate(${-3.38}deg)` }}>
            <div
              style={{
                position: "relative",
                width: 445,
                height: 432,
                background: "#00BC57",
                borderRadius: 40,
                padding: 42,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <p
                style={{
                  fontFamily: '"malila", sans-serif',
                  fontSize: 128,
                  fontWeight: 700,
                  lineHeight: 1.06,
                  letterSpacing: "-5.12px",
                  color: "#003619",
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                1.2M
              </p>
              <p
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: 32,
                  fontWeight: 500,
                  lineHeight: 1.06,
                  letterSpacing: "-1.28px",
                  color: "#003619",
                  marginTop: "auto",
                  marginBottom: 0,
                }}
              >
                Lorem ipsum
              </p>
              <span style={{ position: "absolute", bottom: 37, right: 45, color: "#003619" }}>
                <svg width="43" height="43" viewBox="0 0 43 43" fill="none">
                  <path
                    d="M8 21.5H35M24 10.5L35 21.5L24 32.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div style={{ transform: `rotate(${2.46}deg)` }}>
            <div
              style={{
                position: "relative",
                width: 445,
                height: 432,
                background: "#FFD951",
                borderRadius: 40,
                padding: 42,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <p
                style={{
                  fontFamily: '"malila", sans-serif',
                  fontSize: 128,
                  fontWeight: 700,
                  lineHeight: 1.06,
                  letterSpacing: "-5.12px",
                  color: "#360F0F",
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                480K
              </p>
              <p
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: 32,
                  fontWeight: 500,
                  lineHeight: 1.06,
                  letterSpacing: "-1.28px",
                  color: "#360F0F",
                  marginTop: "auto",
                  marginBottom: 0,
                }}
              >
                Lorem ipsum
              </p>
              <span style={{ position: "absolute", bottom: 37, right: 45, color: "#360F0F" }}>
                <svg width="43" height="43" viewBox="0 0 43 43" fill="none">
                  <path
                    d="M8 21.5H35M24 10.5L35 21.5L24 32.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p
          style={{
            fontFamily: "system-ui",
            fontSize: 11,
            fontWeight: 600,
            color: "#9f9f9f",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          Image — hover
        </p>
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div style={{ transform: `rotate(${-3.38}deg)` }}>
            <div
              style={{
                position: "relative",
                width: 445,
                height: 432,
                borderRadius: 40,
                padding: 42,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                overflow: "hidden",
                background: "#f7f6f6",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 893,
                  height: 893,
                  borderRadius: "50%",
                  left: -157,
                  top: -227,
                  overflow: "hidden",
                }}
              >
                <img
                  src={IMG_TOMATOES}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(27,27,21,0.36) 0%, transparent 60%)",
                  mixBlendMode: "multiply",
                }}
              />
              <p
                style={{
                  fontFamily: '"malila", sans-serif',
                  fontSize: 128,
                  fontWeight: 700,
                  lineHeight: 1.06,
                  letterSpacing: "-5.12px",
                  color: "#ffffff",
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                1.2M
              </p>
              <p
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: 32,
                  fontWeight: 500,
                  lineHeight: 1.06,
                  letterSpacing: "-1.28px",
                  color: "#ffffff",
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Lorem ipsum
              </p>
              <div
                style={{
                  position: "absolute",
                  bottom: 15,
                  right: 23,
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "#ffffff",
                  zIndex: 1,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 37,
                  right: 45,
                  color: "#003619",
                  zIndex: 2,
                }}
              >
                <svg width="43" height="43" viewBox="0 0 43 43" fill="none">
                  <path
                    d="M8 21.5H35M24 10.5L35 21.5L24 32.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div style={{ transform: `rotate(${2.46}deg)` }}>
            <div
              style={{
                position: "relative",
                width: 445,
                height: 432,
                borderRadius: 40,
                padding: 42,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                overflow: "hidden",
                background: "#f7f6f6",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 893,
                  height: 893,
                  borderRadius: "50%",
                  left: -157,
                  top: -227,
                  overflow: "hidden",
                }}
              >
                <img
                  src={IMG_BANANAS}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(27,27,21,0.36) 0%, transparent 60%)",
                  mixBlendMode: "multiply",
                }}
              />
              <p
                style={{
                  fontFamily: '"malila", sans-serif',
                  fontSize: 128,
                  fontWeight: 700,
                  lineHeight: 1.06,
                  letterSpacing: "-5.12px",
                  color: "#ffffff",
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                480K
              </p>
              <p
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: 32,
                  fontWeight: 500,
                  lineHeight: 1.06,
                  letterSpacing: "-1.28px",
                  color: "#ffffff",
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Lorem ipsum
              </p>
              <div
                style={{
                  position: "absolute",
                  bottom: 15,
                  right: 23,
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "#ffffff",
                  zIndex: 1,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 37,
                  right: 45,
                  color: "#003619",
                  zIndex: 2,
                }}
              >
                <svg width="43" height="43" viewBox="0 0 43 43" fill="none">
                  <path
                    d="M8 21.5H35M24 10.5L35 21.5L24 32.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
