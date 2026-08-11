import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { api } from './api.js';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { token } = useAuth();
  const [progress, setProgress] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api('/api/progress/me', { token });
      setProgress(data);
    } catch {
      /* ignore */
    } finally {
      setHasLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    if (token) refresh();
  }, [token, refresh]);

  const value = useMemo(
    () => ({
      ...(progress || {}),
      loading: !hasLoaded,
      refresh,
    }),
    [progress, hasLoaded, refresh]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  return useContext(ProgressContext);
}
