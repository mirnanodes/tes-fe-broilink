import axiosInstance from '../utils/axios';

const ownerService = {
  /**
   * Get owner dashboard
   */
  getDashboard: () => {
    return axiosInstance.get('/owner/dashboard');
  },

  /**
   * Get monitoring data for specific farm
   */
  getMonitoring: (farmId, period = '1day') => {
    return axiosInstance.get(`/owner/monitoring/${farmId}`, {
      params: { period }
    });
  },

  /**
   * Get analytics data for specific farm
   */
  getAnalytics: (farmId, period = '1day') => {
    return axiosInstance.get(`/owner/analytics/${farmId}`, {
      params: { period }
    });
  },

  /**
   * Export farm data to CSV
   */
  exportData: (farmId) => {
    return axiosInstance.get(`/owner/export/${farmId}`, {
      params: { format: 'csv' },
      responseType: 'blob'
    });
  },

  /**
   * Submit request
   */
  submitRequest: (data) => {
    return axiosInstance.post('/owner/requests', data);
  },

  /**
   * Get owner profile
   */
  getProfile: () => {
    return axiosInstance.get('/owner/profile');
  },

  /**
   * Update owner profile
   */
  updateProfile: (data) => {
    return axiosInstance.put('/owner/profile', data);
  }
};

export default ownerService;
