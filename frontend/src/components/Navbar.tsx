import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

// Barra superior: links según permisos, usuario logueado y botón para salir
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <strong>Tienda TLP4</strong>
      <NavLink to="/products">Productos</NavLink>
      <span className="spacer" />
      <span>
        {user.name} <small>({user.roleName})</small>
      </span>
      <button onClick={handleLogout}>Salir</button>
    </nav>
  );
}
