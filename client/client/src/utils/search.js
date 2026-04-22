export function filterByQuery(items, query, fields) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return items || [];
  const list = items || [];
  const keys = Array.isArray(fields) ? fields : [];

  return list.filter((item) =>
    keys.some((k) => String(item?.[k] ?? '').toLowerCase().includes(q))
  );
}

