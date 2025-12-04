import React, { useState } from 'react';
import ownerService from '../services/ownerService';
import { handleError } from '../utils/errorHandler';

const RequestModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('kandang');
  const [formData, setFormData] = useState({
    farmName: '',
    farmLocation: '',
    farmArea: '',
    peternakName: '',
    peternakPhone: '',
    peternakEmail: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let requestData;

      if (activeTab === 'kandang') {
        requestData = {
          request_type: 'Tambah Kandang',
          request_content: JSON.stringify({
            farm_name: formData.farmName,
            location: formData.farmLocation,
            farm_area: formData.farmArea
          })
        };
      } else {
        requestData = {
          request_type: 'Tambah Peternak',
          request_content: JSON.stringify({
            name: formData.peternakName,
            phone_number: formData.peternakPhone,
            email: formData.peternakEmail
          })
        };
      }

      await ownerService.submitRequest(requestData);
      alert('Permintaan berhasil dikirim!');
      onClose();
    } catch (error) {
      const errorMessage = handleError('RequestModal submit', error);
      alert('Gagal mengirim permintaan: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-[480px] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ajukan Permintaan Owner</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('kandang')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'kandang'
                ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tambah Kandang
          </button>
          <button
            onClick={() => setActiveTab('peternak')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'peternak'
                ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tambah Peternak
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'kandang' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kandang</label>
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Kandang</label>
                <input
                  type="text"
                  value={formData.farmLocation}
                  onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Luas Kandang (m²)</label>
                <input
                  type="number"
                  value={formData.farmArea}
                  onChange={(e) => setFormData({ ...formData, farmArea: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap Peternak</label>
                <input
                  type="text"
                  value={formData.peternakName}
                  onChange={(e) => setFormData({ ...formData, peternakName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={formData.peternakPhone}
                  onChange={(e) => setFormData({ ...formData, peternakPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.peternakEmail}
                  onChange={(e) => setFormData({ ...formData, peternakEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim Permintaan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
