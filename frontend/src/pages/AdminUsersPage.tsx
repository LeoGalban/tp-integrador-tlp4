import { useEffect, useState } from "react";
import { assignRole, getRoles, getUsers } from "../api/users.api";
import { useAuth } from "../context/AuthContext";
import type { Role, User } from "../types";

// Administración de usuarios (RF6): listar y asignar rol. Solo para admin.
export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getUsers(), getRoles()])
      .then(([usersData, rolesData]) => {
        setUsers(usersData);
        setRoles(rolesData);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  async function handleRoleChange(userId: number, roleId: number) {
    setError("");
    setMessage("");
    try {
      const updated = await assignRole(userId, roleId);
      setUsers((list) => list.map((u) => (u.id === userId ? updated : u)));
      setMessage(`${updated.email} ahora tiene el rol "${updated.roleName}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="container">
      <h1>Usuarios</h1>
      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {/* El admin no puede cambiarse su propio rol (el backend también lo impide) */}
                <select
                  value={user.roleId}
                  disabled={user.id === currentUser?.id}
                  onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
