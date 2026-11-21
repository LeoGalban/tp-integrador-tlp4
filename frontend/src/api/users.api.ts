import { apiFetch } from "./client";
import type { Role, User } from "../types";

export function getUsers(): Promise<User[]> {
  return apiFetch<User[]>("/users");
}

export function getRoles(): Promise<Role[]> {
  return apiFetch<Role[]>("/users/roles");
}

export function assignRole(userId: number, roleId: number): Promise<User> {
  return apiFetch<User>(`/users/${userId}/role`, { method: "PATCH", body: { roleId } });
}
