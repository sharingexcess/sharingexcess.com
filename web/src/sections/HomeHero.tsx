import HeroSection, { type HeroSectionProps } from "./HeroSection";

export type HomeHeroProps = Omit<HeroSectionProps, "layout">;

/** Home page full-bleed hero with inline donate form. */
export function HomeHero(props: HomeHeroProps) {
  return <HeroSection {...props} layout="rounded-donate" />;
}

export default HomeHero;
