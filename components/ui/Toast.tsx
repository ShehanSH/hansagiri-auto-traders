"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

type ToastTone = "success" | "error";
type Toast = { id: number; message: string; tone: ToastTone };

const ToastContext = createContext<{
  push: (message: string, tone?: ToastTone) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex justify-center px-4">
        <div className="flex w-full max-w-[280px] flex-col items-center gap-2">
          {toasts.map((toast) => {
            const isError = toast.tone === "error";
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto flex w-full items-center gap-2 px-3 py-2 text-center shadow-md ${
                  isError
                    ? "border border-[#e8a0a0] bg-[#f6d6d6] text-[#7a2e2e]"
                    : "border border-[#9fd4b8] bg-[#d8f3e4] text-[#1f6b4a]"
                }`}
                role={isError ? "alert" : "status"}
              >
                {isError ? (
                  <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <p className="min-w-0 flex-1 text-[11px] leading-snug">{toast.message}</p>
                <button
                  type="button"
                  className="shrink-0 p-0.5 opacity-60 hover:opacity-100"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(toast.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
