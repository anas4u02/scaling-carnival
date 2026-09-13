"use client";

import { useEffect } from "react";

const SW_URL = "/push-sw.js";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register(SW_URL, { scope: "/" }).catch(() => {
      // Registration can fail on insecure origins; Enable reminders will surface that.
    });
  }, []);
  return null;
}

export async function ensurePushWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const existing = await navigator.serviceWorker.getRegistration("/");
    if (existing?.active && existing.active.scriptURL.includes("push-sw.js")) {
      return existing;
    }
    return await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch {
    return null;
  }
}
