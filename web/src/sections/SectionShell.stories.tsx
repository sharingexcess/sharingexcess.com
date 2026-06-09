import type { Meta, StoryObj } from "@storybook/react";
import { SectionShell } from "./SectionShell";

const meta = {
  title: "Sections/SectionShell",
  component: SectionShell,
  parameters: { renderer: "@storybook/react" },
  args: {
    children: <p className="text-lg">Section content inherits theme tokens.</p>,
  },
} satisfies Meta<typeof SectionShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = { args: { theme: "light" } };
export const Dark: Story = { args: { theme: "dark" } };
