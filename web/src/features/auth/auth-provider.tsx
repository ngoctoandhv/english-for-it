"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "@/lib/api/auth";
import type { User } from "@/lib/api/types";
import { tokenStore } from "@/lib/auth/token-store";

type Status = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  user: User | null;
  status: Status;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { email: string; password: string; name: string }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    if (!tokenStore.get()) {
      queueMicrotask(() => !cancelled && setStatus("anonymous"));
      return;
    }
    authApi
      .getMe()
      .then(({ user }) => !cancelled && (setUser(user), setStatus("authenticated")))
      .catch(() => !cancelled && (tokenStore.clear(), setStatus("anonymous")));
    return () => {
      cancelled = true;
    };
  }, []);

  const accept = useCallback((res: authApi.AuthResponse) => {
    tokenStore.set({ accessToken: res.access_token, refreshToken: res.refresh_token });
    setUser(res.user);
    setStatus("authenticated");
    return res.user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login: async (email, password) => accept(await authApi.login({ email, password })),
      register: async (input) =>
        accept(await authApi.register({ ...input, time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone })),
      logout: async () => {
        const tokens = tokenStore.get();
        tokenStore.clear();
        setUser(null);
        setStatus("anonymous");
        if (tokens) await authApi.logout(tokens.refreshToken).catch(() => undefined);
      },
      setUser,
    }),
    [user, status, accept],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
