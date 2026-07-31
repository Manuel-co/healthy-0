import type { Notification, NotificationType } from "@/lib/types";

const NOTIFICATIONS_KEY = "hz_notifications";

/** No seed — starts empty. Not versioned like the User/Session/Message stores
 *  since there's no fixed demo data to migrate, just an accumulating log. */
function readNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
  return raw ? (JSON.parse(raw) as Notification[]) : [];
}

function writeNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  return readNotifications()
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUnreadCount(userId: string): Promise<number> {
  return (await getNotificationsForUser(userId)).filter((n) => !n.read).length;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  href: string,
  relatedId: string | null = null
): Promise<Notification> {
  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    type,
    title,
    body,
    href,
    relatedId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  writeNotifications([...readNotifications(), notification]);
  return notification;
}

export async function markNotificationRead(id: string): Promise<void> {
  const notifications = readNotifications();
  const index = notifications.findIndex((n) => n.id === id);
  if (index === -1) return;
  notifications[index] = { ...notifications[index], read: true };
  writeNotifications(notifications);
}

export async function markAllRead(userId: string): Promise<void> {
  writeNotifications(readNotifications().map((n) => (n.userId === userId ? { ...n, read: true } : n)));
}

/** True if a notification of this type already exists for this related record — the reminder dedupe check. */
export async function hasNotificationFor(userId: string, type: NotificationType, relatedId: string): Promise<boolean> {
  const notifications = readNotifications();
  return notifications.some((n) => n.userId === userId && n.type === type && n.relatedId === relatedId);
}
