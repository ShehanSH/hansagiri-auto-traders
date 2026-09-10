export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { isDemoMode } = await import("@/lib/env");
  if (!isDemoMode()) return;
  const { hydrateDemoSettingsFromDisk } = await import("@/lib/demo/persist-settings");
  const { hydrateDemoCrmFromDisk } = await import("@/lib/demo/persist-crm");
  hydrateDemoSettingsFromDisk();
  hydrateDemoCrmFromDisk();
}
