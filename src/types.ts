export interface LogoVariation {
  id: string;
  vibeTitle: string;
  conceptDescription: string;
  svgCode: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  badgeText: string;
  ratingScore: number;
}

export type AnimationType = "line-draw" | "reveal" | "glow" | "spin" | "none";
export type BackgroundTheme = "dark-grid" | "light-grid" | "slate-luxury" | "pure-white";

export interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  bgSuggested: string;
  textColor: string;
}

export interface DesignHistoryItem {
  timestamp: string;
  companyName: string;
  logo: LogoVariation;
}
