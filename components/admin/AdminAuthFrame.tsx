import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";

export function AdminAuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,162,39,0.12),transparent_42%)]" />
      <div className="relative w-full max-w-md border border-gold/20 bg-dark-secondary/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <BrandLogo size="lg" className="mx-auto object-center" />
        <div className="gold-rule mx-auto mt-6 w-24" />
        <h1 className="mt-6 text-center font-display text-2xl text-white">{title}</h1>
        <p className="mt-2 text-center text-sm leading-6 text-muted">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
