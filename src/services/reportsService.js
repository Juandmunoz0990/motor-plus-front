import api from './api';

export const reportsService = {
  vehicleHistory: (plate) => api.get(`/reports/vehicles/${plate}`),
  mechanicPerformance: (params = {}) => api.get('/reports/mechanics/performance', { params }),
  partTraceability: (partId, params = {}) => api.get(`/reports/parts/${partId}/traceability`, { params }),
  orderMargin: (params = {}) => api.get('/reports/orders/margin', { params }),
  clientActivity: () => api.get('/reports/clients/activity'),
  partStockStatus: () => api.get('/reports/parts/stock-status'),
  servicePopularity: (params = {}) => api.get('/reports/services/popularity', { params }),
  pendingInvoices: () => api.get('/reports/invoices/pending'),
  clientProfitability: (params = {}) => api.get('/reports/clients/profitability', { params }),
  mechanicProductivity: (params = {}) => api.get('/reports/mechanics/productivity', { params }),
};

