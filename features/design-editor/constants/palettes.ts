import { Theme, defaultTheme } from "@/contexts/ThemeContext";

export const PALETTES: { name: string; theme: Theme }[] = [
  { name: "Default Green", theme: defaultTheme },
  { name: "Ocean Blue", theme: { ...defaultTheme, primary: "#1E3A5F", primaryLight: "#EFF6FF", primaryDark: "#0F1D30", accent: "#3B82F6", accentLight: "#60A5FA", accentLime: "#38BDF8", border: "#2D5A8E" } },
  { name: "Royal Purple", theme: { ...defaultTheme, primary: "#3B0764", primaryLight: "#F5F3FF", primaryDark: "#1E0334", accent: "#7C3AED", accentLight: "#A78BFA", accentLime: "#C084FC", border: "#581C87" } },
  { name: "Warm Orange", theme: { ...defaultTheme, primary: "#7C2D12", primaryLight: "#FFF7ED", primaryDark: "#431407", accent: "#EA580C", accentLight: "#FB923C", accentLime: "#FBBF24", border: "#9A3412" } },
  { name: "Rose Pink", theme: { ...defaultTheme, primary: "#881337", primaryLight: "#FFF1F2", primaryDark: "#4C0519", accent: "#E11D48", accentLight: "#FB7185", accentLime: "#FDA4AF", border: "#9F1239" } },
  { name: "Slate Dark", theme: { ...defaultTheme, primary: "#0F172A", primaryLight: "#F8FAFC", primaryDark: "#020617", accent: "#475569", accentLight: "#94A3B8", accentLime: "#CBD5E1", border: "#1E293B" } },
  { name: "Teal", theme: { ...defaultTheme, primary: "#134E4A", primaryLight: "#F0FDFA", primaryDark: "#042F2E", accent: "#0D9488", accentLight: "#2DD4BF", accentLime: "#5EEAD4", border: "#115E59" } },
  { name: "Gold & Black", theme: { ...defaultTheme, primary: "#1C1917", primaryLight: "#FFFBEB", primaryDark: "#0C0A09", accent: "#A16207", accentLight: "#CA8A04", accentLime: "#FBBF24", border: "#292524" } },
  { name: "Crimson Red", theme: { ...defaultTheme, primary: "#450A0A", primaryLight: "#FEF2F2", primaryDark: "#1C0404", accent: "#DC2626", accentLight: "#F87171", accentLime: "#FCA5A5", border: "#7F1D1D" } },
  { name: "Forest", theme: { ...defaultTheme, primary: "#14532D", primaryLight: "#F0FDF4", primaryDark: "#052E16", accent: "#16A34A", accentLight: "#4ADE80", accentLime: "#86EFAC", border: "#166534" } },
];
