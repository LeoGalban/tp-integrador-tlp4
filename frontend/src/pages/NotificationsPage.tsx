import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getNotifications, markAsRead } from "../api/notifications.api";
import { formatDate } from "../utils/format";
import type { AppNotification } from "../types";

// Bandeja de notificaciones del usuario logueado (canal in-app)
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkAsRead(id: number) {
    try {
      const updated = await markAsRead(id);
      // Reemplazar la notificación en la lista por la versión actualizada
      setNotifications((list) => list.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  if (loading) return <p className="container">Cargando notificaciones…</p>;

  return (
    <div className="container">
      <h1>Notificaciones</h1>
      {error && <p className="error">{error}</p>}

      {notifications.length === 0 ? (
        <p>No tenés notificaciones. Suscribite a un producto para enterarte de sus cambios de estado.</p>
      ) : (
        <ul className="notifications">
          {notifications.map((notification) => (
            <li key={notification.id} className={notification.read ? "read" : "unread"}>
              <div>
                <Link to={`/products/${notification.productId}`}>{notification.productName}</Link>
                {": "}
                <span className={`badge ${notification.previousStatus}`}>{notification.previousStatus}</span>
                {" → "}
                <span className={`badge ${notification.newStatus}`}>{notification.newStatus}</span>
                <div className="hint">{formatDate(notification.createdAt)}</div>
              </div>
              {notification.read ? (
                <span className="hint">Leída</span>
              ) : (
                <button onClick={() => handleMarkAsRead(notification.id)}>Marcar como leída</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
