"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { useRequireAuth } from "@/features/auth/use-require-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/library", label: "Vocabulary" },
  { href: "/listening", label: "Listening" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/progress", label: "Progress" },
];

export function AppShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { ready, user } = useRequireAuth({ admin });
  const { logout } = useAuth();
  const pathname = usePathname();
  if (!ready) return null;

  const link = (href: string, label: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "whitespace-nowrap rounded-lg px-3 py-2 text-[15px] text-muted-foreground hover:text-foreground",
        active && "bg-accent font-medium text-accent-foreground hover:text-accent-foreground",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-20 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 px-4 sm:h-16 sm:flex-nowrap sm:px-6">
          <Brand className="flex h-14 shrink-0 items-center sm:h-auto" />
          <nav aria-label="Main" className="order-last -mx-1 flex w-full gap-1 overflow-x-auto pb-2 sm:order-none sm:w-auto sm:flex-1 sm:pb-0">
            {NAV.map((n) => link(n.href, n.label, n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)))}
            {user?.role === "admin" && link("/admin", "Admin", pathname.startsWith("/admin"))}
          </nav>
          <Button variant="ghost" size="sm" className="ml-auto sm:ml-0" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </header>
      <main id="content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        {children}
      </main>
    </div>
  );
}
