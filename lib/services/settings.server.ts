import { DEFAULT_PRIVACY, DEFAULT_SETTINGS, DEFAULT_TERMS } from "@/config/defaults";
import { isDemoMode, isFirebaseConfigured } from "@/lib/env";
import { getSettings as getSettingsBase } from "@/lib/services/settings";
import type { SiteSettings } from "@/types";

function fallbackSettings(): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    privacyPolicy: DEFAULT_PRIVACY,
    terms: DEFAULT_TERMS,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    if (isDemoMode() && !isFirebaseConfigured()) {
      const { hydrateDemoSettingsFromDisk } = await import("@/lib/demo/persist-settings");
      hydrateDemoSettingsFromDisk();
    }
    return await getSettingsBase();
  } catch (error) {
    console.error("Failed to load site settings", error);
    return fallbackSettings();
  }
}
