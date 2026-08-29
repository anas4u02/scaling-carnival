"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BellOff } from "lucide-react";
import {
  notificationPermission,
  requestNotificationPermission,
  showAppNotification,
  subscribeToWebPush,
  testReminderPayload,
} from "@/lib/notifications";
import { isIosDevice, isStandalonePwa } from "@/lib/push/platform";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSyncStore } from "@/store/useSyncStore";

function Toggle({
  checked,
  onChange,
  disabled,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
  label: string;
  hint: string;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 py-2.5 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <span>
        <span className="block text-sm text-white">{label}</span>
        <span className="block text-[11px] text-gray-500 mt-0.5 leading-snug">
          {hint}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-sky-500" : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationSettings() {
  const pathname = usePathname();
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [iosStandalone, setIosStandalone] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);
  const [pushReady, setPushReady] = useState(false);
  const [testState, setTestState] = useState<"idle" | "sent" | "error">("idle");
  const signedIn = useSyncStore((s) => s.status !== "signed-out");
  const waterReminders = useSettingsStore((s) => s.waterReminders);
  const morningReminder = useSettingsStore((s) => s.morningReminder);
  const streakReminder = useSettingsStore((s) => s.streakReminder);
  const setWaterReminders = useSettingsStore((s) => s.setWaterReminders);
  const setMorningReminder = useSettingsStore((s) => s.setMorningReminder);
  const setStreakReminder = useSettingsStore((s) => s.setStreakReminder);

  useEffect(() => {
    setIosDevice(isIosDevice());
    setIosStandalone(isStandalonePwa());
    setPermission(notificationPermission());
  }, []);

  useEffect(() => {
    if (permission !== "granted" || !signedIn) return;
    void subscribeToWebPush()
      .then((ok) => setPushReady(ok))
      .catch(() => setPushReady(false));
  }, [permission, signedIn]);

  const granted = permission === "granted";
  const unsupported = permission === "unsupported";
  const loginHref = `/login?next=${encodeURIComponent(pathname || "/progress")}`;

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result !== "granted") return;
    window.dispatchEvent(new Event("gymtracker:reschedule"));
    await showAppNotification(testReminderPayload());
    if (signedIn) {
      try {
        setPushReady(await subscribeToWebPush());
      } catch {
        setPushReady(false);
      }
    }
  };

  const handleTest = async () => {
    const ok = await showAppNotification(testReminderPayload());
    setTestState(ok ? "sent" : "error");
  };

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center gap-2 mb-1">
        {granted ? (
          <Bell size={14} className="text-sky-400" />
        ) : (
          <BellOff size={14} className="text-gray-500" />
        )}
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Reminders
        </h2>
      </div>

      {iosDevice && !iosStandalone && (
        <p className="text-xs text-amber-300/90 mt-2 leading-relaxed">
          iPhone reminders only work from the Home Screen app. Open this icon
          from your home screen (not a Safari tab), then enable reminders
          there.
        </p>
      )}

      {unsupported && !iosDevice && (
        <p className="text-xs text-gray-500 mt-2">
          This browser does not support notifications.
        </p>
      )}

      {permission === "denied" && (
        <p className="text-xs text-amber-400/90 mt-2 leading-relaxed">
          Notifications are blocked. On iPhone: Settings → Notifications →
          GymTracker, then reopen the Home Screen app.
        </p>
      )}

      {granted && iosStandalone && !signedIn && (
        <p className="text-xs text-amber-300/90 mt-2 leading-relaxed">
          iPhone suspends the app when you leave it.{" "}
          <Link href={loginHref} className="text-sky-400 underline">
            Sign in
          </Link>{" "}
          so water and morning pings can arrive after you close GymTracker.
        </p>
      )}

      {granted && signedIn && pushReady && (
        <p className="text-xs text-emerald-400/80 mt-2 leading-relaxed">
          This iPhone will get reminders even after you leave the app.
        </p>
      )}

      {permission === "default" && (!iosDevice || iosStandalone) && (
        <button
          type="button"
          onClick={() => void handleEnable()}
          className="mt-3 w-full rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2.5 transition-colors"
        >
          Enable reminders
        </button>
      )}

      <div className="mt-2 divide-y divide-gray-800/80">
        <Toggle
          checked={waterReminders}
          onChange={setWaterReminders}
          disabled={!granted}
          label="Water every 2 hours"
          hint="9 AM – 11 PM, stops once you hit 3.0 L"
        />
        <Toggle
          checked={morningReminder}
          onChange={setMorningReminder}
          disabled={!granted}
          label="Morning essentials"
          hint="Daily routine ping at 9:00 AM"
        />
        <Toggle
          checked={streakReminder}
          onChange={setStreakReminder}
          disabled={!granted}
          label="Streak at risk"
          hint="If yesterday had no logged exercises"
        />
      </div>

      {granted && (
        <button
          type="button"
          onClick={() => void handleTest()}
          className="mt-3 w-full rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium py-2.5 transition-colors"
        >
          {testState === "sent"
            ? "Test sent — check your notifications"
            : testState === "error"
              ? "Could not send test"
              : "Send test notification"}
        </button>
      )}

      <p className="text-[10px] text-gray-600 mt-2 leading-snug">
        On iPhone, closed-app reminders need the Home Screen app, notification
        permission, and a signed-in account. Android and desktop can also ping
        while GymTracker stays in the app switcher.
      </p>
    </section>
  );
}
