import { apiFetch } from "./client";

export type PublicWord = {
  id: number;
  term: string;
  ipa: string | null;
  part_of_speech: string;
  meaning_vi: string;
  definition_en: string;
  example: { en: string; vi: string } | null;
};

export const getSample = () => apiFetch<{ data: PublicWord[] }>("/public/sample", { auth: false }).then((r) => r.data);

/** Server-side fetch for the glossary page. Uses the internal API address inside Docker. Returns [] when the API is unreachable. */
export async function fetchGlossary(): Promise<PublicWord[]> {
  const base = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";
  try {
    const res = await fetch(`${base}/api/v1/public/words`, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    return ((await res.json()) as { data: PublicWord[] }).data;
  } catch {
    return [];
  }
}
