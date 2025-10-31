import api from './api';

export const notificationService = {
  // Get user notifications
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params });
      return {
        success: true,
        data: response.data.data.notifications || [],
        pagination: response.data.data.pagination,
        total: response.data.data.total_items || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch notifications'
      };
    }
  },

  // Get unread notification count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return {
        success: true,
        count: response.data.data.unread_count || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch unread count',
        count: 0
      };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to mark notification as read'
      };
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to mark all notifications as read'
      };
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to delete notification'
      };
    }
  },

  // Get notification preferences
  async getNotificationPreferences() {
    try {
      const response = await api.get('/users/notifications/preferences');
      return {
        success: true,
        preferences: response.data.data.preferences || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch notification preferences'
      };
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(preferences) {
    try {
      const response = await api.put('/users/notifications/preferences', preferences);
      return {
        success: true,
        preferences: response.data.data.preferences,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to update notification preferences'
      };
    }
  }
};