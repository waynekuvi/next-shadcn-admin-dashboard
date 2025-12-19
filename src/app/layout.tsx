import { ReactNode } from "react";

import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/config/app-config";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { THEME_MODE_VALUES, THEME_PRESET_VALUES, type ThemePreset, type ThemeMode } from "@/types/preferences/theme";
import { type Currency } from "@/stores/preferences/preferences-store";

const CURRENCY_VALUES = ["USD", "GBP", "EUR", "AED", "JPY", "CAD", "AUD", "CHF", "CNY", "INR"] as const;

import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Instrument_Serif({ weight: "400", subsets: ["latin"], style: ["italic", "normal"], variable: "--font-serif" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
  icons: {
    icon: "https://res.cloudinary.com/dwjvtgiid/image/upload/v1764419666/logo-white_x64htk.svg",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = await getPreference<ThemeMode>("theme_mode", THEME_MODE_VALUES, "light");
  const themePreset = await getPreference<ThemePreset>("theme_preset", THEME_PRESET_VALUES, "default");
  const currency = await getPreference<Currency>("currency", CURRENCY_VALUES, "USD");

  return (
    <html lang="en" className={`${themeMode} ${inter.variable} ${serif.variable} ${mono.variable}`} data-theme-preset={themePreset} suppressHydrationWarning>
      <body className="font-sans min-h-screen antialiased bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const themeMode = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('theme_mode='))
                    ?.split('=')[1] || '${themeMode}';
                  const html = document.documentElement;
                  if (themeMode === 'dark') {
                    html.classList.add('dark');
                  } else {
                    html.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers>
          <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset} currency={currency}>
            {children}
            <Toaster />
          </PreferencesStoreProvider>
        </Providers>
      </body>
    </html>
  );
}
