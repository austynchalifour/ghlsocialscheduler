"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  PenSquare,
  Settings,
  Share2,
} from "lucide-react";
import { CredentialsBanner } from "./CredentialsBanner";
import { apiFetch } from "@/lib/api";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compose", label: "Compose", icon: PenSquare },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/accounts", label: "Accounts", icon: Share2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface UserInfo {
  email: string;
  name: string | null;
  locationId: string | null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    apiFetch<{ user: UserInfo & { ghlConnected: boolean } }>("/api/auth/me")
      .then((data) =>
        setUser({
          email: data.user.email,
          name: data.user.name,
          locationId: data.user.locationId,
        })
      )
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">GHL Scheduler</p>
            <p className="text-xs text-muted">Social Planner SaaS</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          {user && (
            <div className="mb-3">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.name || user.email}
              </p>
              {user.locationId && (
                <p className="truncate font-mono text-[10px] text-muted">
                  {user.locationId}
                </p>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <CredentialsBanner />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
