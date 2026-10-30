// 非常小而经典的发布/订阅（pub-sub）封装

// 事件名常量
const notificationsChangedEvent = "whenteam:notifications-changed";

// 发布函数
export function notifyNotificationsChanged(): void {
  window.dispatchEvent(new Event(notificationsChangedEvent));
}

// 订阅函数
export function subscribeToNotificationChanges(
  listener: () => void,
): () => void {
  window.addEventListener(notificationsChangedEvent, listener);
  return () => window.removeEventListener(notificationsChangedEvent, listener);
}
