import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: ReactNode;
  permission?: string; // opcional: además de estar logueado, exigir un permiso
}

// Envuelve una página que requiere sesión: si no hay usuario, redirige al login
export function ProtectedRoute({ children, permission }: Props) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return <p className="container">Cargando…</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (permission && !hasPermission(permission)) {
    return <p className="container error">No tenés permiso para ver esta página.</p>;
  }
  return <>{children}</>;
}
