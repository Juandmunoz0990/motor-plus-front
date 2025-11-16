import api from './api';

export const clientsService = {
  getAll: (params = {}) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  getVehicles: (id, params = {}) => api.get(`/clients/${id}/vehicles`, { params }),
  addVehicle: (id, data) => api.post(`/clients/${id}/vehicles`, data),
};

