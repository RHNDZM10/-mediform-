import { createContext, useContext, useMemo, useState } from "react";
import type { User } from "../lib/types";

type AuthState = {
  user: User | null;
  token: string | null;
  setSession: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("mediform.token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("mediform.user");
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      setSession(nextToken, nextUser) {
        localStorage.setItem("mediform.token", nextToken);
        localStorage.setItem("mediform.user", JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      logout() {
        localStorage.removeItem("mediform.token");
        localStorage.removeItem("mediform.user");
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
