import type { Meta, StoryObj } from "@storybook/react";
import { ArrowButton } from "./ArrowButton";

const meta = {
  title: "UI/ArrowButton",
  component: ArrowButton,
  parameters: { layout: "centered" },
  args: {
    direction: "next",
    "aria-label": "Next slide",
  },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary"] },
    colorScheme: { control: "radio", options: ["light", "dark"] },
    direction: { control: "radio", options: ["prev", "next"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ArrowButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", colorScheme: "light" },
};

export const Secondary: Story = {
  args: { variant: "secondary", colorScheme: "light" },
};

export const PrimaryDark: Story = {
  args: { variant: "primary", colorScheme: "dark" },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 48,
          background: "var(--color-se-green-700)",
          borderRadius: 16,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const SecondaryDark: Story = {
  args: { variant: "secondary", colorScheme: "dark" },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 48,
          background: "var(--color-se-green-700)",
          borderRadius: 16,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true },
};

export const Pair: Story = {
  name: "Prev / Next pair",
  render: (args) => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <ArrowButton {...args} direction="prev" aria-label="Previous slide" />
      <ArrowButton {...args} direction="next" aria-label="Next slide" />
    </div>
  ),
};

export const AllVariants: Story = {
  name: "All variants",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: 48 }}>
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
          Primary / Light
        </p>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <ArrowButton variant="primary" colorScheme="light" direction="prev" aria-label="Previous" />
          <ArrowButton variant="primary" colorScheme="light" direction="next" aria-label="Next" />
          <ArrowButton variant="primary" colorScheme="light" direction="next" aria-label="Next" disabled />
        </div>
      </div>
      <div
        style={{
          padding: 32,
          background: "var(--color-se-green-700)",
          borderRadius: 16,
        }}
      >
        <p
          style={{
            fontFamily: "system-ui",
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          Primary / Dark
        </p>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <ArrowButton variant="primary" colorScheme="dark" direction="prev" aria-label="Previous" />
          <ArrowButton variant="primary" colorScheme="dark" direction="next" aria-label="Next" />
          <ArrowButton variant="primary" colorScheme="dark" direction="next" aria-label="Next" disabled />
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
          Secondary / Light
        </p>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <ArrowButton variant="secondary" colorScheme="light" direction="prev" aria-label="Previous" />
          <ArrowButton variant="secondary" colorScheme="light" direction="next" aria-label="Next" />
          <ArrowButton variant="secondary" colorScheme="light" direction="next" aria-label="Next" disabled />
        </div>
      </div>
      <div
        style={{
          padding: 32,
          background: "var(--color-se-green-700)",
          borderRadius: 16,
        }}
      >
        <p
          style={{
            fontFamily: "system-ui",
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          Secondary / Dark
        </p>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <ArrowButton variant="secondary" colorScheme="dark" direction="prev" aria-label="Previous" />
          <ArrowButton variant="secondary" colorScheme="dark" direction="next" aria-label="Next" />
          <ArrowButton variant="secondary" colorScheme="dark" direction="next" aria-label="Next" disabled />
        </div>
      </div>
    </div>
  ),
};
