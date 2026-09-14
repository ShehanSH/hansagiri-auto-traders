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
import { isDemoMode, isFirebaseConfigured } from "@/lib/env";
import { buildSiteSeo } from "@/lib/seo/content";
import type { SiteSettings } from "@/types";

function withFallbacks(data: Partial<SiteSettings> | undefined): SiteSettings {
  const merged: SiteSettings = {
    ...DEFAULT_SETTINGS,
    privacyPolicy: DEFAULT_PRIVACY,
    terms: DEFAULT_TERMS,
    ...data,
    openingHours: data?.openingHours?.length
      ? data.openingHours
      : DEFAULT_SETTINGS.openingHours,
    social: { ...DEFAULT_SETTINGS.social, ...data?.social },
  };
  const seo = buildSiteSeo(merged);
  return {
    ...merged,
    seoTitle: merged.seoTitle.trim() || seo.title,
    seoDescription: merged.seoDescription.trim() || seo.description,
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
  try {
    if (isDemoMode() && !isFirebaseConfigured()) {
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
  } catch (error) {
    console.error("Failed to load site settings", error);
    return withFallbacks(undefined);
  }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const next = withFallbacks(settings);
  applyDemoSettings(next);

  if (isDemoMode() && !isFirebaseConfigured()) {
    if (typeof window !== "undefined") {
      await persistThroughApi(next);
    }
    return;
  }

  await setDoc(doc(getDb(), COLLECTIONS.settings, SETTINGS_DOC_ID), next, {
    merge: true,
  });
  if (typeof window !== "undefined") {
    try {
      await persistThroughApi(next);
    } catch (error) {
      console.warn("Settings saved, but the public cache could not be refreshed", error);
    }
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
