import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "./Heading";

const meta = {
  title: "UI/Heading",
  component: Heading,
  parameters: { renderer: "@storybook/react" },
  args: { children: "Sharing Excess" },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = { args: { level: 1 } };
export const H2: Story = { args: { level: 2, children: "Food rescue at scale" } };
export const H3: Story = { args: { level: 3, children: "Our mission" } };
