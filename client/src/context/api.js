export async function api(path, { method = 'GET', body, token, on401 } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Network error');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) on401?.();
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    if (data.retryAfter != null) err.retryAfter = Number(data.retryAfter);
    throw err;
  }
  return data;
}
