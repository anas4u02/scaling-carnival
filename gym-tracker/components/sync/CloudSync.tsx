"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  flushNow,
  startWriteThrough,
  stopWriteThrough,
  syncOnSignIn,
  whenStoresHydrated,
} from "@/lib/sync/cloudSync";
import { useSyncStore } from "@/store/useSyncStore";

export function CloudSync() {
  const setSignedOut = useSyncStore((s) => s.setSignedOut);
  const setSyncing = useSyncStore((s) => s.setSyncing);
  const setSynced = useSyncStore((s) => s.setSynced);
  const setError = useSyncStore((s) => s.setError);

  useEffect(() => {
    const supabase = createClient();
    let generation = 0;
    let cancelled = false;

    const run = async (userId: string | null, email: string | null) => {
      const my = ++generation;
      stopWriteThrough();
      await whenStoresHydrated();
      if (cancelled || my !== generation) return;

      if (!userId) {
        setSignedOut();
        return;
      }

      setSyncing(email);
      try {
        await syncOnSignIn(userId, supabase);
        if (cancelled || my !== generation) return;
        startWriteThrough(userId, supabase);
        setSynced(email);
      } catch (err) {
        if (cancelled || my !== generation) return;
        const message =
          err instanceof Error ? err.message : "Cloud sync failed";
        setError(email, message);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      void run(session?.user.id ?? null, session?.user.email ?? null);
    });

    const vis = () => {
      if (document.visibilityState === "hidden") {
        void flushNow();
      }
    };
    const onHide = () => {
      void flushNow();
    };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("pagehide", onHide);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("pagehide", onHide);
      void flushNow().finally(() => stopWriteThrough());
    };
  }, [setError, setSignedOut, setSynced, setSyncing]);

  return null;
}
