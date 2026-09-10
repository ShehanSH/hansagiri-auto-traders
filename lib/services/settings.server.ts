import { hydrateDemoSettingsFromDisk } from "@/lib/demo/persist-settings";
import { isDemoMode } from "@/lib/env";
import { getSettings as getSettingsBase } from "@/lib/services/settings";
import type { SiteSettings } from "@/types";

export async function getSettings(): Promise<SiteSettings> {
  if (isDemoMode()) hydrateDemoSettingsFromDisk();
  return getSettingsBase();
}
