import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Tiwari Dairy",
  description: "Farmer milk purchase, payment and sales ledger",
};

// Keep the storage keys and default accent list in sync with src/lib/theme.ts
// — this runs before any JS bundle loads (strategy="beforeInteractive"), so
// it can't import that module; it's a deliberate literal copy of its logic.
// Applying the theme here, synchronously before first paint, is what avoids
// a flash of the wrong theme/mode on load.
const THEME_BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var mode = localStorage.getItem('tiwari-dairy-theme-mode');
    if (mode !== 'light' && mode !== 'dark') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var accent = localStorage.getItem('tiwari-dairy-accent-theme');
    if (['royal', 'emerald', 'sapphire', 'burgundy', 'slate'].indexOf(accent) === -1) {
      accent = 'royal';
    }
    var root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark');
    root.setAttribute('data-theme', accent);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {THEME_BOOTSTRAP_SCRIPT}
        </Script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "rounded-xl shadow-lg border font-sans",
            },
          }}
        />
      </body>
    </html>
  );
}
