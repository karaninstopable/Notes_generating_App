import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updatePassword: (data) => API.put('/auth/password', data)
};

// Notes
export const notesAPI = {
  getAll: (params) => API.get('/notes', { params }),
  getOne: (id) => API.get(`/notes/${id}`),
  create: (data) => API.post('/notes', data),
  update: (id, data) => API.put(`/notes/${id}`, data),
  delete: (id) => API.delete(`/notes/${id}`),
  togglePin: (id) => API.patch(`/notes/${id}/pin`)
};

// Admin - Users
export const usersAPI = {
  getAll: (params) => API.get('/users', { params }),
  getOne: (id) => API.get(`/users/${id}`),
  updateRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  toggleStatus: (id) => API.patch(`/users/${id}/status`),
  delete: (id) => API.delete(`/users/${id}`),
  getNotes: (id) => API.get(`/users/${id}/notes`)
};

export default API;
