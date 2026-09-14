"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminAuthFrame } from "@/components/admin/AdminAuthFrame";
import { PasswordInput } from "@/components/admin/PasswordInput";
import { Button } from "@/components/ui/Button";
import { completeAdminPasswordReset, readPasswordResetEmail } from "@/lib/services/auth";
import { passwordResetConfirmSchema } from "@/lib/validation/auth";
import { toUserMessage } from "@/utils/errors";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const [email, setEmail] = useState("");
  const [linkError, setLinkError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(Boolean(oobCode));

  useEffect(() => {
    if (!oobCode) {
      setLinkError("Request a new reset email from the admin sign-in page.");
      setChecking(false);
      return;
    }
    let cancelled = false;
    readPasswordResetEmail(oobCode)
      .then((value) => {
        if (!cancelled) setEmail(value);
      })
      .catch((err) => {
        if (!cancelled) setLinkError(toUserMessage(err));
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = passwordResetConfirmSchema.safeParse(data);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check your new password");
      return;
    }
    setLoading(true);
    try {
      await completeAdminPasswordReset(oobCode, parsed.data.password);
      router.replace("/admin/login?reset=success");
    } catch (err) {
      setFormError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <AdminAuthFrame title="Reset password" description="Checking your reset link…">
        <p className="text-center text-sm text-muted">Please wait.</p>
      </AdminAuthFrame>
    );
  }

  if (!oobCode || linkError) {
    return (
      <AdminAuthFrame
        title="Reset link invalid"
        description="This password reset link is missing, expired, or has already been used."
      >
        <div className="border border-danger/30 bg-danger/10 px-4 py-4 text-center">
          <ShieldAlert className="mx-auto h-7 w-7 text-danger" />
          <p className="mt-3 text-sm text-white">
            {linkError || "Request a new reset email from the admin sign-in page."}
          </p>
        </div>
        <Link
          href="/admin/login"
          className="mt-6 flex w-full items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </AdminAuthFrame>
    );
  }

  return (
    <AdminAuthFrame
      title="Choose a new password"
      description={email ? `Set a new password for ${email}.` : "Set a new password for your admin account."}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <PasswordInput
          name="password"
          label="New password"
          autoComplete="new-password"
          hint="At least 8 characters"
          required
        />
        <PasswordInput
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          required
        />
        {formError ? <p className="text-sm text-danger">{formError}</p> : null}
        <Button type="submit" className="w-full" loading={loading}>
          Update password
        </Button>
      </form>
      <Link
        href="/admin/login"
        className="mt-6 flex w-full items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Cancel and sign in
      </Link>
    </AdminAuthFrame>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-dark text-muted">Loading…</div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
