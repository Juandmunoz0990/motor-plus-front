import api from './api';

export const vehiclesService = {
  getAll: (params = {}) => api.get('/vehicles', { params }),
  getByPlate: (plate) => api.get(`/vehicles/${plate}`),
  create: (data) => api.post('/vehicles', data),
  update: (plate, data) => api.put(`/vehicles/${plate}`, data),
  delete: (plate) => api.delete(`/vehicles/${plate}`),
  getOrders: (plate, params = {}) => api.get(`/vehicles/${plate}/orders`, { params }),
  getHistory: (plate) => api.get(`/vehicles/${plate}/history`),
};

