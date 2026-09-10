"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/config/defaults";

const SettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
