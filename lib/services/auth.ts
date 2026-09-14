import {
  confirmPasswordReset,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  verifyPasswordResetCode,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { demoStore } from "@/lib/demo/store";
import { isDemoMode, isFirebaseConfigured } from "@/lib/env";
import { AppError } from "@/utils/errors";
import type { AdminRole, AdminUser } from "@/types";

const SESSION_COOKIE = "hat_admin_session";

function assertFirebaseReady(): void {
  if (!isFirebaseConfigured()) {
    throw new AppError(
      "Firebase is not connected on this deployment. Add the NEXT_PUBLIC_FIREBASE_* variables in Vercel, then redeploy.",
      "firebase_not_configured",
    );
  }
}

function setSessionCookie(value: string) {
  document.cookie = `${SESSION_COOKIE}=${value}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

export async function getAdminRecord(uid: string): Promise<AdminUser | null> {
  if (isDemoMode()) return demoStore.demoUser;
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.admins, uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as AdminUser;
  if (data.active === false) return null;
  return { ...data, uid };
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  if (isDemoMode()) {
    if (email === "admin@local.dev" && password === "hansagiri-admin") {
      setSessionCookie("demo");
      return demoStore.demoUser;
    }
    throw new AppError("Invalid email or password.", "auth");
  }

  assertFirebaseReady();

  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  const admin = await getAdminRecord(credential.user.uid);
  if (!admin) {
    await signOut(getFirebaseAuth());
    throw new AppError("This account is not authorised for admin access.", "unauthorized");
  }
  const token = await credential.user.getIdToken();
  setSessionCookie(token.slice(0, 24));
  return admin;
}

export async function getAdminIdToken(): Promise<string | null> {
  if (isDemoMode()) return null;
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function logoutAdmin(): Promise<void> {
  clearSessionCookie();
  if (!isDemoMode()) {
    await signOut(getFirebaseAuth());
  }
}

export async function resetAdminPassword(email: string): Promise<void> {
  if (isDemoMode()) {
    throw new AppError("Password reset is only available on the production Firebase project.", "demo");
  }

  assertFirebaseReady();

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email, {
      url: `${origin}/admin/login`,
    });
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
    if (code === "auth/user-not-found" || code === "auth/invalid-email") return;
    throw error;
  }
}

export async function readPasswordResetEmail(oobCode: string): Promise<string> {
  assertFirebaseReady();
  return verifyPasswordResetCode(getFirebaseAuth(), oobCode);
}

export async function completeAdminPasswordReset(oobCode: string, newPassword: string): Promise<void> {
  assertFirebaseReady();
  await confirmPasswordReset(getFirebaseAuth(), oobCode, newPassword);
}

export function subscribeAuth(
  callback: (user: User | null, admin: AdminUser | null) => void,
): () => void {
  if (isDemoMode()) {
    const hasSession =
      typeof document !== "undefined" && document.cookie.includes(`${SESSION_COOKIE}=`);
    callback(null, hasSession ? demoStore.demoUser : null);
    return () => undefined;
  }

  return onAuthStateChanged(getFirebaseAuth(), async (user) => {
    if (!user) {
      callback(null, null);
      return;
    }
    const admin = await getAdminRecord(user.uid);
    callback(user, admin);
  });
}

export function roleOf(admin: AdminUser | null): AdminRole | null {
  return admin?.role ?? null;
}
