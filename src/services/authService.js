import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('username', response.data.username);
      sessionStorage.setItem('email', response.data.email);
    }
    return response.data;
  },

  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('email');
  },

  getToken: () => {
    return sessionStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!sessionStorage.getItem('token');
  },

  getUsername: () => {
    return sessionStorage.getItem('username');
  },

  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  verifyCode: async (email, code) => {
    const response = await api.post('/auth/verify-code', { email, code });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

