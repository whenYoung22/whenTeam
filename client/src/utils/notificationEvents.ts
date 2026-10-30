const notificationsChangedEvent = "whenteam:notifications-changed";

export function notifyNotificationsChanged(): void {
  window.dispatchEvent(new Event(notificationsChangedEvent));
}

export function subscribeToNotificationChanges(
  listener: () => void,
): () => void {
  window.addEventListener(notificationsChangedEvent, listener);
  return () => window.removeEventListener(notificationsChangedEvent, listener);
}
