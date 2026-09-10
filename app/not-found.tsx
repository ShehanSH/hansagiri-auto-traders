import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">404</p>
      <h1 className="mt-4 font-display text-4xl">Page not found</h1>
      <p className="mt-4 text-muted">
        This page is missing, or the vehicle is no longer listed.
      </p>
      <Link href="/vehicles" className="mt-8 inline-block bg-gold px-6 py-3 text-xs uppercase tracking-[0.16em] text-dark">
        Browse vehicles
      </Link>
    </div>
  );
}
