"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { hasRole } from "@/lib/auth/permissions";
import { getSettings, saveSettings } from "@/lib/services/settings";
import { buildSiteSeo } from "@/lib/seo/content";
import { logActivity } from "@/lib/services/crm";
import { toUserMessage } from "@/utils/errors";
import type { SiteSettings } from "@/types";

export default function SettingsPage() {
  const toast = useToast();
  const { admin } = useAdminAuth();
  const canWrite = hasRole(admin?.role, "settings") || hasRole(admin?.role, "*");
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (!settings) return <p className="text-muted">Loading…</p>;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite || !admin || !settings) return;
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const generated = buildSiteSeo({
      businessName: String(data.businessName),
      businessDescription: String(data.businessDescription),
      address: String(data.address),
    });
    const next: SiteSettings = {
      ...settings,
      businessName: String(data.businessName),
      businessDescription: String(data.businessDescription),
      phone: String(data.phone),
      whatsapp: String(data.whatsapp),
      email: String(data.email),
      address: String(data.address),
      mapsUrl: String(data.mapsUrl),
      currency: String(data.currency),
      heroTitle: String(data.heroTitle),
      heroSubtitle: String(data.heroSubtitle),
      heroSupporting: String(data.heroSupporting),
      seoTitle: String(data.seoTitle).trim() || generated.title,
      seoDescription: String(data.seoDescription).trim() || generated.description,
      featuredLimit: Number(data.featuredLimit) || 6,
      showSoldVehicles: data.showSoldVehicles === "on",
      showReservedVehicles: data.showReservedVehicles === "on",
      privacyPolicy: String(data.privacyPolicy),
      terms: String(data.terms),
      social: {
        facebook: String(data.facebook),
        instagram: String(data.instagram),
        tiktok: String(data.tiktok),
        youtube: String(data.youtube),
        whatsapp: String(data.whatsapp),
      },
    };
    try {
      await saveSettings(next);
      await logActivity({
        userId: admin.uid,
        userEmail: admin.email,
        action: "Settings updated",
        entityType: "settings",
        entityId: "site",
      });
      setSettings(next);
      toast.push("Website settings have been saved.");
    } catch (error) {
      toast.push(toUserMessage(error, "Could not save settings. Please try again."), "error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
      <h1 className="font-display text-3xl">Settings</h1>
      <Input name="businessName" label="Business name" defaultValue={settings.businessName} />
      <Textarea name="businessDescription" label="Description" defaultValue={settings.businessDescription} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="phone" label="Phone" defaultValue={settings.phone} />
        <Input name="whatsapp" label="WhatsApp" defaultValue={settings.whatsapp} />
        <Input name="email" label="Email" defaultValue={settings.email} />
        <Input name="currency" label="Currency" defaultValue={settings.currency} />
      </div>
      <Input name="address" label="Address" defaultValue={settings.address} />
      <Input name="mapsUrl" label="Google Maps embed URL" defaultValue={settings.mapsUrl} />
      <Input name="heroTitle" label="Hero title" defaultValue={settings.heroTitle} />
      <Input name="heroSubtitle" label="Hero subtitle" defaultValue={settings.heroSubtitle} />
      <Input name="heroSupporting" label="Hero supporting text" defaultValue={settings.heroSupporting} />
      <Input
        name="seoTitle"
        label="SEO title"
        defaultValue={settings.seoTitle}
        hint="Auto-filled from the business name if left blank."
      />
      <Textarea
        name="seoDescription"
        label="SEO description"
        defaultValue={settings.seoDescription}
        hint="Auto-filled from the business description if left blank."
      />
      <Input name="featuredLimit" type="number" label="Featured vehicle limit" defaultValue={String(settings.featuredLimit)} />
      <label className="flex items-center gap-2 text-sm">
        <input name="showReservedVehicles" type="checkbox" defaultChecked={settings.showReservedVehicles} />
        Show reserved vehicles on the public site
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="showSoldVehicles" type="checkbox" defaultChecked={settings.showSoldVehicles} />
        Show sold vehicles on the public site
      </label>
      <Input name="facebook" label="Facebook URL" defaultValue={settings.social.facebook} />
      <Input name="instagram" label="Instagram URL" defaultValue={settings.social.instagram} />
      <Input name="tiktok" label="TikTok URL" defaultValue={settings.social.tiktok} />
      <Input name="youtube" label="YouTube URL" defaultValue={settings.social.youtube} />
      <Textarea name="privacyPolicy" label="Privacy policy" defaultValue={settings.privacyPolicy} />
      <Textarea name="terms" label="Terms" defaultValue={settings.terms} />
      {canWrite ? <Button type="submit">Save settings</Button> : <p className="text-sm text-muted">Read-only</p>}
    </form>
  );
}
