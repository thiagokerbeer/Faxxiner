import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, configureApiAuth, resolveApiPath } from "@/api";
import type { MeUser, Role, UserPublic } from "@/types";

type AuthState = {
  accessToken: string | null;
  user: UserPublic | null;
  me: MeUser | null;
  loading: boolean;
  authNotice: string | null;
  clearAuthNotice: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (p: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: Role;
    acceptLgpdTerms: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const accessTokenRef = useRef<string | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [me, setMe] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const setAccessToken = useCallback((t: string | null) => {
    accessTokenRef.current = t;
    setAccessTokenState(t);
  }, []);

  useEffect(() => {
    configureApiAuth({
      getAccessToken: () => accessTokenRef.current,
      setAccessToken,
    });
  }, [setAccessToken]);

  useEffect(() => {
    if (!authNotice) return;
    const t = window.setTimeout(() => setAuthNotice(null), 5000);
    return () => window.clearTimeout(t);
  }, [authNotice]);

  const clearAuthNotice = useCallback(() => setAuthNotice(null), []);

  const refreshMe = useCallback(async () => {
    const t = accessTokenRef.current;
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
      setAccessToken(null);
      setUser(null);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, [setAccessToken]);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(resolveApiPath("/api/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as { accessToken?: string };
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          await refreshMe();
          return;
        }
      }
      setAccessToken(null);
      setUser(null);
      setMe(null);
    } catch {
      setAccessToken(null);
      setUser(null);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, [refreshMe, setAccessToken]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (email: string, password: string) => {
      const r = await api<{ accessToken: string; user: UserPublic }>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
      setAccessToken(r.accessToken);
      setUser(r.user);
      await refreshMe();
      setAuthNotice("Você logou na sua conta");
    },
    [refreshMe, setAccessToken]
  );

  const register = useCallback(
    async (p: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      role: Role;
      acceptLgpdTerms: boolean;
    }) => {
      const r = await api<{ accessToken: string; user: UserPublic }>("/api/auth/register", {
        method: "POST",
        json: p,
      });
      setAccessToken(r.accessToken);
      setUser(r.user);
      await refreshMe();
    },
    [refreshMe, setAccessToken]
  );

  const logout = useCallback(async () => {
    setAuthNotice("Você saiu da sua conta");
    try {
      await fetch(resolveApiPath("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } catch {
      /* rede: ainda limpamos o estado local */
    }
    setAccessToken(null);
    setUser(null);
    setMe(null);
  }, [setAccessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      me,
      loading,
      authNotice,
      clearAuthNotice,
      login,
      register,
      logout,
      refreshMe,
    }),
    [accessToken, user, me, loading, authNotice, clearAuthNotice, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
