import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  permission: string;
  children: ReactNode;
}

// Muestra sus hijos solo si el usuario tiene el permiso.
// Ej: <Can permission="producto:delete"><button>Eliminar</button></Can>
// Es solo un complemento visual: la protección real está en el backend (403).
export function Can({ permission, children }: Props) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : null;
}
