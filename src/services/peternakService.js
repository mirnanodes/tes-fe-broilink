import axiosInstance from '../utils/axios';

const peternakService = {
  /**
   * Get peternak dashboard
   */
  getDashboard: () => {
    return axiosInstance.get('/peternak/dashboard');
  },

  /**
   * Submit daily report
   */
  submitReport: (data) => {
    return axiosInstance.post('/peternak/reports', data);
  },

  /**
   * Get peternak profile
   */
  getProfile: () => {
    return axiosInstance.get('/peternak/profile');
  },

  /**
   * Update profile
   */
  updateProfile: (data) => {
    return axiosInstance.put('/peternak/profile', data);
  },

  /**
   * Upload profile photo
   */
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    return axiosInstance.post('/peternak/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Send OTP to old phone number
   */
  sendOtp: (newPhone) => {
    return axiosInstance.post('/peternak/otp/send', {
      new_phone_number: newPhone
    });
  },

  /**
   * Verify OTP and update phone
   */
  verifyOtp: (otp, newPhone) => {
    return axiosInstance.post('/peternak/otp/verify', {
      otp,
      new_phone_number: newPhone
    });
  }
};

export default peternakService;
