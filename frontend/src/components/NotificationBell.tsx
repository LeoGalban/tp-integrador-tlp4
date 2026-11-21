import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { getUnreadCount } from "../api/notifications.api";

// Cada cuánto se consulta el contador (polling). La consigna acepta polling.
const POLLING_MS = 5000;

// Campanita con la cantidad de notificaciones no leídas
export function NotificationBell() {
  const [count, setCount] = useState(0);
  // Al cambiar de página también se actualiza (ej: después de marcar leídas)
  const location = useLocation();

  useEffect(() => {
    function refresh() {
      getUnreadCount()
        .then(setCount)
        .catch(() => {}); // si falla una consulta, se reintenta en la próxima vuelta
    }

    refresh(); // primera consulta inmediata
    const timer = setInterval(refresh, POLLING_MS);
    // Al desmontar el componente se corta el polling
    return () => clearInterval(timer);
  }, [location.pathname]);

  return (
    <Link to="/notifications" className="bell" title="Notificaciones">
      🔔 {count > 0 && <span className="bell-count">{count}</span>}
    </Link>
  );
}
