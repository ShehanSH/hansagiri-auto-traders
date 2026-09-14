import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";
import { env, isFirebaseConfigured } from "@/lib/env";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let appCheck: AppCheck | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        apiKey: env.firebaseApiKey,
        authDomain: env.firebaseAuthDomain,
        projectId: env.firebaseProjectId,
        storageBucket: env.firebaseStorageBucket,
        messagingSenderId: env.firebaseMessagingSenderId,
        appId: env.firebaseAppId,
        measurementId: env.firebaseMeasurementId || undefined,
      });

    if (typeof window !== "undefined" && env.firebaseAppCheckKey) {
      try {
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(env.firebaseAppCheckKey),
          isTokenAutoRefreshEnabled: true,
        });
      } catch {
        appCheck = null;
      }
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
    const app = getFirebaseApp();
    if (typeof window === "undefined") {
      try {
        db = initializeFirestore(app, { experimentalForceLongPolling: true });
      } catch {
        db = getFirestore(app);
      }
    } else {
      db = getFirestore(app);
    }
  }
  return db;
}

export function getAppCheck(): AppCheck | null {
  return appCheck;
}
