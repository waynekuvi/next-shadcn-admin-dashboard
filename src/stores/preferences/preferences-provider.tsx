"use client";

import { createContext, useContext, useEffect, useRef } from "react";

import { useStore, type StoreApi } from "zustand";

import { createPreferencesStore, PreferencesState } from "./preferences-store";
import { updateThemeMode, updateThemePreset } from "@/lib/theme-utils";

const PreferencesStoreContext = createContext<StoreApi<PreferencesState> | null>(null);

export const PreferencesStoreProvider = ({
  children,
  themeMode,
  themePreset,
  currency,
}: {
  children: React.ReactNode;
  themeMode: PreferencesState["themeMode"];
  themePreset: PreferencesState["themePreset"];
  currency?: PreferencesState["currency"];
}) => {
  const storeRef = useRef<StoreApi<PreferencesState> | null>(null);

  storeRef.current ??= createPreferencesStore({ themeMode, themePreset, currency });

  // Initialize theme on mount
  useEffect(() => {
    updateThemeMode(themeMode);
    updateThemePreset(themePreset);
  }, [themeMode, themePreset]);

  return <PreferencesStoreContext.Provider value={storeRef.current}>{children}</PreferencesStoreContext.Provider>;
};

export const usePreferencesStore = <T,>(selector: (state: PreferencesState) => T): T => {
  const store = useContext(PreferencesStoreContext);
  if (!store) throw new Error("Missing PreferencesStoreProvider");
  return useStore(store, selector);
};
