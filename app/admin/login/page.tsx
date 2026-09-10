"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { BrandLogo } from "@/components/BrandLogo";
import { loginAdmin, resetAdminPassword } from "@/lib/services/auth";
import { loginSchema } from "@/lib/validation/vehicle";
import { toUserMessage } from "@/utils/errors";
export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="w-full max-w-md border border-gold/20 bg-dark-secondary p-8">
        <BrandLogo size="lg" className="mx-auto object-center" />
        <h1 className="mt-6 text-center font-display text-2xl">Admin sign in</h1>
        <p className="mt-2 text-center text-sm text-muted">Staff access only</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input name="email" type="email" label="Email" required />
          <Input name="password" type="password" label="Password" required />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {resetSent ? (
            <p className="text-sm text-gold-champagne">Password reset email sent if the account exists.</p>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Login
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 w-full text-xs uppercase tracking-[0.16em] text-muted"
          onClick={async () => {
            const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value;
            if (!email) {
              setError("Enter your email first");
              return;
            }
            await resetAdminPassword(email);
            setResetSent(true);
          }}
        >
          Password reset
        </button>
      </div>
    </div>
  );
}
