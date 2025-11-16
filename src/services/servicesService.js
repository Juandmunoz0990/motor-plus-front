import api from './api';

export const servicesService = {
  getAll: (params = {}) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  setActive: (id, active) => api.patch(`/services/${id}/active`, null, { params: { active } }),
  delete: (id) => api.delete(`/services/${id}`),
};

