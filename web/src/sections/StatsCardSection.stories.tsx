import type { Meta, StoryObj } from "@storybook/react";
import { StatsCardSection } from "./StatsCardSection";

const meta = {
  title: "Sections/StatsCardSection",
  component: StatsCardSection,
  parameters: { renderer: "@storybook/react" },
  args: {
    theme: "dark",
    title: "Impact by the numbers",
    stats: [
      { value: "1.2M+", label: "Pounds rescued" },
      { value: "80+", label: "Partners" },
      { value: "5K+", label: "Volunteers" },
    ],
  },
} satisfies Meta<typeof StatsCardSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const FourColumns: Story = { args: { columns: 4 } };
