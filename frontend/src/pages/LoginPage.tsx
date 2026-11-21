import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el login
  if (user) {
    return <Navigate to="/products" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); // evita que el navegador recargue la página
    setError("");
    setSending(true);
    try {
      await login(email, password);
      navigate("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container narrow">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={sending}>
          {sending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
      <p>
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
      <p className="hint">Usuarios de prueba: admin@tp.com, operador@tp.com, usuario@tp.com (clave 123456)</p>
    </div>
  );
}
