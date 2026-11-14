"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { Brand } from "@/components/layout/brand";
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
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Brand />
          <nav aria-label="Main" className="flex flex-1 gap-1 overflow-x-auto text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={pathname === n.href ? "page" : undefined}
                className={cn("rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", pathname === n.href && "bg-brand-soft font-medium text-primary hover:bg-brand-soft hover:text-primary")}
              >
                {n.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link href="/admin" className={cn("rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", pathname.startsWith("/admin") && "bg-brand-soft font-medium text-primary")}>
                Admin
              </Link>
            )}
          </nav>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
