"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AdminAuthFrame } from "@/components/admin/AdminAuthFrame";
import { PasswordInput } from "@/components/admin/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { loginAdmin, resetAdminPassword } from "@/lib/services/auth";
import { loginSchema, passwordResetRequestSchema } from "@/lib/validation/auth";
import { toUserMessage } from "@/utils/errors";

type View = "login" | "forgot" | "sent";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const resetComplete = searchParams.get("reset") === "success";
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const sentHint = useMemo(() => email || "your staff email", [email]);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setLoading(true);
    try {
      await loginAdmin(parsed.data.email, parsed.data.password);
      window.location.assign("/admin");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = passwordResetRequestSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await resetAdminPassword(parsed.data.email);
      setEmail(parsed.data.email);
      setView("sent");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (view === "forgot") {
    return (
      <AdminAuthFrame
        title="Reset password"
        description="Enter the admin email. We will send a reset link if that account exists."
      >
        <form onSubmit={onResetRequest} className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Admin email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
        <button
          type="button"
          className="mt-6 flex w-full items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
          onClick={() => {
            setError("");
            setView("login");
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </button>
      </AdminAuthFrame>
    );
  }

  if (view === "sent") {
    return (
      <AdminAuthFrame
        title="Check your inbox"
        description="If an admin account exists for that email, a reset link is on its way."
      >
        <div className="border border-gold/20 bg-gold/5 px-4 py-5 text-center">
          <Mail className="mx-auto h-8 w-8 text-gold" />
          <p className="mt-3 text-sm text-white">{sentHint}</p>
          <p className="mt-2 text-xs leading-5 text-muted">
            The email comes from Firebase. Check spam or promotions if it is not in your inbox within a
            minute.
          </p>
        </div>
        <Button
          type="button"
          className="mt-6 w-full"
          variant="secondary"
          onClick={() => {
            setError("");
            setView("login");
          }}
        >
          Return to sign in
        </Button>
        <button
          type="button"
          className="mt-4 w-full text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
          onClick={() => {
            setError("");
            setView("forgot");
          }}
        >
          Use a different email
        </button>
      </AdminAuthFrame>
    );
  }

  return (
    <AdminAuthFrame title="Admin sign in" description="Staff access only. Use your authorised admin email.">
      {resetComplete ? (
        <div className="mb-5 flex items-start gap-3 border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Password updated. Sign in with your new password.
        </div>
      ) : null}
      <form onSubmit={onLogin} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <PasswordInput name="password" label="Password" autoComplete="current-password" required />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
      <button
        type="button"
        className="mt-6 w-full text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
        onClick={() => {
          setError("");
          setView("forgot");
        }}
      >
        Forgot password?
      </button>
    </AdminAuthFrame>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-dark text-muted">Loading…</div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
