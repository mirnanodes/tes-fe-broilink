import axiosInstance from '../utils/axios';

const ownerService = {
  /**
   * Get owner dashboard
   * @returns {Promise} Farms list, analytics, and activities
   */
  getDashboard: () => {
    return axiosInstance.get('/api/owner/dashboard');
  },

  /**
   * Get monitoring data for specific farm
   * @param {number} farmId - Farm ID
   * @param {string} period - Time period: '1day', '1week', '1month', '6months'
   * @returns {Promise} Current sensor data + historical chart
   */
  getMonitoring: (farmId, period = '1day') => {
    return axiosInstance.get(`/api/owner/monitoring/${farmId}`, {
      params: { period }
    });
  },

  /**
   * Get analytics data for specific farm
   * @param {number} farmId - Farm ID
   * @param {string} period - Time period: '1day', '1week', '1month', '6months'
   * @returns {Promise} Manual data chart (pakan, minum, bobot, kematian)
   */
  getAnalytics: (farmId, period = '1day') => {
    return axiosInstance.get(`/api/owner/analytics/${farmId}`, {
      params: { period }
    });
  },

  /**
   * Export farm data to CSV
   * @param {number} farmId - Farm ID
   * @returns {Promise} CSV file blob
   */
  exportData: (farmId) => {
    return axiosInstance.get(`/api/owner/export/${farmId}`, {
      params: { format: 'csv' },
      responseType: 'blob' // Important for file download
    });
  },

  /**
   * Submit request (tambah kandang / tambah peternak)
   * @param {Object} data - Request data {request_type, request_content}
   * @returns {Promise} Success message
   */
  submitRequest: (data) => {
    return axiosInstance.post('/api/owner/requests', data);
  },

  /**
   * Get owner profile
   * @returns {Promise} User data
   */
  getProfile: () => {
    return axiosInstance.get('/api/owner/profile');
  },

  /**
   * Update owner profile
   * @param {Object} data - Profile data
   * @returns {Promise} Updated profile
   */
  updateProfile: (data) => {
    return axiosInstance.put('/api/owner/profile', data);
  }
};

export default ownerService;
