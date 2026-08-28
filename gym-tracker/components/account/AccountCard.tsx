"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud, CloudOff, LogIn, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { flushNow, stopWriteThrough } from "@/lib/sync/cloudSync";
import { useProfileStore, useSyncStore } from "@/store";
import type { Gender } from "@/types";

const GENDER_OPTIONS: { value: Gender | ""; label: string }[] = [
  { value: "", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export function AccountCard() {
  const pathname = usePathname();
  const status = useSyncStore((s) => s.status);
  const email = useSyncStore((s) => s.email);
  const error = useSyncStore((s) => s.error);
  const displayName = useProfileStore((s) => s.displayName);
  const ageYears = useProfileStore((s) => s.ageYears);
  const gender = useProfileStore((s) => s.gender);
  const setDisplayName = useProfileStore((s) => s.setDisplayName);
  const setAgeYears = useProfileStore((s) => s.setAgeYears);
  const setGender = useProfileStore((s) => s.setGender);

  const signedIn = status !== "signed-out";
  const loginHref = `/login?next=${encodeURIComponent(pathname || "/today")}`;

  const handleSignOut = async () => {
    await flushNow();
    stopWriteThrough();
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center gap-2 mb-1">
        {signedIn ? (
          <Cloud size={14} className="text-sky-400" />
        ) : (
          <CloudOff size={14} className="text-gray-500" />
        )}
        <h2
          id="account-dialog-title"
          className="text-xs font-semibold uppercase tracking-wider text-gray-400"
        >
          Account
        </h2>
      </div>

      {status === "signed-out" && (
        <>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            Sign in to save logs to the cloud. The app still works offline
            without an account.
          </p>
          <Link
            href={loginHref}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2.5 transition-colors"
          >
            <LogIn size={15} />
            Sign in
          </Link>
        </>
      )}

      {status === "syncing" && (
        <p className="text-sm text-gray-300 mt-2">
          Syncing{email ? ` ${email}` : ""}…
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-amber-300/90 mt-2 leading-relaxed">
          {error ?? "Could not sync."} You can keep using the app on this
          device.
        </p>
      )}

      {signedIn && (
        <>
          <p className="text-sm text-gray-300 mt-2">
            Signed in as{" "}
            <span className="text-white">{email ?? "your account"}</span>
            {status === "synced" ? ". Changes save when you are online." : ""}
          </p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-gray-500">
                Name
              </span>
              <input
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-gray-500">
                Age
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={120}
                value={ageYears ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setAgeYears(null);
                    return;
                  }
                  const n = Number(raw);
                  if (Number.isFinite(n)) setAgeYears(n);
                }}
                placeholder="23"
                className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-gray-500">
                Gender
              </span>
              <select
                value={gender ?? ""}
                onChange={(e) =>
                  setGender((e.target.value || null) as Gender | null)
                }
                className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium py-2.5 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </>
      )}
    </section>
  );
}
