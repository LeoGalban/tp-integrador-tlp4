import { apiFetch } from "./client";
import type { AppNotification } from "../types";

export function getNotifications(): Promise<AppNotification[]> {
  return apiFetch<AppNotification[]>("/notifications");
}

export async function getUnreadCount(): Promise<number> {
  const result = await apiFetch<{ count: number }>("/notifications/unread-count");
  return result.count;
}

export function markAsRead(id: number): Promise<AppNotification> {
  return apiFetch<AppNotification>(`/notifications/${id}/read`, { method: "PATCH" });
}
