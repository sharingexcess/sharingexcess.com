import type { Meta, StoryObj } from "@storybook/react";
import { SiteHeader } from "./SiteHeader";

const meta = {
  title: "Layout/SiteHeader",
  component: SiteHeader,
  parameters: { renderer: "@storybook/react" },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
