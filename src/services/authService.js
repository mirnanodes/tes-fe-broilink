import axiosInstance, { getCsrfCookie } from '../utils/axios';

const authService = {
  /**
   * Login user
   * CRITICAL: Must fetch CSRF cookie BEFORE posting credentials
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>} Response with token and user data
   */
  login: async (username, password) => {
    try {
      // Step 1: Get CSRF cookie
      await getCsrfCookie();

      // Step 2: Login with credentials
      const response = await axiosInstance.post('/api/login', {
        username,
        password
      });

      // Step 3: Store token and user data
      if (response.data.success || response.data.token) {
        const token = response.data.token;
        const user = response.data.user || response.data.data?.user;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', user.role);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   * Clears stored data and redirects to login
   */
  logout: async () => {
    try {
      // Call logout endpoint if available
      await axiosInstance.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
  },

  /**
   * Get current logged in user
   * @returns {Object|null} User object or null
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('token');
  },

  /**
   * Get user role
   * @returns {string|null} Role name or null
   */
  getUserRole: () => {
    return localStorage.getItem('userRole') || null;
  }
};

export default authService;
