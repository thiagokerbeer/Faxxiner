import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/api";
import type { MeUser, Role, UserPublic } from "@/types";

type AuthState = {
  token: string | null;
  user: UserPublic | null;
  me: MeUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (p: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: Role;
    acceptLgpdTerms: boolean;
  }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<UserPublic | null>(null);
  const [me, setMe] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setUser(null);
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      const m = await api<MeUser>("/api/auth/me");
      setMe(m);
      setUser({
        id: m.id,
        email: m.email,
        name: m.name,
        phone: m.phone,
        role: m.role,
      });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ token: string; user: UserPublic }>("/api/auth/login", {
      method: "POST",
      json: { email, password },
    });
    localStorage.setItem(TOKEN_KEY, r.token);
    setToken(r.token);
    setUser(r.user);
    await refreshMe();
  }, [refreshMe]);

  const register = useCallback(
    async (p: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      role: Role;
      acceptLgpdTerms: boolean;
    }) => {
      const r = await api<{ token: string; user: UserPublic }>("/api/auth/register", {
        method: "POST",
        json: p,
      });
      localStorage.setItem(TOKEN_KEY, r.token);
      setToken(r.token);
      setUser(r.user);
      await refreshMe();
    },
    [refreshMe]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setMe(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      me,
      loading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [token, user, me, loading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
