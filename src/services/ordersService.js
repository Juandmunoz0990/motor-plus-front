import api from './api';

export const ordersService = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.patch(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  changeStatus: (id, status) => api.post(`/orders/${id}/status`, null, { params: { status } }),
  getItems: (id, params = {}) => api.get(`/orders/${id}/items`, { params }),
  addItem: (id, data) => api.post(`/orders/${id}/items`, data),
  getItem: (orderId, itemId) => api.get(`/orders/${orderId}/items/${itemId}`),
  updateItem: (orderId, itemId, data) => api.patch(`/orders/${orderId}/items/${itemId}`, data),
  removeItem: (orderId, itemId) => api.delete(`/orders/${orderId}/items/${itemId}`),
  getAssignments: (orderId, itemId, params = {}) => api.get(`/orders/${orderId}/items/${itemId}/assignments`, { params }),
  addAssignment: (orderId, itemId, data) => api.post(`/orders/${orderId}/items/${itemId}/assignments`, data),
  updateAssignment: (orderId, itemId, mechanicId, data) => api.patch(`/orders/${orderId}/items/${itemId}/assignments/${mechanicId}`, data),
  removeAssignment: (orderId, itemId, mechanicId) => api.delete(`/orders/${orderId}/items/${itemId}/assignments/${mechanicId}`),
  getItemParts: (orderId, itemId, params = {}) => api.get(`/orders/${orderId}/items/${itemId}/parts`, { params }),
  addItemPart: (orderId, itemId, data) => api.post(`/orders/${orderId}/items/${itemId}/parts`, data),
  updateItemPart: (orderId, itemId, partId, data) => api.patch(`/orders/${orderId}/items/${itemId}/parts/${partId}`, data),
  removeItemPart: (orderId, itemId, partId) => api.delete(`/orders/${orderId}/items/${itemId}/parts/${partId}`),
};
