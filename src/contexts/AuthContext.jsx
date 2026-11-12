import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, tokenStore } from "@/lib/api";
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const result = await api.get("/auth/me");
      setUser(result.user);
      if (!result.user) tokenStore.clear();
      return result.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const login = useCallback(async (email, password) => {
    const result = await api.post("/auth/login", { email, password });
    tokenStore.set(result.token);
    setUser(result.user);
    return result.user;
  }, []);
  const register = useCallback(async (data) => {
    const result = await api.post("/auth/register", data);
    tokenStore.set(result.token);
    setUser(result.user);
    return result.user;
  }, []);
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);
  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, setUser }),
    [user, loading, login, register, logout, refresh]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
export {
  AuthProvider,
  useAuth
};
