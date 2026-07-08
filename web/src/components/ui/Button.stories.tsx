import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: { children: "Button Label" },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "tertiary", "ghost"] },
    size:    { control: "radio",  options: ["lg", "md", "sm"] },
    disabled: { control: "boolean" },
    colorScheme: {
      control: "radio",
      options: ["light", "dark"],
      if: { arg: "variant", neq: "ghost" },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Individual variant stories ───────────────────────────────────────────────

export const Primary: Story   = { args: { variant: "primary",   size: "lg" } };
export const Secondary: Story = { args: { variant: "secondary", size: "lg", colorScheme: "light" } };
export const Tertiary: Story  = { args: { variant: "tertiary",  size: "lg", colorScheme: "light" } };

// Ghost needs a rich background to show the frosted-glass blur effect
const HERO_BG = "/images/tomatoes.jpg";

export const Ghost: Story = {
  args: { variant: "ghost", size: "lg" },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{
        position: "relative",
        width: "100%",
        minHeight: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        <img src={HERO_BG} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #003619cc 0%, #00361980 100%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

// ── Size scale ───────────────────────────────────────────────────────────────

export const SizeLG: Story = { name: "Size / LG", args: { variant: "primary", size: "lg" } };
export const SizeMD: Story = { name: "Size / MD", args: { variant: "primary", size: "md" } };
export const SizeSM: Story = { name: "Size / SM", args: { variant: "primary", size: "sm" } };

// ── All variants overview ────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: "All variants",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: 48 }}>
      {/* Primary */}
      <div>
        <p style={{ fontFamily: "system-ui", fontSize: 11, fontWeight: 600, color: "#9f9f9f", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Primary / Light</p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Button variant="primary" colorScheme="light" size="lg">Button Label</Button>
          <Button variant="primary" colorScheme="light" size="md">Button Label</Button>
          <Button variant="primary" colorScheme="light" size="sm">Button Label</Button>
          <Button variant="primary" colorScheme="light" size="lg" disabled>Button Label</Button>
        </div>
      </div>
      <div style={{ padding: 32, background: "var(--color-se-green-700)", borderRadius: 16 }}>
        <p style={{ fontFamily: "system-ui", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Primary / Dark</p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Button variant="primary" colorScheme="dark" size="lg">Button Label</Button>
          <Button variant="primary" colorScheme="dark" size="md">Button Label</Button>
          <Button variant="primary" colorScheme="dark" size="sm">Button Label</Button>
          <Button variant="primary" colorScheme="dark" size="lg" disabled>Button Label</Button>
        </div>
      </div>
      {/* Secondary */}
      <div>
        <p style={{ fontFamily: "system-ui", fontSize: 11, fontWeight: 600, color: "#9f9f9f", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Secondary / Light</p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Button variant="secondary" colorScheme="light" size="lg">Button Label</Button>
          <Button variant="secondary" colorScheme="light" size="md">Button Label</Button>
          <Button variant="secondary" colorScheme="light" size="sm">Button Label</Button>
          <Button variant="secondary" colorScheme="light" size="lg" disabled>Button Label</Button>
        </div>
      </div>
      <div style={{ padding: 32, background: "var(--color-se-green-700)", borderRadius: 16 }}>
        <p style={{ fontFamily: "system-ui", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Secondary / Dark</p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Button variant="secondary" colorScheme="dark" size="lg">Button Label</Button>
          <Button variant="secondary" colorScheme="dark" size="md">Button Label</Button>
          <Button variant="secondary" colorScheme="dark" size="sm">Button Label</Button>
          <Button variant="secondary" colorScheme="dark" size="lg" disabled>Button Label</Button>
        </div>
      </div>
      {/* Tertiary */}
      <div>
        <p style={{ fontFamily: "system-ui", fontSize: 11, fontWeight: 600, color: "#9f9f9f", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Tertiary / Light</p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Button variant="tertiary" colorScheme="light" size="lg">Button Label</Button>
          <Button variant="tertiary" colorScheme="light" size="md">Button Label</Button>
          <Button variant="tertiary" colorScheme="light" size="sm">Button Label</Button>
          <Button variant="tertiary" colorScheme="light" size="lg" disabled>Button Label</Button>
        </div>
      </div>
      <div style={{ padding: 32, background: "var(--color-se-green-700)", borderRadius: 16 }}>
        <p style={{ fontFamily: "system-ui", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Tertiary / Dark</p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Button variant="tertiary" colorScheme="dark" size="lg">Button Label</Button>
          <Button variant="tertiary" colorScheme="dark" size="md">Button Label</Button>
          <Button variant="tertiary" colorScheme="dark" size="sm">Button Label</Button>
          <Button variant="tertiary" colorScheme="dark" size="lg" disabled>Button Label</Button>
        </div>
      </div>
      {/* Ghost — photo backgrounds only (home hero) */}
      <div style={{ position: "relative", borderRadius: 16, padding: 32, overflow: "hidden" }}>
        <img src={HERO_BG} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,54,25,0.6)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "system-ui", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Ghost (photo backgrounds)</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <Button variant="ghost" size="lg">Button Label</Button>
            <Button variant="ghost" size="md">Button Label</Button>
            <Button variant="ghost" size="sm">Button Label</Button>
            <Button variant="ghost" size="lg" disabled>Button Label</Button>
          </div>
        </div>
      </div>
    </div>
  ),
};
