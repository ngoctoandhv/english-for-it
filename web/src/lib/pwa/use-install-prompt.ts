"use client";

import { useCallback, useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void> };

/** Captures the browser's "install app" prompt so Settings can offer an Install button. */
export function useInstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!event) return;
    await event.prompt();
    setEvent(null);
  }, [event]);

  return { canInstall: event !== null, install };
}
