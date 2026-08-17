export const ACCENT_THEMES = ["royal", "emerald", "sapphire", "burgundy", "slate"] as const;
export type AccentTheme = (typeof ACCENT_THEMES)[number];

export const ACCENT_THEME_LABELS: Record<AccentTheme, string> = {
  royal: "Royal",
  emerald: "Emerald",
  sapphire: "Sapphire",
  burgundy: "Burgundy",
  slate: "Slate",
};

// Swatch hex values purely for rendering the picker UI — the actual applied
// color always comes from the CSS variables in globals.css; these must stay
// in sync with --color-accent per [data-theme] there.
export const ACCENT_THEME_SWATCH: Record<AccentTheme, string> = {
  royal: "#7c3aed",
  emerald: "#059669",
  sapphire: "#2563eb",
  burgundy: "#be123c",
  slate: "#475569",
};

export type ThemeMode = "light" | "dark";

export const THEME_MODE_STORAGE_KEY = "tiwari-dairy-theme-mode";
export const ACCENT_THEME_STORAGE_KEY = "tiwari-dairy-accent-theme";

export function isAccentTheme(value: unknown): value is AccentTheme {
  return typeof value === "string" && (ACCENT_THEMES as readonly string[]).includes(value);
}

/**
 * The exact logic run twice: once synchronously in a blocking <script> in
 * <head> (as a string, before hydration — see the inline script in
 * app/layout.tsx) to avoid a flash of the wrong theme, and once here for the
 * ThemeToggle component to reuse when the user actively changes it. Keep
 * these in sync; the inline script can't import this module (it runs before
 * any JS bundle loads), so it's a literal copy of this function's logic.
 */
export function applyTheme(mode: ThemeMode, accent: AccentTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = accent;
}
