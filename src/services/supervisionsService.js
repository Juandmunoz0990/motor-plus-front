import api from './api';

export const supervisionsService = {
  getAll: (params = {}) => api.get('/supervisions', { params }),
  create: (data) => api.post('/supervisions', data),
  delete: (supervisorId, supervisadoId, orderId) => 
    api.delete('/supervisions', { 
      params: { supervisorId, supervisadoId, orderId } 
    }),
};

