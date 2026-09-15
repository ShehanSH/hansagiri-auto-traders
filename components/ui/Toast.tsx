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
      <div className="pointer-events-none fixed inset-x-0 top-6 z-[80] flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-3">
          {toasts.map((toast) => {
            const isError = toast.tone === "error";
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto relative w-full px-5 py-4 text-center shadow-lg ${
                  isError
                    ? "border border-[#e8a0a0] bg-[#f6d6d6] text-[#7a2e2e]"
                    : "border border-[#9fd4b8] bg-[#d8f3e4] text-[#1f6b4a]"
                }`}
                role={isError ? "alert" : "status"}
              >
                <button
                  type="button"
                  className="absolute right-2 top-2 p-1 opacity-70 hover:opacity-100"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(toast.id)}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mx-auto mb-2 flex justify-center">
                  {isError ? (
                    <CircleAlert className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  )}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  {isError ? "Something went wrong" : "Success"}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{toast.message}</p>
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
