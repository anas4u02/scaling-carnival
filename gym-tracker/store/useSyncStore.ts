"use client";

import { create } from "zustand";
import type { CloudSyncState, CloudSyncStatus } from "@/types";

interface CloudSyncStore extends CloudSyncState {
  setSignedOut: () => void;
  setSyncing: (email: string | null) => void;
  setSynced: (email: string | null) => void;
  setError: (email: string | null, error: string) => void;
}

export const useSyncStore = create<CloudSyncStore>((set) => ({
  status: "signed-out",
  email: null,
  error: null,
  lastSyncedAt: null,
  setSignedOut: () =>
    set({
      status: "signed-out",
      email: null,
      error: null,
      lastSyncedAt: null,
    }),
  setSyncing: (email) =>
    set({ status: "syncing" satisfies CloudSyncStatus, email, error: null }),
  setSynced: (email) =>
    set({
      status: "synced",
      email,
      error: null,
      lastSyncedAt: new Date().toISOString(),
    }),
  setError: (email, error) => set({ status: "error", email, error }),
}));
