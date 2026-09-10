import { NextResponse } from "next/server";
import {
  hydrateDemoCrmFromDisk,
  persistDemoCrmToDisk,
  type DemoCrmSnapshot,
} from "@/lib/demo/persist-crm";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo CRM is only available in demo mode." }, { status: 404 });
  }
  return NextResponse.json(hydrateDemoCrmFromDisk());
}

export async function PUT(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo CRM is only available in demo mode." }, { status: 404 });
  }
  const snapshot = (await request.json()) as DemoCrmSnapshot;
  persistDemoCrmToDisk(snapshot);
  return NextResponse.json({ ok: true });
}
