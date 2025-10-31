import axios from 'axios';

// Health Check Services
export const healthService = {
  // Check server health status
  async checkHealth() {
    try {
      // Use direct axios call since health endpoint is not under /api
      const response = await axios.get('http://localhost:5000/health');
      return {
        success: true,
        health: response.data,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Health check failed',
        details: error.response?.data
      };
    }
  },

  // Get server status and information
  async getServerInfo() {
    try {
      const response = await axios.get('http://localhost:5000/health');
      return {
        success: true,
        info: {
          status: response.data.success ? 'healthy' : 'unhealthy',
          message: response.data.message,
          timestamp: response.data.timestamp,
          uptime: new Date(response.data.timestamp).getTime() - Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Server unavailable',
        info: {
          status: 'unhealthy',
          message: 'Cannot connect to server',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
};