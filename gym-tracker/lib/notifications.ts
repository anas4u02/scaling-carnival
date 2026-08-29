import { createClient } from "@/utils/supabase/client";
import { isIosDevice, isStandalonePwa, urlBase64ToUint8Array } from "@/lib/push/platform";
import type { NotifyPayload } from "@/lib/notifications/payloads";

export type { NotifyPayload } from "@/lib/notifications/payloads";
export {
  morningReminderPayload,
  streakReminderPayload,
  testReminderPayload,
  waterReminderPayload,
} from "@/lib/notifications/payloads";

const ICON = "/icon-192.png";
const READY_TIMEOUT_MS = 8000;

export function notificationsSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (isIosDevice() && !isStandalonePwa()) return false;
  return "Notification" in window && "serviceWorker" in navigator;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!notificationsSupported()) return "unsupported";
  return Notification.requestPermission();
}

async function registrationForNotify(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing?.active) return existing;

    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), READY_TIMEOUT_MS);
      }),
    ]);
    return ready?.active ? ready : existing?.active ? existing : null;
  } catch {
    return null;
  }
}

function notificationOptions(payload: NotifyPayload): NotificationOptions & {
  renotify: boolean;
} {
  return {
    body: payload.body,
    icon: ICON,
    badge: ICON,
    tag: payload.tag,
    renotify: true,
    data: { url: payload.url },
  };
}

export async function showAppNotification(payload: NotifyPayload): Promise<boolean> {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return false;
  }

  const options = notificationOptions(payload);
  const registration = await registrationForNotify();

  if (registration?.showNotification) {
    try {
      await registration.showNotification(payload.title, options);
      return true;
    } catch {
      try {
        registration.active?.postMessage({
          type: "SHOW_NOTIFICATION",
          title: payload.title,
          options,
        });
        return true;
      } catch {
        // Fall through.
      }
    }
  }

  if (isIosDevice()) return false;

  try {
    new Notification(payload.title, options);
    return true;
  } catch {
    return false;
  }
}

export async function subscribeToWebPush(): Promise<boolean> {
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid || notificationPermission() !== "granted") return false;

  const registration = await registrationForNotify();
  if (!registration?.pushManager) return false;

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
    }));

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return false;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { error } = await supabase.from("push_subscriptions").upsert({
    endpoint: json.endpoint,
    user_id: user.id,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    time_zone: timeZone,
  });
  if (error) throw error;

  await supabase.from("profiles").update({ time_zone: timeZone }).eq("id", user.id);
  return true;
}
