import { ColorPreset } from "./types";

export const COLOR_PRESETS: ColorPreset[] = [
  {
    name: "Neo Cobalt & Cyber Cyan",
    primary: "#2563eb",
    secondary: "#06b6d4",
    bgSuggested: "#0f172a",
    textColor: "text-cyan-400",
  },
  {
    name: "Premium Gold & Imperial Obsidian",
    primary: "#d4af37",
    secondary: "#1e293b",
    bgSuggested: "#0a0a0a",
    textColor: "text-amber-500",
  },
  {
    name: "Emerald Eco & Mint Leaf",
    primary: "#059669",
    secondary: "#34d399",
    bgSuggested: "#061f14",
    textColor: "text-emerald-400",
  },
  {
    name: "Sunset Crimson & Amber Spark",
    primary: "#e11d48",
    secondary: "#f59e0b",
    bgSuggested: "#1c0d0d",
    textColor: "text-rose-400",
  },
  {
    name: "Orchid Violet & Lavender Dream",
    primary: "#7c3aed",
    secondary: "#c084fc",
    bgSuggested: "#130a1c",
    textColor: "text-purple-400",
  },
  {
    name: "Monochrome Platinum & Space Slate",
    primary: "#475569",
    secondary: "#cbd5e1",
    bgSuggested: "#1e293b",
    textColor: "text-slate-300",
  },
];

export const STYLE_PREFERENCES = [
  {
    id: "minimalist-abstract",
    name: "Minimalist Abstract Symbol",
    description: "Clever overlapping geometric tracks, clean icons, luxurious spacing",
  },
  {
    id: "modern-monoline",
    name: "Modern Monoline Line-Art",
    description: "Elegant single-weight contours, continuous line graphics, sleek typography",
  },
  {
    id: "premium-crest",
    name: "Premium Hexagonal Shield / Crest",
    description: "Classic authoritative seals, symmetric grids, trustworthy structure",
  },
  {
    id: "futuristic-tech",
    name: "Futuristic Cyber Tech-Mark",
    description: "Sharp angles, neon grids, node connections, modular block structure",
  },
  {
    id: "artistic-organic",
    name: "Organic Eco Flow",
    description: "Soft curved paths, hand-drawn leaf/spiral geometry, warm gradients",
  },
];

export const INDUSTRIES = [
  "Software SaaS & AI",
  "Technology & Cybersecurity",
  "Eco, Plants & Sustainable Lifestyle",
  "Architecture, Interior & Real Estate",
  "Creative Media & Design Studio",
  "Cafe, Fine Dining & Artisan Bakery",
  "Personal Fitness & Mental Wellness",
  "Financial Markets & Venture Capital",
];

export const SAMPLE_PROMPTS = [
  {
    company: "Lumina AI",
    slogan: "Enlighten the complex",
    industry: "Software SaaS & AI",
    style: "Minimalist Abstract Symbol",
    preset: COLOR_PRESETS[0],
    desc: "A stylized abstract prism or spark that refracts neon cyan and blue rays, showing how AI brings clarity.",
  },
  {
    company: "Verdant Cafe",
    slogan: "Fresh roots, slow sips",
    industry: "Cafe, Fine Dining & Artisan Bakery",
    style: "Organic Eco Flow",
    preset: COLOR_PRESETS[2],
    desc: "A sleek vintage line-art coffee cup with a delicate leaf emerging from the steam, radiating natural vibes.",
  },
  {
    company: "Nexus Cyber",
    slogan: "Secure the perimeter",
    industry: "Technology & Cybersecurity",
    style: "Futuristic Cyber Tech-Mark",
    preset: COLOR_PRESETS[3],
    desc: "A stylized angular futuristic origami phoenix composed of sharp cyber paths, rising in shields.",
  },
  {
    company: "Aura Homes",
    slogan: "Space defined beautifully",
    industry: "Architecture, Interior & Real Estate",
    style: "Premium Hexagonal Shield / Crest",
    preset: COLOR_PRESETS[1],
    desc: "A high-end geometric gold hexagon containing sleek architectural angles forming the letter A and house beams.",
  },
];
