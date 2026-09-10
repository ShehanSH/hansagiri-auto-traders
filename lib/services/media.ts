import { addDoc, collection, getDocs, limit, orderBy, query, updateDoc } from "firebase/firestore";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/config/constants";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { demoStore } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/env";
import { getAdminIdToken } from "@/lib/services/auth";
import { nowIso } from "@/lib/firebase/timestamps";
import { AppError } from "@/utils/errors";
import type { MediaAsset, VehicleImage } from "@/types";

export function validateImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new AppError("Please upload a JPG, PNG, WebP, or AVIF image.", "invalid_type");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError("Images must be 8MB or smaller.", "file_too_large");
  }
}

async function compressImage(file: File): Promise<File | Blob> {
  if (file.size < 400_000 || !file.type.startsWith("image/")) return file;
  if (typeof window === "undefined" || typeof createImageBitmap === "undefined") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxWidth = 1920;
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), "image/jpeg", 0.82),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

async function uploadViaBlobApi(
  file: File | Blob,
  folder: string,
  fileName: string,
  contentType: string,
  idToken?: string,
): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append("folder", folder);
  formData.append("file", file instanceof File ? file : new File([file], fileName, { type: contentType }));

  const headers: HeadersInit = {};
  if (idToken) headers.Authorization = `Bearer ${idToken}`;

  const response = await fetch("/api/uploads", { method: "POST", body: formData, headers });
  const payload = (await response.json()) as { url?: string; path?: string; error?: string };
  if (!response.ok) {
    throw new AppError(payload.error ?? "Upload failed.", "upload_failed");
  }
  if (!payload.url || !payload.path) {
    throw new AppError("Upload failed.", "upload_failed");
  }
  return { url: payload.url, path: payload.path };
}

export async function uploadPublicTradeInImage(file: File): Promise<VehicleImage> {
  validateImageFile(file);
  const blob = await compressImage(file);

  if (isDemoMode()) {
    const url = URL.createObjectURL(file);
    return {
      url,
      path: `demo/trade-ins/${file.name}`,
      alt: file.name,
      sortOrder: 0,
    };
  }

  const { url, path } = await uploadViaBlobApi(blob, "trade-in-uploads", file.name, file.type);
  return { url, path, alt: file.name, sortOrder: 0 };
}

export async function uploadAdminImage(
  file: File,
  folder: string,
  userId: string,
): Promise<MediaAsset> {
  validateImageFile(file);
  const blob = await compressImage(file);

  if (isDemoMode()) {
    const asset: MediaAsset = {
      id: demoStore.id("media"),
      url: URL.createObjectURL(file),
      path: `demo/${folder}/${file.name}`,
      name: file.name,
      contentType: file.type,
      size: file.size,
      folder,
      createdAt: nowIso(),
      createdBy: userId,
    };
    demoStore.media.unshift(asset);
    return asset;
  }

  const idToken = await getAdminIdToken();
  if (!idToken) {
    throw new AppError("You must be signed in to upload files.", "unauthorized");
  }

  const { url, path } = await uploadViaBlobApi(blob, folder, file.name, file.type, idToken);
  const asset: MediaAsset = {
    id: "",
    url,
    path,
    name: file.name,
    contentType: file.type,
    size: file.size,
    folder,
    createdAt: nowIso(),
    createdBy: userId,
  };
  const docRef = await addDoc(collection(getDb(), COLLECTIONS.media), asset);
  await updateDoc(docRef, { id: docRef.id });
  return { ...asset, id: docRef.id };
}

export async function listMedia(): Promise<MediaAsset[]> {
  if (isDemoMode()) return [...demoStore.media];
  const snapshot = await getDocs(
    query(collection(getDb(), COLLECTIONS.media), orderBy("createdAt", "desc"), limit(100)),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as MediaAsset);
}

export async function deleteMedia(path: string): Promise<void> {
  if (isDemoMode()) {
    demoStore.media = demoStore.media.filter((item) => item.path !== path);
    return;
  }

  const idToken = await getAdminIdToken();
  if (!idToken) {
    throw new AppError("You must be signed in to delete files.", "unauthorized");
  }

  const response = await fetch("/api/uploads", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new AppError(payload.error ?? "Delete failed.", "delete_failed");
  }
}
