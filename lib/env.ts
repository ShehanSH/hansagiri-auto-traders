function readEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export const env = {
  firebaseApiKey: readEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  firebaseAuthDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  firebaseProjectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  firebaseStorageBucket: readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  firebaseMessagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  firebaseAppId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  firebaseMeasurementId: readEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
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

export function isDemoMode(): boolean {
  if (env.useDemoData) return true;
  return !isFirebaseConfigured();
}
