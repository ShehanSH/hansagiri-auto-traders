"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Car,
  Handshake,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { hasRole } from "@/lib/auth/permissions";
const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "vehicles:read" },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car, permission: "vehicles:read" },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, permission: "inquiries" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "customers" },
  { href: "/admin/test-drives", label: "Test Drives", icon: Car, permission: "test_drives" },
  { href: "/admin/trade-ins", label: "Trade-Ins", icon: Handshake, permission: "trade_ins" },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, permission: "messages" },
  { href: "/admin/media", label: "Media", icon: ImageIcon, permission: "media" },
  { href: "/admin/activity", label: "Activity", icon: Activity, permission: "activity" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, loading, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [admin, loading, pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark text-muted">
        Checking access…
      </div>
    );
  }

  const links = NAV.filter(
    (item) => hasRole(admin.role, item.permission) || hasRole(admin.role, "*"),
  );

  const sidebar = (
    <div className="flex h-full flex-col bg-dark-secondary">
      <div className="border-b border-gold/15 px-5 py-5">
        <BrandLogo size="sm" />
        <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-gold">Staff dashboard</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm ${
                active ? "bg-gold/15 text-gold" : "text-white/75 hover:bg-white/5"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="m-3 flex items-center gap-3 px-3 py-2.5 text-sm text-muted hover:text-white"
        onClick={async () => {
          await logout();
          router.replace("/admin/login");
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64">{sidebar}</div>
        </div>
      ) : null}
      <div>
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:px-8">
          <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            {open ? <X /> : <Menu />}
          </button>
          <p className="text-sm text-muted">
            {admin.displayName || admin.email} · {admin.role.replace("_", " ")}
          </p>
        </header>
        <div className="px-4 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
