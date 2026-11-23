const BASE = '/api';
export const getToken = () => localStorage.getItem('gather_token');
export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const response = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
export const dateLabel = value => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
