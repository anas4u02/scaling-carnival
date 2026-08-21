"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  notificationPermission,
  requestNotificationPermission,
} from "@/lib/notifications";
import { useSettingsStore } from "@/store/useSettingsStore";

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
  const [permission, setPermission] = useState(notificationPermission);
  const waterReminders = useSettingsStore((s) => s.waterReminders);
  const morningReminder = useSettingsStore((s) => s.morningReminder);
  const streakReminder = useSettingsStore((s) => s.streakReminder);
  const setWaterReminders = useSettingsStore((s) => s.setWaterReminders);
  const setMorningReminder = useSettingsStore((s) => s.setMorningReminder);
  const setStreakReminder = useSettingsStore((s) => s.setStreakReminder);

  const granted = permission === "granted";
  const unsupported = permission === "unsupported";

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") {
      window.dispatchEvent(new Event("gymtracker:reschedule"));
    }
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

      {unsupported && (
        <p className="text-xs text-gray-500 mt-2">
          This browser does not support notifications. Add to Home Screen on
          your phone for the best chance they fire.
        </p>
      )}

      {permission === "denied" && (
        <p className="text-xs text-amber-400/90 mt-2 leading-relaxed">
          Notifications are blocked. Enable them in the browser site settings,
          then reload.
        </p>
      )}

      {permission === "default" && (
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

      <p className="text-[10px] text-gray-600 mt-2 leading-snug">
        Reminders fire while the app is open or recently used. Install as a PWA
        and keep it in the app switcher for the 2-hour water pings.
      </p>
    </section>
  );
}
