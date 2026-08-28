"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { AccountCard } from "@/components/account/AccountCard";
import { useSyncStore } from "@/store/useSyncStore";

export function AccountHeaderButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const signedIn = useSyncStore((s) => s.status !== "signed-out");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Account"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
          signedIn
            ? "border-blue-500/40 bg-blue-600/20 text-blue-300"
            : "border-gray-700 bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
      >
        <User size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close account"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-dialog-title"
            className="absolute left-1/2 top-14 w-[min(100%-2rem,28rem)] -translate-x-1/2 max-h-[min(80vh,40rem)] overflow-y-auto"
          >
            <AccountCard />
          </div>
        </div>
      )}
    </>
  );
}
