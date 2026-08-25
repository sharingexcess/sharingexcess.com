import type { Meta, StoryObj } from "@storybook/react";
import { AppProviders } from "@/components/providers/AppProviders";
import { DEFAULT_NAV_ITEMS, SiteHeader } from "./SiteHeader";

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

export const Default: Story = {
  args: {
    navItems: DEFAULT_NAV_ITEMS,
    ctaLabel: "Donate",
  },
};

export const ScrollHide: Story = {
  decorators: [
    (Story) => (
      <AppProviders smoothScroll={false} showHeader={false}>
        <div className="bg-neutral-100">
          <Story />
          <div className="h-[200vh] px-8 pt-32">
            <p className="text-kale">Scroll down to hide the header, up to reveal it.</p>
          </div>
        </div>
      </AppProviders>
    ),
  ],
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  decorators: [
    (Story) => (
      <AppProviders smoothScroll={false} showHeader={false}>
        <div className="min-h-[120vh] bg-neutral-100">
          <Story />
          <div className="px-6 pt-28">
            <p className="text-kale">
              Tap the menu icon to open navigation. Scroll is locked while open.
            </p>
          </div>
        </div>
      </AppProviders>
    ),
  ],
};
