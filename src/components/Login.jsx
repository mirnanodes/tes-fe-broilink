import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const BroilinkLogo = () => (
  <div className="flex items-center gap-2">
    <div className="grid grid-cols-2 gap-1">
      <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
      <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
      <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
    </div>
    <span className="text-xl font-bold text-gray-800">Broilink</span>
  </div>
);

const Login = ({ setIsLoggedIn, setUserRole }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      setError('Username harus diisi');
      return;
    }
    if (!trimmedPassword) {
      setError('Password harus diisi');
      return;
    }

    try {
      const response = await axios.post('/api/login', {
        username: trimmedUsername,
        password: trimmedPassword,
      });

      const { user, token } = response.data.data;

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);

      if (setIsLoggedIn) setIsLoggedIn(true);
      if (setUserRole) setUserRole(user.role);

      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'Owner') {
        navigate('/owner/dashboard');
      } else if (user.role === 'Peternak') {
        navigate('/peternak');
      } else {
        setError('Role pengguna tidak dikenal');
        localStorage.clear();
      }
    } catch (err) {
      console.error('Login Error:', err.response);

      if (err.response && err.response.status === 401) {
        setError('Username atau Password salah');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Terjadi kesalahan koneksi atau server');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h1>
          <p className="text-gray-500 mb-8">Masuk ke akun Broilink Anda</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                Ingat Saya
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
            >
              Masuk
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 flex flex-col gap-2 text-sm text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-700"
            >
              Belum Punya Akun? <span className="font-medium">Daftar Sekarang!</span>
            </button>
            <button
              onClick={() => navigate('/account-issues')}
              className="text-blue-600 hover:text-blue-700"
            >
              Ada Masalah Akun?
            </button>
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-green-500 p-10 flex-col justify-between text-white">
          <div className="flex justify-end">
            <BroilinkLogo />
          </div>

          <div className="space-y-6">
            <p className="text-sm opacity-90 mb-8">
              Teknologi pintar untuk peternakan ayam broiler yang lebih efisien dan produktif
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">Masalah Baru Diisi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <span className="text-sm">Antrian Users Dealer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">Barang Katalog</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
