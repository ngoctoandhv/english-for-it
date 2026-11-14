"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { useRequireAuth } from "@/features/auth/use-require-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/library", label: "Library" },
  { href: "/listening", label: "Listening" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/progress", label: "Progress" },
];

export function AppShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { ready, user } = useRequireAuth({ admin });
  const { logout } = useAuth();
  const pathname = usePathname();
  if (!ready) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/" className="font-semibold tracking-tight">
            English for IT
          </Link>
          <nav aria-label="Main" className="flex flex-1 gap-1 overflow-x-auto text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={pathname === n.href ? "page" : undefined}
                className={cn("rounded-md px-2.5 py-1.5 hover:bg-muted", pathname === n.href && "bg-muted font-medium")}
              >
                {n.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link href="/admin" className={cn("rounded-md px-2.5 py-1.5 hover:bg-muted", pathname.startsWith("/admin") && "bg-muted font-medium")}>
                Admin
              </Link>
            )}
          </nav>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
