import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { GlossaryList } from "@/features/home/glossary-list";
import { fetchGlossary } from "@/lib/api/public";

export const metadata: Metadata = {
  title: "IT English glossary",
  description: "Words used in standups, code reviews and incident updates, with Vietnamese meanings, simple definitions and examples.",
};

async function Words() {
  await connection(); // fetched per request, not at build time
  return <GlossaryList words={await fetchGlossary()} />;
}

export default function Page() {
  return (
    <Suspense>
      <Words />
    </Suspense>
  );
}
