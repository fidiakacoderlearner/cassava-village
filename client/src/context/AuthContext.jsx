import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setOnUnauthorized } from './api';

const AuthContext = createContext(null);

function readStored() {
  try {
    const token = localStorage.getItem('cv_token');
    const user = JSON.parse(localStorage.getItem('cv_user') || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [{ token, user }, setState] = useState(readStored);

  const setSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem('cv_token', nextToken);
    localStorage.setItem('cv_user', JSON.stringify(nextUser));
    setState({ token: nextToken, user: nextUser });
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setSession(data.token, data.user);
      return data.user;
    },
    [setSession]
  );

  const signup = useCallback(
    async (name, email, password, classCode, role) => {
      const data = await api('/api/auth/signup', {
        method: 'POST',
        body: { name, email, password, classCode, role },
      });
      setSession(data.token, data.user);
      return data.user;
    },
    [setSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('cv_token');
    localStorage.removeItem('cv_user');
    setState({ token: null, user: null });
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
    });
    return () => setOnUnauthorized(null);
  }, [logout]);

  const value = useMemo(
    () => ({ token, user, isAuthed: Boolean(token), login, signup, logout }),
    [token, user, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
