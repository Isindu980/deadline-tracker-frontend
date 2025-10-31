import api from './api';

// Authentication Services
export const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data,
        user: response.data.data.user,
        token: response.data.data.token
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Registration failed',
        details: error.response?.data,
        validationErrors: error.response?.data?.errors
      };
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return {
        success: true,
        data: response.data,
        user: response.data.data.user,
        token: response.data.data.token
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Login failed',
        details: error.response?.data,
        validationErrors: error.response?.data?.errors
      };
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return {
        success: true,
        user: response.data.data.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to get profile'
      };
    }
  },

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      return {
        success: true,
        user: response.data.data.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to update profile',
        validationErrors: error.response?.data?.errors
      };
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to change password',
        validationErrors: error.response?.data?.errors
      };
    }
  },

  // Reset password using token (from forgot password email)
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/users/reset-password', { token, newPassword });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to reset password',
        details: error.response?.data
      };
    }
  },

//forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to send reset link',
        details: error.response?.data,
        validationErrors: error.response?.data?.errors
      };
    }
  },



  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, clear local storage
      return { success: true };
    }
  }
};