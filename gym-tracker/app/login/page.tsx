"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";

function safeNextPath(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/today";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const supabase = createClient();
    const trimmed = email.trim();

    try {
      if (mode === "signup") {
        const origin = window.location.origin;
        const { data, error: signError } = await supabase.auth.signUp({
          email: trimmed,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          },
        });
        if (signError) throw signError;
        if (!data.session) {
          setInfo(
            "Check your email to confirm the account, then sign in. If no mail arrives, turn off Confirm email in the Supabase Auth settings for this personal app."
          );
          setMode("signin");
          return;
        }
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const { error: signError } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      });
      if (signError) throw signError;
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title={mode === "signin" ? "Sign in" : "Create account"}
        subtitle="Optional — the tracker works without an account"
        showSearch={false}
        showAccount={false}
      />

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-3"
      >
        <label className="block">
          <span className="text-xs text-gray-400">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500"
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-400">Password</span>
          <input
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500"
          />
        </label>

        {error && (
          <p className="text-xs text-amber-300/90 leading-relaxed">{error}</p>
        )}
        {info && (
          <p className="text-xs text-sky-300/90 leading-relaxed">{info}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors"
        >
          {busy
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className="w-full text-xs text-gray-400 hover:text-gray-200 py-1"
        >
          {mode === "signin"
            ? "Need an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </form>

      <p className="text-center mt-4">
        <Link href={nextPath} className="text-xs text-gray-500 hover:text-gray-300">
          Continue without signing in
        </Link>
      </p>
    </PageWrapper>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageWrapper>
          <PageHeader title="Sign in" showSearch={false} showAccount={false} />
        </PageWrapper>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
