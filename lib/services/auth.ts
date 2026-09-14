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
import { ensureFirebaseConfigured, isDemoAuth, isFirebaseConfigured } from "@/lib/env";
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
  if (isDemoAuth()) return demoStore.demoUser;

  const ref = doc(getDb(), COLLECTIONS.admins, uid);
  try {
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    const data = snapshot.data() as AdminUser;
    if (data.active === false) return null;
    return { ...data, uid };
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
    if (code === "permission-denied") {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const retry = await getDoc(ref);
      if (!retry.exists()) return null;
      const data = retry.data() as AdminUser;
      if (data.active === false) return null;
      return { ...data, uid };
    }
    console.error("Failed to load admin record", error);
    throw error;
  }
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  await ensureFirebaseConfigured();

  if (isDemoAuth()) {
    if (email === "admin@local.dev" && password === "hansagiri-admin") {
      setSessionCookie("demo");
      return demoStore.demoUser;
    }
    throw new AppError("Invalid email or password.", "auth");
  }

  assertFirebaseReady();

  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await auth.authStateReady();
  await credential.user.getIdToken(true);
  const admin = await getAdminRecord(credential.user.uid);
  if (!admin) {
    await signOut(auth);
    throw new AppError("This account is not authorised for admin access.", "unauthorized");
  }
  const token = await credential.user.getIdToken();
  setSessionCookie(token.slice(0, 24));
  return admin;
}

export async function getAdminIdToken(): Promise<string | null> {
  if (isDemoAuth()) return null;
  if (!isFirebaseConfigured()) return null;
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return user.getIdToken(true);
}

export async function logoutAdmin(): Promise<void> {
  clearSessionCookie();
  if (!isDemoAuth() && isFirebaseConfigured()) {
    await signOut(getFirebaseAuth());
  }
}

export async function resetAdminPassword(email: string): Promise<void> {
  await ensureFirebaseConfigured();
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
  await ensureFirebaseConfigured();
  assertFirebaseReady();
  return verifyPasswordResetCode(getFirebaseAuth(), oobCode);
}

export async function completeAdminPasswordReset(oobCode: string, newPassword: string): Promise<void> {
  await ensureFirebaseConfigured();
  assertFirebaseReady();
  await confirmPasswordReset(getFirebaseAuth(), oobCode, newPassword);
}

export function subscribeAuth(
  callback: (user: User | null, admin: AdminUser | null) => void,
): () => void {
  if (isDemoAuth()) {
    const hasSession =
      typeof document !== "undefined" && document.cookie.includes(`${SESSION_COOKIE}=`);
    callback(null, hasSession ? demoStore.demoUser : null);
    return () => undefined;
  }

  if (!isFirebaseConfigured()) {
    callback(null, null);
    return () => undefined;
  }

  try {
    return onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        callback(null, null);
        return;
      }
      const admin = await getAdminRecord(user.uid);
      callback(user, admin);
    });
  } catch (error) {
    console.error("Failed to subscribe to admin auth", error);
    callback(null, null);
    return () => undefined;
  }
}

export function roleOf(admin: AdminUser | null): AdminRole | null {
  return admin?.role ?? null;
}
