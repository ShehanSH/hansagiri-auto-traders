import { PUBLIC_FIREBASE_CONFIG } from "@/lib/firebase/public-config";

function readEnv(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

export const env = {
  firebaseApiKey: readEnv("NEXT_PUBLIC_FIREBASE_API_KEY", PUBLIC_FIREBASE_CONFIG.apiKey),
  firebaseAuthDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", PUBLIC_FIREBASE_CONFIG.authDomain),
  firebaseProjectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", PUBLIC_FIREBASE_CONFIG.projectId),
  firebaseStorageBucket: readEnv(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    PUBLIC_FIREBASE_CONFIG.storageBucket,
  ),
  firebaseMessagingSenderId: readEnv(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    PUBLIC_FIREBASE_CONFIG.messagingSenderId,
  ),
  firebaseAppId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID", PUBLIC_FIREBASE_CONFIG.appId),
  firebaseMeasurementId: readEnv(
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    PUBLIC_FIREBASE_CONFIG.measurementId,
  ),
  firebaseAppCheckKey: readEnv("NEXT_PUBLIC_FIREBASE_APPCHECK_KEY"),
  blobReadWriteToken: readEnv("BLOB_READ_WRITE_TOKEN"),
  useDemoData: readEnv("NEXT_PUBLIC_USE_DEMO_DATA") === "true",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    env.firebaseApiKey &&
      env.firebaseAuthDomain &&
      env.firebaseProjectId &&
      env.firebaseStorageBucket &&
      env.firebaseAppId,
  );
}

function isHostedProduction(): boolean {
  const vercelEnv = readEnv("VERCEL_ENV") || readEnv("NEXT_PUBLIC_VERCEL_ENV");
  return vercelEnv === "production";
}

export function isDemoMode(): boolean {
  if (isHostedProduction()) return false;
  return env.useDemoData;
}
