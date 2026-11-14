"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api/errors";
import type { Meta } from "@/lib/api/types";
import { getCategories, getCollections, getWords, type Category, type Collection, type WordSummary } from "@/lib/api/vocabulary";
import { useI18n } from "@/lib/i18n/provider";
import { FavoriteButton } from "./favorite-button";
import { PlayButton } from "./play-button";

const selectClass = "h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-auto";

export function LibraryPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filters, setFilters] = useState({ q: "", category: "", collection: "" });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [words, setWords] = useState<WordSummary[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCategories(), getCollections()]).then(([c, col]) => (setCategories(c), setCollections(col))).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getWords({ ...filters, page })
      .then((r) => !cancelled && (setWords(r.data), setMeta(r.meta), setError(null)))
      .catch((e) => !cancelled && setError(errorMessage(e, t)));
    return () => {
      cancelled = true;
    };
  }, [filters, page, t]);

  function update(patch: Partial<typeof filters>) {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl sm:text-4xl">{t("lib.title")}</h1>
      <form
        className="mb-8 grid gap-2 sm:flex sm:flex-wrap sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: query });
        }}
        role="search"
      >
        <Input className="sm:max-w-56" placeholder={t("lib.search")} aria-label={t("lib.searchLabel")} value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className={selectClass} aria-label={t("lib.topic")} value={filters.category} onChange={(e) => update({ category: e.target.value, collection: "" })}>
          <option value="">{t("lib.allTopics")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name} ({c.words_count})
            </option>
          ))}
        </select>
        <select className={selectClass} aria-label={t("lib.collection")} value={filters.collection} onChange={(e) => update({ collection: e.target.value, category: "" })}>
          <option value="">{t("lib.allCollections")}</option>
          {collections.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
          {t("lib.searchBtn")}
        </Button>
      </form>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {!error && words.length === 0 && <p className="text-muted-foreground">{t("lib.none")}</p>}
      <ul className="grid grid-cols-1 border-t lg:grid-cols-2 lg:gap-x-12 [&>li]:min-w-0 [&>li]:border-b">
        {words.map((w) => (
          <li key={w.id} className="flex items-center gap-1 py-2 sm:gap-2">
            <PlayButton term={w.term} audioUrl={w.audio_url} />
            <Link href={`/library/${w.id}`} className="min-w-0 flex-1 rounded-md py-1 hover:bg-muted/50">
              <span className="font-display text-base">{w.term}</span>{" "}
              <span className="font-display text-xs text-muted-foreground">{w.ipa} · {w.part_of_speech}</span>
              <span className="block truncate text-sm text-muted-foreground">{w.meaning_vi}</span>
            </Link>
            <FavoriteButton wordId={w.id} initial={w.favorited} />
          </li>
        ))}
      </ul>
      {meta && meta.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            {t("common.prev")}
          </Button>
          <span className="tnum font-display text-xs">{t("common.pageOf", { page: meta.page, total: meta.total_pages })}</span>
          <Button variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>
            {t("common.next")}
          </Button>
        </div>
      )}
    </AppShell>
  );
}
