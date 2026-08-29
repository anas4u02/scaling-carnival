import { formatMlAsLiters } from "@/lib/waterUtils";

export interface NotifyPayload {
  title: string;
  body: string;
  tag: string;
  url: string;
}

export function testReminderPayload(): NotifyPayload {
  return {
    title: "GymTracker reminders are on",
    body: "You should see this ping. Closed-app reminders on iPhone need this Home Screen app plus an account.",
    tag: "gymtracker-test",
    url: "/progress",
  };
}

export function waterReminderPayload(intakeMl: number, goalMl: number): NotifyPayload {
  const left = Math.max(0, goalMl - intakeMl);
  return {
    title: "Time for a glass of water 💧",
    body:
      left > 0
        ? `+250 ml · ${formatMlAsLiters(left)} left today. Discs stay happier when you're hydrated.`
        : "Daily water goal already met. Nice work.",
    tag: "gymtracker-water",
    url: "/water",
  };
}

export function morningReminderPayload(): NotifyPayload {
  return {
    title: "Time for your daily essentials ☀️",
    body: "Chin tucks, decompression, and the morning list — then a glass of water.",
    tag: "gymtracker-morning",
    url: "/today",
  };
}

export function streakReminderPayload(): NotifyPayload {
  return {
    title: "Streak at risk 🔥",
    body: "No exercises logged yesterday. Open Today and knock out the essentials.",
    tag: "gymtracker-streak",
    url: "/today",
  };
}
