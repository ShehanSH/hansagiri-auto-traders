function readEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

type RuntimeFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};

let runtimeFirebase: Partial<RuntimeFirebaseConfig> = {};

export function applyRuntimeFirebaseConfig(config: RuntimeFirebaseConfig): void {
  runtimeFirebase = {
    apiKey: config.apiKey.trim(),
    authDomain: config.authDomain.trim(),
    projectId: config.projectId.trim(),
    storageBucket: config.storageBucket.trim(),
    messagingSenderId: config.messagingSenderId.trim(),
    appId: config.appId.trim(),
    measurementId: config.measurementId.trim(),
  };
}

export const env = {
  get firebaseApiKey() {
    return readEnv("NEXT_PUBLIC_FIREBASE_API_KEY") || runtimeFirebase.apiKey || "";
  },
  get firebaseAuthDomain() {
    return readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") || runtimeFirebase.authDomain || "";
  },
  get firebaseProjectId() {
    return readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID") || runtimeFirebase.projectId || "";
  },
  get firebaseStorageBucket() {
    return readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") || runtimeFirebase.storageBucket || "";
  },
  get firebaseMessagingSenderId() {
    return readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") || runtimeFirebase.messagingSenderId || "";
  },
  get firebaseAppId() {
    return readEnv("NEXT_PUBLIC_FIREBASE_APP_ID") || runtimeFirebase.appId || "";
  },
  get firebaseMeasurementId() {
    return readEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID") || runtimeFirebase.measurementId || "";
  },
  get firebaseAppCheckKey() {
    return readEnv("NEXT_PUBLIC_FIREBASE_APPCHECK_KEY");
  },
  get blobReadWriteToken() {
    return readEnv("BLOB_READ_WRITE_TOKEN");
  },
  get useDemoData() {
    return readEnv("NEXT_PUBLIC_USE_DEMO_DATA") === "true";
  },
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

export async function ensureFirebaseConfigured(): Promise<boolean> {
  if (isFirebaseConfigured()) return true;
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch("/api/firebase-config", { cache: "no-store" });
    if (!response.ok) return false;
    const payload = (await response.json()) as Partial<RuntimeFirebaseConfig>;
    if (payload.apiKey && payload.authDomain && payload.projectId && payload.storageBucket && payload.appId) {
      applyRuntimeFirebaseConfig({
        apiKey: payload.apiKey,
        authDomain: payload.authDomain,
        projectId: payload.projectId,
        storageBucket: payload.storageBucket,
        messagingSenderId: payload.messagingSenderId ?? "",
        appId: payload.appId,
        measurementId: payload.measurementId ?? "",
      });
    }
  } catch (error) {
    console.error("Failed to load Firebase config", error);
  }

  return isFirebaseConfigured();
}

export function isDemoMode(): boolean {
  return env.useDemoData;
}

export function isDemoAuth(): boolean {
  return isDemoMode() && !isFirebaseConfigured();
}
