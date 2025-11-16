import api from './api';

export const invoicesService = {
  getAll: (params = {}) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  generateFromOrder: (orderId) => api.post(`/invoices/from-order/${orderId}`),
  update: (id, data) => api.patch(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  getLines: (id, params = {}) => api.get(`/invoices/${id}/lines`, { params }),
  addLine: (id, data) => api.post(`/invoices/${id}/lines`, data),
  updateLine: (id, type, refId, data) => api.patch(`/invoices/${id}/lines/${type}/${refId}`, data),
  removeLine: (id, type, refId) => api.delete(`/invoices/${id}/lines/${type}/${refId}`),
  getPayments: (id, params = {}) => api.get(`/invoices/${id}/payments`, { params }),
  addPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),
  removePayment: (invoiceId, paymentId) => api.delete(`/invoices/${invoiceId}/payments/${paymentId}`),
};
