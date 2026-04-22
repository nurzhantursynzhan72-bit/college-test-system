import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export function useSession() {
  const [me, setMe] = useState({ loading: true, loggedIn: false, user: null });
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    const data = await api('/api/me');
    if (data?.loggedIn) {
      setMe({ loading: false, loggedIn: true, user: data.user });
    } else {
      setMe({ loading: false, loggedIn: false, user: null });
    }
    return data;
  }, []);

  useEffect(() => {
    refresh().catch((e) => {
      setError(e?.message || 'Session error');
      setMe({ loading: false, loggedIn: false, user: null });
    });
  }, [refresh]);

  const login = useCallback(async ({ email, password }) => {
    setError('');
    const data = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (!data?.success) {
      throw new Error(data?.message || 'Login failed');
    }
    await refresh();
    return data;
  }, [refresh]);

  const logout = useCallback(async () => {
    setError('');
    try {
      await api('/api/logout', { method: 'POST' });
    } finally {
      await refresh().catch(() => setMe({ loading: false, loggedIn: false, user: null }));
    }
  }, [refresh]);

  return { me, error, refresh, login, logout };
}
