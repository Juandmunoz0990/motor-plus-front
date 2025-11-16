import api from './api';

export const partsService = {
  getAll: (params = {}) => api.get('/parts', { params }),
  getById: (id) => api.get(`/parts/${id}`),
  create: (data) => api.post('/parts', data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  setActive: (id, active) => api.patch(`/parts/${id}/active`, null, { params: { active } }),
  delete: (id) => api.delete(`/parts/${id}`),
  getMovements: (id, params = {}) => api.get(`/parts/${id}/movements`, { params }),
  createMovement: (id, data) => api.post(`/parts/${id}/movements`, data),
};

