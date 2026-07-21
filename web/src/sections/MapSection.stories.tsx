import type { Meta, StoryObj } from "@storybook/react";
import { MapSection } from "./MapSection";
import { sectionControlArgs, sectionControlArgTypes, withSectionControls } from "./sectionStoryControls";

const meta = {
  title: "Sections/Maps",
  component: MapSection,
  parameters: { layout: "fullscreen" },
  decorators: [withSectionControls],
  args: {
    ...sectionControlArgs,
    theme: "dark",
    isCard: false,
    eyebrow: "Lorem ipsum",
    title: "*Lorem ipsum* dolor sit amet.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    primaryCta: "Lorem ipsum",
    secondaryCta: "Dolor sit amet",
    mapVariant: "impact-clusters",
    mapCaption: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  argTypes: {
    ...sectionControlArgTypes,
    isCard: { control: "boolean" },
    headingSize: { control: "radio", options: ["h1", "h2"] },
    bodySize: { control: "radio", options: ["xl", "lg", "md"] },
    layout: { control: "radio", options: ["horizontal", "stack-centered"] },
    mapPosition: { control: "radio", options: ["left", "right"] },
    mapContainerShape: { control: "radio", options: ["rounded", "circle"] },
    mapVariant: {
      control: "radio",
      options: ["impact-clusters", "hub-markers", "region-highlights"],
    },
    hubs: { control: false },
    regions: { control: false },
  },
} satisfies Meta<typeof MapSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Centered text over full-width impact map — mirrors TextImage stack-centered. */
export const StackCentered: Story = {
  args: {
    layout: "stack-centered",
    headingSize: "h2",
    bodySize: "lg",
  },
};

/** Archive-style Mapbox cluster map fed by surplus-api geojson. */
export const MapRight: Story = {
  args: {
    mapPosition: "right",
    mapVariant: "impact-clusters",
  },
};

export const MapLeft: Story = {
  args: {
    mapPosition: "left",
    mapVariant: "impact-clusters",
  },
};

/** Impact cluster map in a circular frame — matches RoundImageCircle sizing. */
export const MapCircleRight: Story = {
  args: {
    mapPosition: "right",
    mapContainerShape: "circle",
    mapVariant: "impact-clusters",
  },
};

export const MapCircleLeft: Story = {
  args: {
    mapPosition: "left",
    mapContainerShape: "circle",
    mapVariant: "impact-clusters",
  },
};

/** Branded SE hub pins on a light US map — Philadelphia, Hunts Point, Chicago, Detroit. */
export const MapRightHubMarkers: Story = {
  args: {
    theme: "light",
    mapPosition: "right",
    mapVariant: "hub-markers",
    mapCaption: undefined,
    showButtons: false,
  },
};

export const MapLeftHubMarkers: Story = {
  args: {
    theme: "light",
    mapPosition: "left",
    mapVariant: "hub-markers",
    mapCaption: undefined,
    showButtons: false,
  },
};

/** Placeholder highlighted service regions — swap state lists when Surplus boundaries ship. */
export const MapRightRegionHighlights: Story = {
  args: {
    theme: "light",
    mapPosition: "right",
    mapVariant: "region-highlights",
    mapCaption: undefined,
    showButtons: false,
  },
};

export const MapLeftRegionHighlights: Story = {
  args: {
    theme: "light",
    mapPosition: "left",
    mapVariant: "region-highlights",
    mapCaption: undefined,
    showButtons: false,
  },
};
