import axiosInstance from '../utils/axios';

const adminService = {
  /**
   * Get admin dashboard data
   * @returns {Promise} Dashboard summary and recent requests
   */
  getDashboard: () => {
    console.log('🟢 [adminService] getDashboard() called');
    console.log('🟢 [adminService] Token:', localStorage.getItem('token')?.substring(0, 20) + '...');
    const result = axiosInstance.get('/admin/dashboard');
    console.log('🟢 [adminService] axios.get() returned promise');
    return result;
  },

  /**
   * Get all users (Owner & Peternak only)
   * @param {string} search - Search query for name or email
   * @returns {Promise} Users list
   */
  getUsers: (search = '') => {
    return axiosInstance.get('/admin/users', {
      params: { search }
    });
  },

  /**
   * Get single user detail
   * @param {number} userId - User ID
   * @returns {Promise} User detail
   */
  getUser: (userId) => {
    return axiosInstance.get(`/admin/users/${userId}`);
  },

  /**
   * Create new user
   * @param {Object} data - User data {role_id, username, email, password, name, phone_number}
   * @returns {Promise} Created user
   */
  createUser: (data) => {
    return axiosInstance.post('/admin/users', data);
  },

  /**
   * Update existing user
   * @param {number} id - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise} Updated user
   */
  updateUser: (id, data) => {
    return axiosInstance.put(`/admin/users/${id}`, data);
  },

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise} Success message
   */
  deleteUser: (id) => {
    return axiosInstance.delete(`/admin/users/${id}`);
  },

  /**
   * Get all farms
   * @returns {Promise} Farms list
   */
  getFarms: () => {
    return axiosInstance.get('/admin/farms');
  },

  /**
   * Get farms by owner
   * @param {number} ownerId - Owner user ID
   * @returns {Promise} Farms list for specific owner
   */
  getFarmsByOwner: (ownerId) => {
    return axiosInstance.get(`/admin/owners/${ownerId}/farms`);
  },

  /**
   * Create new farm
   * @param {Object} data - Farm data {owner_id, farm_name, location, initial_population, initial_weight, farm_area}
   * @returns {Promise} Created farm
   */
  createFarm: (data) => {
    return axiosInstance.post('/admin/farms', data);
  },

  /**
   * Get farm configuration
   * @param {number} farmId - Farm ID
   * @returns {Promise} Farm config (EAV pattern)
   */
  getFarmConfig: (farmId) => {
    return axiosInstance.get(`/admin/farms/${farmId}/config`);
  },

  /**
   * Update farm configuration
   * @param {number} farmId - Farm ID
   * @param {Object} config - Configuration object
   * @returns {Promise} Updated config
   */
  updateFarmConfig: (farmId, config) => {
    return axiosInstance.put(`/admin/farms/${farmId}/config`, config);
  },

  /**
   * Reset farm config to default (first input)
   * @param {number} farmId - Farm ID
   * @returns {Promise} Success message
   */
  resetFarmConfig: (farmId) => {
    return axiosInstance.post(`/admin/farms/${farmId}/config/reset`);
  },

  /**
   * Get all request logs
   * @param {string} sort - Sort order: 'newest' or 'oldest'
   * @param {number} page - Page number (6 items per page)
   * @returns {Promise} Paginated requests
   */
  getRequests: (sort = 'newest', page = 1) => {
    return axiosInstance.get('/admin/requests', {
      params: { sort, page }
    });
  },

  /**
   * Update request status
   * @param {number} id - Request ID
   * @param {string} status - Status: 'menunggu', 'diproses', 'selesai'
   * @returns {Promise} Updated request
   */
  updateRequestStatus: (id, status) => {
    return axiosInstance.put(`/admin/requests/${id}/status`, { status });
  },

  /**
   * Get all owners (for dropdown)
   * @returns {Promise} Owners list
   */
  getOwners: () => {
    return axiosInstance.get('/admin/owners');
  },

  /**
   * Get peternaks assigned to owner
   * @param {number} ownerId - Owner user ID
   * @returns {Promise} Peternaks list
   */
  getPeternaks: (ownerId) => {
    return axiosInstance.get(`/admin/peternaks/${ownerId}`);
  }
};

export default adminService;
