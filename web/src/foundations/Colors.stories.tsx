import type { Meta, StoryObj } from "@storybook/react";

const brandTokens = [
  { name: "SE Green", class: "bg-se-green" },
  { name: "Bright Kelly", class: "bg-bright-kelly" },
  { name: "Kale", class: "bg-kale" },
  { name: "Banana", class: "bg-banana" },
  { name: "Tangerine", class: "bg-tangerine" },
  { name: "Guava", class: "bg-guava" },
  { name: "Blueberry", class: "bg-blueberry" },
  { name: "Dark Cherry", class: "bg-dark-cherry" },
];

const greenScale = [100, 200, 300, 400, 500, 600, 700, 800] as const;
const neutralScale = [
  "000", "050", "100", "150", "200", "250", "300", "350", "400", "450", "500", "550",
  "750", "800", "850", "900", "950",
] as const;

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 w-full rounded-lg border border-neutral-200 ${className}`} />
      <p className="text-xs text-neutral-750">{name}</p>
    </div>
  );
}

function PaletteGrid() {
  return (
    <div className="bg-neutral-000 p-8 text-neutral-900">
      <h2 className="mb-4 text-xl font-bold">Brand + accents</h2>
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {brandTokens.map((t) => (
          <Swatch key={t.name} name={t.name} className={t.class} />
        ))}
      </div>

      <h2 className="mb-4 text-xl font-bold">SE Green scale</h2>
      <div className="mb-10 grid grid-cols-4 gap-4 sm:grid-cols-8">
        {greenScale.map((step) => (
          <Swatch key={step} name={`${step}`} className={`bg-se-green-${step}`} />
        ))}
      </div>

      <h2 className="mb-4 text-xl font-bold">Neutrals</h2>
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
        {neutralScale.map((step) => (
          <Swatch key={step} name={step} className={`bg-neutral-${step}`} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Foundations/Colors",
  component: PaletteGrid,
  parameters: { renderer: "@storybook/react" },
} satisfies Meta<typeof PaletteGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewPalette: Story = {};
