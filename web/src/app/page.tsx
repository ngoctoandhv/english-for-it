import { HealthBadge } from "@/features/health/health-badge";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-semibold tracking-tight">English for IT</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Learn the English you need at work, 5–10 minutes a day.
      </p>
      <HealthBadge />
    </main>
  );
}
