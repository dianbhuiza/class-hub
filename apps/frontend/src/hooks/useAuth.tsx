import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  ApiError,
  TOKEN_KEY,
  UNAUTHORIZED_EVENT,
} from '../api';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  notice: string | null;
  clearNotice: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SESSION_EXPIRED = 'Tu sesión expiró o no es válida. Volvé a iniciar sesión.';
const SESSION_UNVERIFIED = 'No pudimos verificar tu sesión. Volvé a iniciar sesión.';

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const endSession = useCallback((message: string | null) => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    setNotice(message);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      endSession(SESSION_EXPIRED);
      void apiLogout().catch(() => {});
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [endSession]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          endSession(SESSION_EXPIRED);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) return;
        endSession(SESSION_UNVERIFIED);
      })
      .finally(() => setLoading(false));
  }, [endSession]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    if (data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
    }
    setNotice(null);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {});
    endSession(null);
  }, [endSession]);

  return (
    <AuthContext.Provider
      value={{ user, loading, notice, clearNotice: () => setNotice(null), login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
