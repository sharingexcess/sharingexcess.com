import type { ReactNode } from "react";

export type SectionTheme = "light" | "dark";

export type FormSectionVariant =
  | "dark-green"
  | "light-green"
  | "white"
  | "tangerine"
  | "banana";

export type ImagePosition = "left" | "right";
export type ImageStyle = "square" | "round";

export interface SectionProps {
  theme?: SectionTheme;
  id?: string;
  className?: string;
  children?: ReactNode;
}
