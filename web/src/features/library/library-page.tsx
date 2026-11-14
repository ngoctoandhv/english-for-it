"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api/errors";
import type { Meta } from "@/lib/api/types";
import { getCategories, getCollections, getWords, type Category, type Collection, type WordSummary } from "@/lib/api/vocabulary";
import { FavoriteButton } from "./favorite-button";
import { PlayButton } from "./play-button";

const selectClass = "h-8 rounded-lg border border-input bg-transparent px-2 text-sm focus-visible:ring-3 focus-visible:ring-ring/50 outline-none";

export function LibraryPage() {
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
      .catch((e) => !cancelled && setError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  function update(patch: Partial<typeof filters>) {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Vocabulary</h1>
      <form
        className="mb-6 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: query });
        }}
        role="search"
      >
        <Input className="max-w-56" placeholder="Search words…" aria-label="Search words" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className={selectClass} aria-label="Category" value={filters.category} onChange={(e) => update({ category: e.target.value, collection: "" })}>
          <option value="">All topics</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name} ({c.words_count})
            </option>
          ))}
        </select>
        <select className={selectClass} aria-label="Collection" value={filters.collection} onChange={(e) => update({ collection: e.target.value, category: "" })}>
          <option value="">All collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {!error && words.length === 0 && <p className="text-muted-foreground">No words found.</p>}
      <ul className="divide-y rounded-lg border">
        {words.map((w) => (
          <li key={w.id} className="flex items-center gap-2 px-3 py-2.5">
            <PlayButton term={w.term} audioUrl={w.audio_url} />
            <Link href={`/library/${w.id}`} className="min-w-0 flex-1 rounded-md hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 outline-none">
              <span className="font-medium">{w.term}</span>{" "}
              <span className="text-sm text-muted-foreground">{w.ipa} · {w.part_of_speech}</span>
              <span className="block truncate text-sm text-muted-foreground">{w.meaning_vi}</span>
            </Link>
            <FavoriteButton wordId={w.id} initial={w.favorited} />
          </li>
        ))}
      </ul>
      {meta && meta.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span>
            Page {meta.page} of {meta.total_pages}
          </span>
          <Button variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </AppShell>
  );
}
