import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as authApi from "../api/auth.api";
import { getToken, setToken } from "../api/client";
import type { User } from "../types";

// Lo que cualquier componente puede pedir con useAuth()
interface AuthContextValue {
  user: User | null; // usuario logueado (null si no hay sesión)
  loading: boolean; // true mientras se recupera la sesión al abrir la app
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app: si hay un token guardado, pedir el usuario al backend
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(setUser)
      .catch(() => setToken(null)) // token vencido o inválido: se descarta
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const result = await authApi.login(email, password);
    setToken(result.token);
    setUser(result.user);
  }

  async function register(name: string, email: string, password: string) {
    const result = await authApi.register(name, email, password);
    setToken(result.token);
    setUser(result.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  // Los permisos vienen del backend (no se deciden en el frontend)
  function hasPermission(permission: string): boolean {
    return user?.permissions.includes(permission) ?? false;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto: const { user, logout } = useAuth();
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}
