import { NextResponse } from "next/server";
import { isMemoryCatalog } from "@/lib/env";
import {
  isAllowedUploadFolder,
  isPublicUploadFolder,
  sanitizeFileName,
  validateImageUpload,
} from "@/lib/storage/validate-image";
import { verifyAdminIdToken } from "@/lib/storage/verify-admin";
import { deleteBlobFile, uploadBlobFile } from "@/lib/storage/vercel-blob";
import { AppError } from "@/utils/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

export async function POST(request: Request) {
  if (isMemoryCatalog()) {
    return NextResponse.json({ error: "Uploads are disabled in local demo mode." }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }
    if (!folder || !isAllowedUploadFolder(folder)) {
      return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
    }

    if (!isPublicUploadFolder(folder)) {
      const idToken = readBearerToken(request);
      if (!idToken) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      }
      const uid = await verifyAdminIdToken(idToken);
      if (!uid) {
        return NextResponse.json(
          { error: "Not authorised to upload files. Sign in again and retry." },
          { status: 403 },
        );
      }
    }

    validateImageUpload(file.type, file.size);

    const safeName = sanitizeFileName(file.name);
    const pathname =
      folder === "trade-in-uploads"
        ? `${folder}/${crypto.randomUUID()}/${safeName}`
        : `${folder}/${crypto.randomUUID()}-${safeName}`;

    const result = await uploadBlobFile(pathname, file, file.type);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (isMemoryCatalog()) {
    return NextResponse.json({ error: "Uploads are disabled in local demo mode." }, { status: 503 });
  }

  try {
    const idToken = readBearerToken(request);
    if (!idToken) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const uid = await verifyAdminIdToken(idToken);
    if (!uid) {
      return NextResponse.json({ error: "Not authorised." }, { status: 403 });
    }

    const body = (await request.json()) as { path?: string };
    const path = body.path?.trim();
    if (!path) {
      return NextResponse.json({ error: "Path is required." }, { status: 400 });
    }

    await deleteBlobFile(path);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
