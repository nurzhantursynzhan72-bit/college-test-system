export async function api(path, options = {}) {
  const resp = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await resp.json().catch(() => null);
  if (!data) throw new Error('Invalid JSON response');
  return data;
}

