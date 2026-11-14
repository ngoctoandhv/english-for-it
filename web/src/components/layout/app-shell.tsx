"use client";

import { BarChart3, BookOpen, Headphones, Home, LogOut, MessagesSquare, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Brand } from "@/components/layout/brand";
import { Preferences } from "@/components/layout/preferences";
import { useAuth } from "@/features/auth/auth-provider";
import { useRequireAuth } from "@/features/auth/use-require-auth";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", key: "nav.today", icon: Home },
  { href: "/library", key: "nav.vocabulary", icon: BookOpen },
  { href: "/listening", key: "nav.listening", icon: Headphones },
  { href: "/scenarios", key: "nav.scenarios", icon: MessagesSquare },
  { href: "/progress", key: "nav.progress", icon: BarChart3 },
];

export function AppShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { ready, user } = useRequireAuth({ admin });
  const { logout } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  if (!ready) return null;

  const items = user?.role === "admin" ? [...NAV, { href: "/admin", key: "nav.admin", icon: Settings2 }] : NAV;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        {t("nav.skip")}
      </a>

      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6 md:h-16">
          <Brand className="shrink-0" />
          <nav aria-label={t("nav.main")} className="ml-4 hidden flex-1 gap-1 md:flex">
            {items.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-[15px] text-muted-foreground hover:text-foreground", isActive(href) && "bg-accent font-medium text-accent-foreground hover:text-accent-foreground")}
              >
                {t(key)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Preferences />
            <button
              type="button"
              onClick={() => logout()}
              aria-label={t("nav.signOut")}
              title={t("nav.signOut")}
              className="grid size-10 place-items-center rounded-lg border text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-[18px]" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <main id="content" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-8 sm:px-6 md:pb-16 md:pt-12">
        {children}
      </main>

      <nav aria-label={t("nav.main")} className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t bg-background md:hidden">
        <ul className="mx-auto flex max-w-md">
          {items.map(({ href, key, icon: Icon }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn("flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] leading-none text-muted-foreground", isActive(href) && "text-primary")}
              >
                <Icon className="size-5" aria-hidden />
                <span className="max-w-full truncate">{t(key)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
