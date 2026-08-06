import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { api } from './api.js';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { token, user } = useAuth();
  const [progress, setProgress] = useState(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api('/api/progress/me', { token });
      setProgress(data);
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    if (token) refresh();
  }, [token, refresh]);

  const value = useMemo(
    () => ({
      ...(progress || {}),
      loading: !progress,
      refresh,
      isTeacher: user?.role === 'teacher',
    }),
    [progress, user, refresh]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  return useContext(ProgressContext);
}
