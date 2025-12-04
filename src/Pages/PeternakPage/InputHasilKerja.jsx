import React, { useState } from 'react';

export default function InputHasilKerja() {
  const [formData, setFormData] = useState({
    pakan: '',
    minum: '',
    bobot: '',
    kematian: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      console.log('Submitting:', formData);
      alert('Data berhasil disimpan!');
      setFormData({ pakan: '', minum: '', bobot: '', kematian: '' });
    } catch (error) {
      alert('Gagal menyimpan data!');
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-gray-900">Input Hasil Kerja</h1>
      <p className="text-gray-600 text-sm mt-1 mb-5">Laporkan aktivitas harian Anda</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid 2x2 for the 4 cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Card 1: Laporan Pakan Harian */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Pakan Harian</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Pakan (dalam kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.pakan}
                onChange={(e) => handleChange('pakan', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan jumlah pakan"
                required
              />
            </div>
          </div>

          {/* Card 2: Laporan Minum Harian */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Minum Harian</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Minum (dalam liter)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.minum}
                onChange={(e) => handleChange('minum', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan jumlah minum"
                required
              />
            </div>
          </div>

          {/* Card 3: Laporan Sampling Bobot */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Sampling Bobot</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bobot Rata-rata (kg/ekor)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.bobot}
                onChange={(e) => handleChange('bobot', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan bobot rata-rata"
                required
              />
            </div>
          </div>

          {/* Card 4: Tingkat Kematian */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tingkat Kematian</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah (ekor)
              </label>
              <input
                type="number"
                step="1"
                value={formData.kematian}
                onChange={(e) => handleChange('kematian', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan jumlah kematian"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-8 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  );
}
