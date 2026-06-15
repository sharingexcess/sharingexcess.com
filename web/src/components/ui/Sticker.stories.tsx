import type { Meta, StoryObj } from "@storybook/react";
import { Sticker } from "./Sticker";

const meta = {
  title: "UI/Sticker",
  component: Sticker,
  parameters: { layout: "centered" },
  argTypes: {
    name: {
      control: "select",
      options: ["waste-less", "sunrise", "free-food", "lemon"],
    },
    size: { control: { type: "range", min: 80, max: 400, step: 8 } },
  },
} satisfies Meta<typeof Sticker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WasteLess: Story = {
  args: { name: "waste-less", size: 200 },
};

export const Sunrise: Story = {
  args: { name: "sunrise", size: 200 },
};

export const FreeFood: Story = {
  args: { name: "free-food", size: 200 },
};

export const Lemon: Story = {
  args: { name: "lemon", size: 200 },
};

export const All: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap", padding: 32, alignItems: "center" }}>
      <Sticker name="waste-less" size={180} />
      <Sticker name="sunrise" size={180} />
      <Sticker name="free-food" size={180} />
      <Sticker name="lemon" size={180} />
    </div>
  ),
};
