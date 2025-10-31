import api from './api';

// Friend Services
export const friendService = {
  // Send friend request
  async sendFriendRequest(friendId) {
    try {
      const response = await api.post('/friends/request', { friend_id: friendId });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to send friend request'
      };
    }
  },

  // Accept friend request
  async acceptFriendRequest(friendId) {
    try {
      const response = await api.put('/friends/accept', { friend_id: friendId });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to accept friend request'
      };
    }
  },

  // Decline friend request
  async declineFriendRequest(friendId) {
    try {
      const response = await api.put('/friends/decline', { friend_id: friendId });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to decline friend request'
      };
    }
  },

  // Remove friend or cancel request
  async removeFriend(friendId) {
    try {
      const response = await api.delete(`/friends/${friendId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to remove friend'
      };
    }
  },

  // Block user
  async blockUser(friendId) {
    try {
      const response = await api.post('/friends/block', { friend_id: friendId });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to block user'
      };
    }
  },

  // Unblock user
  async unblockUser(friendId) {
    try {
      const response = await api.post('/friends/unblock', { friend_id: friendId });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to unblock user'
      };
    }
  },

  // Get friends list with optional status filter
  async getFriends(params = {}) {
    try {
      const response = await api.get('/friends', { params });
      return {
        success: true,
        friends: response.data.data.friends,
        count: response.data.data.count
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch friends'
      };
    }
  },

  // Get pending friend requests (incoming)
  async getPendingRequests(params = {}) {
    try {
      const response = await api.get('/friends/pending', { params });
      return {
        success: true,
        requests: response.data.data.pending_requests,
        pagination: response.data.data.pagination,
        count: response.data.data.pagination?.total_items || response.data.data.pending_requests?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch pending requests'
      };
    }
  },

  // Get sent friend requests (outgoing)
  async getSentRequests(params = {}) {
    try {
      const response = await api.get('/friends/sent', { params });
      return {
        success: true,
        requests: response.data.data.sent_requests,
        count: response.data.data.count
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch sent requests'
      };
    }
  },

  // Search for users to add as friends
  async searchUsers(searchTerm, params = {}) {
    try {
      const response = await api.get('/friends/search', { 
        params: { search: searchTerm, ...params } 
      });
      return {
        success: true,
        users: response.data.data.users,
        count: response.data.data.count
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to search users'
      };
    }
  },

  // Get friend statistics
  async getFriendStats() {
    try {
      const response = await api.get('/friends/stats');
      return {
        success: true,
        stats: response.data.data.stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch friend statistics'
      };
    }
  }
};