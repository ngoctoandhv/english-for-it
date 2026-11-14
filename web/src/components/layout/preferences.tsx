"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { useTheme, type ThemeChoice } from "@/lib/theme/provider";
import { cn } from "@/lib/utils";

const ORDER: ThemeChoice[] = ["light", "dark", "system"];
const ICON = { light: Sun, dark: Moon, system: Monitor } as const;

/** Language segmented control and a theme cycle button. Used in the app header and on public pages. */
export function Preferences({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = ICON[theme];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div role="group" aria-label={t("settings.language")} className="flex rounded-lg border p-0.5 font-display text-xs">
        {(["en", "vi"] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={lang === l}
            onClick={() => setLang(l)}
            className={cn("h-8 min-w-9 rounded-md px-2 uppercase text-muted-foreground hover:text-foreground", lang === l && "bg-accent text-accent-foreground")}
          >
            {l}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setTheme(next)}
        aria-label={`${t("settings.theme")}: ${t(`theme.${theme}`)}. ${t(`theme.${next}`)}`}
        title={`${t("settings.theme")}: ${t(`theme.${theme}`)}`}
        className="grid size-10 place-items-center rounded-lg border text-muted-foreground hover:text-foreground"
      >
        <Icon className="size-[18px]" aria-hidden />
      </button>
    </div>
  );
}
