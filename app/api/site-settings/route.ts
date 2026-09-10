import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { isDemoMode } from "@/lib/env";
import {
  hydrateDemoSettingsFromDisk,
  persistDemoSettingsToDisk,
} from "@/lib/demo/persist-settings";
import { getSettings } from "@/lib/services/settings";
import type { SiteSettings } from "@/types";

function revalidatePublicSite() {
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/privacy-policy");
  revalidatePath("/terms");
  revalidatePath("/vehicles");
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json(hydrateDemoSettingsFromDisk());
  }
  return NextResponse.json(await getSettings());
}

export async function PUT(request: Request) {
  const settings = (await request.json()) as SiteSettings;

  if (isDemoMode()) {
    persistDemoSettingsToDisk(settings);
  }

  revalidatePublicSite();
  return NextResponse.json({ ok: true });
}
