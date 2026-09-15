import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/config/constants";
import { AppError } from "@/utils/errors";

export function validateImageUpload(contentType: string, size: number): void {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new AppError("Please upload a JPG, PNG, WebP, or AVIF image.", "invalid_type");
  }
  if (size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError("Images must be 8MB or smaller.", "file_too_large");
  }
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_");
}

export const PUBLIC_UPLOAD_FOLDERS = ["trade-in-uploads"] as const;
export const ADMIN_UPLOAD_FOLDERS = ["vehicles"] as const;

export function isAllowedUploadFolder(folder: string): boolean {
  return (
    (PUBLIC_UPLOAD_FOLDERS as readonly string[]).includes(folder) ||
    (ADMIN_UPLOAD_FOLDERS as readonly string[]).includes(folder)
  );
}

export function isPublicUploadFolder(folder: string): boolean {
  return (PUBLIC_UPLOAD_FOLDERS as readonly string[]).includes(folder);
}
