import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DEFAULT_PRIVACY, DEFAULT_SETTINGS, DEFAULT_TERMS } from "@/config/defaults";
import { applyDemoSettings, getDemoSettingsMemory } from "@/lib/demo/settings-memory";
import type { SiteSettings } from "@/types";

const FILE = path.join(process.cwd(), ".demo", "settings.json");

function normalize(data: Partial<SiteSettings> | undefined): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    privacyPolicy: DEFAULT_PRIVACY,
    terms: DEFAULT_TERMS,
    ...data,
    openingHours: data?.openingHours?.length
      ? data.openingHours
      : DEFAULT_SETTINGS.openingHours,
    social: { ...DEFAULT_SETTINGS.social, ...data?.social },
  };
}

export function hydrateDemoSettingsFromDisk(): SiteSettings {
  try {
    if (existsSync(FILE)) {
      const parsed = JSON.parse(readFileSync(FILE, "utf8")) as Partial<SiteSettings>;
      const settings = normalize(parsed);
      applyDemoSettings(settings);
      return settings;
    }
  } catch {
    // Ignore a missing or corrupt demo file and fall back to memory or defaults.
  }

  const memory = getDemoSettingsMemory();
  if (memory) return memory;

  const fallback = normalize(undefined);
  applyDemoSettings(fallback);
  return fallback;
}

export function persistDemoSettingsToDisk(settings: SiteSettings): SiteSettings {
  const next = normalize(settings);
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8");
  applyDemoSettings(next);
  return next;
}
