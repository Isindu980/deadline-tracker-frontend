import api from './api';

// User Management Services
export const userService = {
  // Get all users with pagination and search
  async getAllUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return {
        success: true,
        users: response.data.data.users,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch users'
      };
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return {
        success: true,
        user: response.data.data.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch user'
      };
    }
  },

  // Search users with query parameter
  async searchUsers(searchTerm, params = {}) {
    try {
      const response = await api.get('/users', { 
        params: { search: searchTerm, ...params } 
      });
      return {
        success: true,
        users: response.data.data.users,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to search users'
      };
    }
  },

  // Delete user (admin functionality)
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to delete user'
      };
    }
  }
};