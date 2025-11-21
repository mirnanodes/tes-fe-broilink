import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const AccountIssues = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedFullName = fullName.trim();
    const trimmedWhatsappNumber = whatsappNumber.trim();

    if (!trimmedFullName) {
      setError('Nama lengkap harus diisi');
      return;
    }
    if (!trimmedWhatsappNumber) {
      setError('Nomor WhatsApp harus diisi');
      return;
    }

    // Validate WhatsApp number format (basic validation)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(trimmedWhatsappNumber.replace(/[\s-]/g, ''))) {
      setError('Nomor WhatsApp tidak valid');
      return;
    }

    try {
      // Here you would typically make an API call to submit the account issue
      // For now, we'll just show a success message
      setSuccess('Permintaan Anda telah dikirim. Tim kami akan segera menghubungi Anda.');

      // Reset form
      setFullName('');
      setWhatsappNumber('');

      // Optionally redirect back to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tindak Lanjut Permintaan Akun</h1>
          <p className="text-gray-500 mb-8">Masuk ke akun Broilink Anda</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                autoComplete="name"
              />
            </div>

            {/* WhatsApp Number Field */}
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Nomor WhatsApp
              </label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                autoComplete="tel"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
            >
              Kirim
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-sm text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700"
            >
              Kembali ke <span className="font-medium">Halaman Login</span>
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

export default AccountIssues;
