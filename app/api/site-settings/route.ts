import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isDemoMode, isFirebaseConfigured } from "@/lib/env";
import {
  hydrateDemoSettingsFromDisk,
  persistDemoSettingsToDisk,
} from "@/lib/demo/persist-settings";
import { getSettings } from "@/lib/services/settings";
import type { SiteSettings } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function revalidatePublicSite() {
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/privacy-policy");
  revalidatePath("/terms");
  revalidatePath("/vehicles");
}

export async function GET() {
  try {
    if (isDemoMode() && !isFirebaseConfigured()) {
      return NextResponse.json(hydrateDemoSettingsFromDisk());
    }
    return NextResponse.json(await getSettings());
  } catch (error) {
    console.error("Failed to load site settings", error);
    return NextResponse.json({ error: "Could not load settings." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const settings = (await request.json()) as SiteSettings;
    persistDemoSettingsToDisk(settings);
    try {
      revalidatePublicSite();
    } catch (error) {
      console.error("Failed to revalidate after settings save", error);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save site settings", error);
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
  }
}
