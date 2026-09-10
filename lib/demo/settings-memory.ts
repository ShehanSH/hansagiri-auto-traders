import { demoStore } from "@/lib/demo/store";
import type { SiteSettings } from "@/types";

type DemoSettingsGlobal = typeof globalThis & {
  __hansagiriDemoSettings?: SiteSettings;
};

export function applyDemoSettings(settings: SiteSettings): void {
  const clone = structuredClone(settings);
  (globalThis as DemoSettingsGlobal).__hansagiriDemoSettings = clone;
  demoStore.settings = structuredClone(settings);
}

export function getDemoSettingsMemory(): SiteSettings | undefined {
  const fromGlobal = (globalThis as DemoSettingsGlobal).__hansagiriDemoSettings;
  return fromGlobal ? structuredClone(fromGlobal) : undefined;
}
