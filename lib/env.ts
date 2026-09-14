function readSecret(name: string): string {
  return process.env[name]?.trim() ?? "";
}

// Next.js only inlines NEXT_PUBLIC_* when the key is a static member access.
const publicEnv = {
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  firebaseMeasurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
  firebaseAppCheckKey: process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_KEY ?? "",
  useDemoData: process.env.NEXT_PUBLIC_USE_DEMO_DATA ?? "",
};

function publicValue(value: string): string {
  return value.trim();
}

type RuntimeFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  useDemoData?: boolean;
};

let runtimeFirebase: Partial<RuntimeFirebaseConfig> = {};
let runtimeUseDemoData: boolean | null = null;

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
  if (typeof config.useDemoData === "boolean") {
    runtimeUseDemoData = config.useDemoData;
  }
}

export function applyRuntimeDemoMode(enabled: boolean): void {
  runtimeUseDemoData = enabled;
}

export const env = {
  get firebaseApiKey() {
    return publicValue(publicEnv.firebaseApiKey) || runtimeFirebase.apiKey || "";
  },
  get firebaseAuthDomain() {
    return publicValue(publicEnv.firebaseAuthDomain) || runtimeFirebase.authDomain || "";
  },
  get firebaseProjectId() {
    return publicValue(publicEnv.firebaseProjectId) || runtimeFirebase.projectId || "";
  },
  get firebaseStorageBucket() {
    return publicValue(publicEnv.firebaseStorageBucket) || runtimeFirebase.storageBucket || "";
  },
  get firebaseMessagingSenderId() {
    return publicValue(publicEnv.firebaseMessagingSenderId) || runtimeFirebase.messagingSenderId || "";
  },
  get firebaseAppId() {
    return publicValue(publicEnv.firebaseAppId) || runtimeFirebase.appId || "";
  },
  get firebaseMeasurementId() {
    return publicValue(publicEnv.firebaseMeasurementId) || runtimeFirebase.measurementId || "";
  },
  get firebaseAppCheckKey() {
    return publicValue(publicEnv.firebaseAppCheckKey);
  },
  get blobReadWriteToken() {
    return readSecret("BLOB_READ_WRITE_TOKEN");
  },
  get useDemoData() {
    if (runtimeUseDemoData !== null) return runtimeUseDemoData;
    return publicValue(publicEnv.useDemoData) === "true";
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
  if (runtimeUseDemoData === null && publicValue(publicEnv.useDemoData) === "true") {
    runtimeUseDemoData = true;
  }

  if (isFirebaseConfigured() && runtimeUseDemoData !== null) return true;
  if (typeof window === "undefined") return isFirebaseConfigured();

  try {
    const response = await fetch("/api/firebase-config", { cache: "no-store" });
    if (!response.ok) return isFirebaseConfigured();
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
        useDemoData: payload.useDemoData,
      });
    } else if (typeof payload.useDemoData === "boolean") {
      applyRuntimeDemoMode(payload.useDemoData);
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

export function isMemoryCatalog(): boolean {
  return isDemoMode() && !isFirebaseConfigured();
}
