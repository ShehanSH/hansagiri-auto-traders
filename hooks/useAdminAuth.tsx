"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { logoutAdmin, subscribeAuth } from "@/lib/services/auth";
import type { AdminUser } from "@/types";

type AuthState = {
  admin: AdminUser | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    let cancelled = false;

    void (async () => {
      const { ensureFirebaseConfigured } = await import("@/lib/env");
      await ensureFirebaseConfigured();
      if (cancelled) return;
      try {
        unsubscribe = subscribeAuth((_user, record) => {
          setAdmin(record);
          setLoading(false);
        });
      } catch (error) {
        console.error("Admin auth failed to start", error);
        setAdmin(null);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      admin,
      loading,
      logout: async () => {
        await logoutAdmin();
        setAdmin(null);
      },
    }),
    [admin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
