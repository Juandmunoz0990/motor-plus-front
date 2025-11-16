import api from './api';

export const mechanicsService = {
  getAll: (params = {}) => api.get('/mechanics', { params }),
  getById: (id) => api.get(`/mechanics/${id}`),
  create: (data) => api.post('/mechanics', data),
  update: (id, data) => api.put(`/mechanics/${id}`, data),
  delete: (id) => api.delete(`/mechanics/${id}`),
};

