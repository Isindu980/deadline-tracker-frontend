// Main services exports
export { authService } from './authService';
export { deadlineService } from './deadlineService';
export { friendService } from './friendService';
export { userService } from './userService';
export { notificationService, emailService } from './notificationService';
export { healthService } from './healthService';

// Re-export the base API instance for custom requests
export { default as api } from './api';

// Utility functions for common API patterns
export const handleApiResponse = (response) => {
  if (response.success) {
    return response;
  } else {
    throw new Error(response.error || 'API request failed');
  }
};

export const createApiError = (message, details = null) => ({
  success: false,
  error: message,
  details
});

// Common API request patterns
export const apiUtils = {
  // Pagination helper
  getPaginatedData: async (apiCall, page = 1, limit = 10) => {
    try {
      return await apiCall({ page, limit });
    } catch (error) {
      return createApiError('Failed to fetch paginated data', error);
    }
  },

  // Search helper
  searchData: async (apiCall, searchTerm, filters = {}) => {
    try {
      return await apiCall(searchTerm, { ...filters, search: searchTerm });
    } catch (error) {
      return createApiError('Search failed', error);
    }
  },

  // Bulk operation helper
  bulkOperation: async (items, operation) => {
    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const result = await operation(item);
        results.push(result);
      } catch (error) {
        errors.push({ item, error: error.message });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: items.length,
        successful: results.length,
        failed: errors.length
      }
    };
  }
};