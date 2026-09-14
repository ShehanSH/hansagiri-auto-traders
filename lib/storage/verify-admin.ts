import { env } from "@/lib/env";

type TokenPayload = {
  aud?: string;
  exp?: number;
  sub?: string;
  user_id?: string;
};

type FirestoreAdminFields = {
  active?: { booleanValue?: boolean };
  role?: { stringValue?: string };
};

function uidFromIdToken(idToken: string): string | null {
  try {
    const [, encoded] = idToken.split(".");
    if (!encoded) return null;
    const json = Buffer.from(encoded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const payload = JSON.parse(json) as TokenPayload;
    if (payload.aud && env.firebaseProjectId && payload.aud !== env.firebaseProjectId) {
      return null;
    }
    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now() - 30_000) {
      return null;
    }
    return payload.user_id || payload.sub || null;
  } catch {
    return null;
  }
}

async function readAdminRecord(uid: string, idToken: string): Promise<{ active?: boolean; role?: string } | null> {
  const projectId = env.firebaseProjectId;
  if (!projectId) return null;

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${uid}`,
    {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: "no-store",
    },
  );
  if (!response.ok) return null;

  const payload = (await response.json()) as { fields?: FirestoreAdminFields };
  const fields = payload.fields;
  if (!fields) return null;

  return {
    active: fields.active?.booleanValue,
    role: fields.role?.stringValue,
  };
}

export async function verifyAdminIdToken(idToken: string): Promise<string | null> {
  const uid = uidFromIdToken(idToken);
  if (!uid) return null;

  const admin = await readAdminRecord(uid, idToken);
  if (!admin) return null;
  if (admin.active === false) return null;
  if (!admin.role || !["super_admin", "admin", "sales"].includes(admin.role)) return null;

  return uid;
}
