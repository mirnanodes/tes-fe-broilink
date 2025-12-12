import axiosInstance from '../utils/axios';

const ownerService = {
  /**
   * Get owner dashboard
   */
  getDashboard: () => {
    return axiosInstance.get('/owner/dashboard');
  },

  /**
   * Get monitoring data for specific farm (NEW: Using aggregate endpoint)
   * @param {number} farmId - Farm ID
   * @param {string} period - '1day', '1week', '1month', '6months'
   * @returns {Promise} Aggregated monitoring data
   */
  getMonitoring: (farmId, period = '1day') => {
    const rangeMap = {
      '1day': '1_day',
      '1week': '1_week',
      '1month': '1_month',
      '6months': '6_months'
    };

    const range = rangeMap[period] || '1_day';
    const date = new Date().toISOString().split('T')[0]; // Today's date YYYY-MM-DD

    return axiosInstance.get('/monitoring/aggregate', {
      params: {
        farm_id: farmId,
        date: date,
        range: range
      }
    });
  },

  /**
   * Get analytics data for specific farm (NEW: Using aggregate endpoint)
   * @param {number} farmId - Farm ID
   * @param {string} period - '1day', '1week', '1month', '6months'
   * @returns {Promise} Aggregated analysis data
   */
  getAnalytics: (farmId, period = '1day') => {
    const rangeMap = {
      '1day': '1_day',
      '1week': '1_week',
      '1month': '1_month',
      '6months': '6_months'
    };

    const range = rangeMap[period] || '1_day';
    const date = new Date().toISOString().split('T')[0]; // Today's date YYYY-MM-DD

    return axiosInstance.get('/analysis/aggregate', {
      params: {
        farm_id: farmId,
        date: date,
        range: range
      }
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
