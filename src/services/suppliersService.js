import api from './api';

export const suppliersService = {
  getAll: (params = {}) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  getParts: (id, params = {}) => api.get(`/suppliers/${id}/parts`, { params }),
  addPart: (id, data) => api.post(`/suppliers/${id}/parts`, data),
  updatePart: (id, partId, data) => api.patch(`/suppliers/${id}/parts/${partId}`, data),
  removePart: (id, partId) => api.delete(`/suppliers/${id}/parts/${partId}`),
};

