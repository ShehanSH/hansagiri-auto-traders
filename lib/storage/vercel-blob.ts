import { del, put } from "@vercel/blob";
import { env } from "@/lib/env";
import { AppError } from "@/utils/errors";

export function assertBlobConfigured(): void {
  if (!env.blobReadWriteToken) {
    throw new AppError(
      "File storage is not configured. Add BLOB_READ_WRITE_TOKEN to your environment.",
      "blob_not_configured",
    );
  }
}

export async function uploadBlobFile(
  pathname: string,
  file: Blob,
  contentType: string,
): Promise<{ url: string; path: string }> {
  assertBlobConfigured();
  const blob = await put(pathname, file, {
    access: "public",
    token: env.blobReadWriteToken,
    contentType,
    addRandomSuffix: false,
  });
  return { url: blob.url, path: blob.pathname };
}

export async function deleteBlobFile(pathname: string): Promise<void> {
  assertBlobConfigured();
  await del(pathname, { token: env.blobReadWriteToken });
}
