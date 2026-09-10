import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getDb } from "@/lib/firebase/client";
import { env } from "@/lib/env";

type TokenLookup = {
  users?: Array<{ localId: string }>;
};

export async function verifyAdminIdToken(idToken: string): Promise<string | null> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.firebaseApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) return null;

  const payload = (await response.json()) as TokenLookup;
  const uid = payload.users?.[0]?.localId;
  if (!uid) return null;

  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.admins, uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as { active?: boolean; role?: string };
  if (data.active === false) return null;
  if (!data.role || !["super_admin", "admin", "sales"].includes(data.role)) return null;

  return uid;
}
