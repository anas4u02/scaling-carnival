self.addEventListener("push", (event) => {
  const fallback = {
    title: "GymTracker",
    body: "",
    tag: "gymtracker",
    url: "/today",
  };

  let payload = fallback;
  try {
    const data = event.data ? event.data.json() : {};
    payload = {
      title: data.notification?.title || data.title || fallback.title,
      body: data.notification?.body || data.body || fallback.body,
      tag: data.tag || fallback.tag,
      url: data.notification?.navigate || data.url || fallback.url,
    };
  } catch {
    if (event.data) {
      payload = { ...fallback, body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      renotify: true,
      data: { url: payload.url },
    })
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "SHOW_NOTIFICATION") return;
  event.waitUntil(
    self.registration.showNotification(data.title, data.options || {})
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/today";
  const url = new URL(target, self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && new URL(client.url).origin === new URL(url).origin) {
          if ("focus" in client) {
            const focused = client.focus();
            if ("navigate" in client) {
              return focused.then(() => client.navigate(url));
            }
            return focused;
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
      return undefined;
    })
  );
});
