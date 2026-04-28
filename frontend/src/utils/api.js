const API_BASE = 'http://localhost:5000/api';

export async function fetchJson(path, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed = null;

    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }

    const backendMessage = parsed?.message || parsed?.error;
    const fallback = text && !text.startsWith('<!DOCTYPE') ? text : `HTTP ${response.status}`;
    throw new Error(backendMessage || fallback);
  }

  const responseData = await response.json();
  
  // Return data field if it exists, otherwise return the whole response
  return responseData.data !== undefined ? responseData.data : responseData;
}
