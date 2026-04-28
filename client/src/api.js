export async function api(path, options = {}) {
  const resp = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  
  const text = await resp.text();
  try {
    if (!resp.ok) {
      throw new Error(`API Error [${resp.status}]: ${text}`);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error(`API Error [${resp.status}] ${path}:`, text.substring(0, 500));
    throw new Error(`Сервер қатесі (${resp.status}). Ол JSON орнына мәтін қайтарды.`);
  }
}

