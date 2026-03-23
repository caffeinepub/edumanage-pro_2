import { useState } from "react";

export type Role = "admin" | "teacher" | "student";

export interface AuthUser {
  username: string;
  role: Role;
}

const STORAGE_KEY = "ems_user";

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => loadUser());

  const login = (username: string, role: Role) => {
    const u: AuthUser = { username, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return { user, login, logout };
}
