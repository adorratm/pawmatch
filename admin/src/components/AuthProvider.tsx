'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, type AdminUser } from '@/lib/api';

type AuthState = {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('pawmatch_admin_token');
    const u = localStorage.getItem('pawmatch_admin_user');
    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem('pawmatch_admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const role = data.user?.role;
    if (role !== 'admin' && role !== 'moderator') {
      throw new Error('Bu hesap yönetim paneline erişemez');
    }
    const adminUser: AdminUser = {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      role,
    };
    localStorage.setItem('pawmatch_admin_token', data.accessToken);
    localStorage.setItem('pawmatch_admin_user', JSON.stringify(adminUser));
    setToken(data.accessToken);
    setUser(adminUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pawmatch_admin_token');
    localStorage.removeItem('pawmatch_admin_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
