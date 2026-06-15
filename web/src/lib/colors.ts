/** Token names for use in component props — values live in global.css @theme. */
export const brandColors = [
  "se-green",
  "bright-kelly",
  "kale",
  "banana",
  "tangerine",
  "guava",
  "blueberry",
  "dark-cherry",
] as const;

export type BrandColor = (typeof brandColors)[number];

export const formSectionVariants = [
  "brand-green",
  "brand-green-glass",
  "kale-glass",
  "dark-green",
  "white",
  "banana",
  "tangerine",
] as const;
