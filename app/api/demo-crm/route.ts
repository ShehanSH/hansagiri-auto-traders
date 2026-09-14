import { NextResponse } from "next/server";
import {
  hydrateDemoCrmFromDisk,
  persistDemoCrmToDisk,
  type DemoCrmSnapshot,
} from "@/lib/demo/persist-crm";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    if (!isDemoMode()) {
      return NextResponse.json({ error: "Demo CRM is only available in demo mode." }, { status: 404 });
    }
    return NextResponse.json(hydrateDemoCrmFromDisk());
  } catch (error) {
    console.error("Failed to load demo CRM", error);
    return NextResponse.json({ error: "Could not load demo records." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isDemoMode()) {
      return NextResponse.json({ error: "Demo CRM is only available in demo mode." }, { status: 404 });
    }
    const snapshot = (await request.json()) as DemoCrmSnapshot;
    persistDemoCrmToDisk(snapshot);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save demo CRM", error);
    return NextResponse.json({ ok: true });
  }
}
