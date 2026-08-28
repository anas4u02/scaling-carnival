"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Gender, ProfileStore } from "@/types";

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      displayName: "",
      ageYears: null,
      gender: null,
      setDisplayName: (displayName) => set({ displayName }),
      setAgeYears: (ageYears) =>
        set({
          ageYears:
            ageYears == null
              ? null
              : Math.min(120, Math.max(1, Math.round(ageYears))),
        }),
      setGender: (gender: Gender | null) => set({ gender }),
      hydrateProfile: (profile) => set(profile),
    }),
    { name: "gym-tracker-profile" }
  )
);
