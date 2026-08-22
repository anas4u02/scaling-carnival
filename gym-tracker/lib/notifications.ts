import { formatMlAsLiters } from "@/lib/waterUtils";

const ICON = "/icon-192.png";

interface NotifyPayload {
  title: string;
  body: string;
  tag: string;
  url: string;
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  return Notification.requestPermission();
}

export async function showAppNotification(payload: NotifyPayload): Promise<void> {
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  // `renotify` is in the Notifications spec for service workers, but not on DOM's NotificationOptions.
  const options: NotificationOptions & { renotify: boolean } = {
    body: payload.body,
    icon: ICON,
    badge: ICON,
    tag: payload.tag,
    renotify: true,
    data: { url: payload.url },
  };

  try {
    const ready = await navigator.serviceWorker?.ready.catch(() => undefined);
    if (ready?.showNotification) {
      await ready.showNotification(payload.title, options);
      return;
    }
  } catch {
    // Fall through to page Notification — used in `next dev` where the SW is disabled.
  }

  new Notification(payload.title, options);
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
