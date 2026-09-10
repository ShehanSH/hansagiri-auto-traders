import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { DEFAULT_PRIVACY, DEFAULT_SETTINGS, DEFAULT_TERMS } from "@/config/defaults";
import { COLLECTIONS, SETTINGS_DOC_ID } from "@/lib/firebase/collections";
import { getDb } from "@/lib/firebase/client";
import { applyDemoSettings, getDemoSettingsMemory } from "@/lib/demo/settings-memory";
import { demoStore } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/env";
import type { SiteSettings } from "@/types";

function withFallbacks(data: Partial<SiteSettings> | undefined): SiteSettings {
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

async function persistThroughApi(settings: SiteSettings): Promise<void> {
  const response = await fetch("/api/site-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error("Could not save settings");
  }
}

export async function getSettings(): Promise<SiteSettings> {
  if (isDemoMode()) {
    if (typeof window !== "undefined") {
      const response = await fetch("/api/site-settings", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load settings");
      return withFallbacks(await response.json());
    }
    return getDemoSettingsMemory() ?? structuredClone(demoStore.settings);
  }

  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.settings, SETTINGS_DOC_ID));
  if (!snapshot.exists()) return withFallbacks(undefined);
  return withFallbacks(snapshot.data() as Partial<SiteSettings>);
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  if (isDemoMode()) {
    applyDemoSettings(settings);
    if (typeof window !== "undefined") {
      await persistThroughApi(settings);
    }
    return;
  }

  await setDoc(doc(getDb(), COLLECTIONS.settings, SETTINGS_DOC_ID), settings, {
    merge: true,
  });
  if (typeof window !== "undefined") {
    await persistThroughApi(settings);
  }
}

export async function ensureSettingsDocument(): Promise<void> {
  if (isDemoMode()) return;
  const ref = doc(getDb(), COLLECTIONS.settings, SETTINGS_DOC_ID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, withFallbacks(undefined));
  }
}

export async function updateSettingsField<K extends keyof SiteSettings>(
  key: K,
  value: SiteSettings[K],
): Promise<void> {
  if (isDemoMode()) {
    applyDemoSettings({ ...demoStore.settings, [key]: value });
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.settings, SETTINGS_DOC_ID), {
    [key]: value,
  });
}
