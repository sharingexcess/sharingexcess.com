import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { TextInput } from "./TextInput";

const withInputSurface: Decorator = (Story, { args }) => {
  const theme = (args.theme as "onWhite" | "onColor") ?? "onWhite";
  const background = theme === "onColor" ? "var(--color-se-green-base)" : "#ffffff";

  return (
    <div style={{ padding: 32, maxWidth: 320, background }}>
      <Story />
    </div>
  );
};

const meta = {
  title: "UI/TextInput",
  component: TextInput,
  decorators: [withInputSurface],
  args: { placeholder: "Enter your email", theme: "onWhite" },
  argTypes: {
    theme: { control: "radio", options: ["onWhite", "onColor"] },
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BothThemes: Story = {
  name: "Both themes",
  render: (args) => (
    <div style={{ display: "flex", gap: 0, flexDirection: "column" }}>
      <div style={{ padding: "24px 32px", background: "#ffffff" }}>
        <p style={{ fontSize: 11, fontFamily: "system-ui", color: "#9f9f9f", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>onWhite</p>
        <TextInput {...args} theme="onWhite" style={{ maxWidth: 320 }} />
      </div>
      <div style={{ padding: "24px 32px", background: "var(--color-se-green-base)" }}>
        <p style={{ fontSize: 11, fontFamily: "system-ui", color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>onColor</p>
        <TextInput {...args} theme="onColor" style={{ maxWidth: 320 }} />
      </div>
    </div>
  ),
};
