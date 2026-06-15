import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "./Heading";

const meta = {
  title: "UI/Heading",
  component: Heading,

  args: { children: "Lorem ipsum dolor sit amet" },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = { args: { level: 1 } };
export const H2: Story = { args: { level: 2, children: "Lorem ipsum dolor sit amet" } };
export const H3: Story = { args: { level: 3, children: "Lorem ipsum dolor" } };
