import type { Meta, StoryObj } from "@storybook/react";
import { SiteHeader } from "./SiteHeader";

const meta = {
  title: "Layout/SiteHeader",
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="bg-neutral-100 p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
