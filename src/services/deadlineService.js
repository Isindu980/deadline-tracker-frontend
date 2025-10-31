import api from './api';

// Deadline Services
export const deadlineService = {
  // Get all deadlines with filtering and pagination
  async getDeadlines(params = {}) {
    try {
      const response = await api.get('/deadlines', { params });
      return {
        success: true,
        deadlines: response.data.data.deadlines,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch deadlines'
      };
    }
  },

  // Get deadline by ID
  async getDeadlineById(id) {
    try {
      const response = await api.get(`/deadlines/${id}`);
      return {
        success: true,
        deadline: response.data.data.deadline
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch deadline'
      };
    }
  },

  // Create new deadline with optional collaborators
  async createDeadline(deadlineData) {
    try {
      const response = await api.post('/deadlines', deadlineData);
      return {
        success: true,
        deadline: response.data.data.deadline,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to create deadline',
        validationErrors: error.response?.data?.errors
      };
    }
  },

  // Update deadline
  async updateDeadline(id, deadlineData) {
    try {
      const response = await api.put(`/deadlines/${id}`, deadlineData);
      return {
        success: true,
        deadline: response.data.data.deadline,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to update deadline',
        validationErrors: error.response?.data?.errors
      };
    }
  },

  // Update deadline status only
  async updateDeadlineStatus(id, status) {
    try {
      const response = await api.patch(`/deadlines/${id}/status`, { status });
      return {
        success: true,
        deadline: response.data.data.deadline,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to update deadline status'
      };
    }
  },

  // Delete deadline
  async deleteDeadline(id) {
    try {
      const response = await api.delete(`/deadlines/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to delete deadline'
      };
    }
  },

  // Get upcoming deadlines
  async getUpcomingDeadlines(days = 7) {
    try {
      const response = await api.get('/deadlines/upcoming', { 
        params: { days } 
      });
      return {
        success: true,
        deadlines: response.data.data.deadlines
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch upcoming deadlines'
      };
    }
  },

  // Get overdue deadlines
  async getOverdueDeadlines() {
    try {
      const response = await api.get('/deadlines/overdue');
      return {
        success: true,
        deadlines: response.data.data.deadlines
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch overdue deadlines'
      };
    }
  },

  // Get deadline statistics
  async getDeadlineStats() {
    try {
      const response = await api.get('/deadlines/stats');
      return {
        success: true,
        stats: response.data.data.stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch deadline statistics'
      };
    }
  },

  // Add collaborators to existing deadline with copy creation
  async addCollaboratorsToDeadline(deadlineId, collaborators, options = {}) {
    try {
      const {
        create_copies = true,
        copy_options = {
          title_suffix: ' (My Copy)',
          create_individual_copies: true,
          notify_collaborators: true
        }
      } = options;

      const response = await api.post(`/deadlines/${deadlineId}/collaborators`, {
        collaborators,
        create_copies,
        copy_options
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to add collaborators to deadline'
      };
    }
  },

  // Get deadlines by student ID
  async getDeadlinesByStudentId(studentId, params = {}) {
    try {
      const response = await api.get(`/deadlines/student/${studentId}`, { params });
      return {
        success: true,
        deadlines: response.data.data.deadlines,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || 'Failed to fetch student deadlines'
      };
    }
  }
};