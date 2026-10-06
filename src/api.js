import axios from 'axios';

// All requests go to the LavaLust API - the app never talks to the database directly.
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';

export const session = {
  get access() { return localStorage.getItem(ACCESS_KEY); },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  get user() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  },
  save(tokens, user) {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  if (session.access) config.headers.Authorization = `Bearer ${session.access}`;
  return config;
});

// If the access token expired (401), try once to get a new one with the refresh token.
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes('/api/login') || original?.url?.includes('/api/refresh');

    if (error.response?.status === 401 && !original._retry && !isAuthCall && session.refresh) {
      original._retry = true;
      try {
        refreshing = refreshing || axios.post(`${API_URL}/api/refresh`, { refresh_token: session.refresh });
        const { data } = await refreshing;
        session.save(data.tokens);
        original.headers.Authorization = `Bearer ${data.tokens.access_token}`;
        return api(original);
      } catch {
        session.clear();
        window.dispatchEvent(new Event('auth:logout'));
      } finally {
        refreshing = null;
      }
    }
    return Promise.reject(error);
  }
);

// The LavaLust Api library answers errors as { error: "message", status: 4xx }.
export const errorMessage = (err) => {
  if (err?.response) return err.response.data?.error || `Request failed (${err.response.status}).`;
  if (err?.request) return 'Can’t reach the server. Check your connection and try again.';
  return err?.message || 'Something went wrong';
};

// ---- Auth ----
export const register = (payload) => api.post('/api/register', payload);
export const login = async (username, password) => {
  const { data } = await api.post('/api/login', { username, password });
  session.save(data.tokens, data.user);
  return data.user;
};
export const logout = async () => {
  try {
    if (session.refresh) await api.post('/api/logout', { refresh_token: session.refresh });
  } catch { /* ignore - we clear the session either way */ }
  session.clear();
};

// ---- Products (all require a valid token) ----
export const getProducts = async () => (await api.get('/api/products')).data.data;
export const createProduct = async (p) => (await api.post('/api/products', p)).data.data;
export const updateProduct = async (id, p) => (await api.put(`/api/products/${id}`, p)).data.data;
export const deleteProduct = async (id) => api.delete(`/api/products/${id}`);

export default api;
