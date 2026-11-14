"use client";

import { useEffect } from "react";

/** Registers the service worker (push reminders). Does nothing where service workers are unavailable. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}
