// Change this if your backend runs on a different host/port
const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

async function apiRequest(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

function requireAuth() {
  if (!getToken()) window.location.href = 'index.html';
}
function requireAdmin() {
  requireAuth();
  const user = getUser();
  if (!user || user.role !== 'admin') window.location.href = 'vote.html';
}
function fmtDate(d) {
  return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}
