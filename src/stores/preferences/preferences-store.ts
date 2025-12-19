import { createStore } from "zustand/vanilla";

import type { ThemeMode, ThemePreset } from "@/types/preferences/theme";

export type Currency = "USD" | "GBP" | "EUR" | "AED" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "INR";

export type PreferencesState = {
  themeMode: ThemeMode;
  themePreset: ThemePreset;
  currency: Currency;
  setThemeMode: (mode: ThemeMode) => void;
  setThemePreset: (preset: ThemePreset) => void;
  setCurrency: (currency: Currency) => void;
};

export const createPreferencesStore = (init?: Partial<PreferencesState>) =>
  createStore<PreferencesState>()((set) => ({
    themeMode: init?.themeMode ?? "light",
    themePreset: init?.themePreset ?? "default",
    currency: init?.currency ?? "USD",
    setThemeMode: (mode) => set({ themeMode: mode }),
    setThemePreset: (preset) => set({ themePreset: preset }),
    setCurrency: (currency) => set({ currency }),
  }));
