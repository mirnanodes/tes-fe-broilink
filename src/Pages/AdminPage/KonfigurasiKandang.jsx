import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { handleError } from '../../utils/errorHandler';
import NavbarAdmin from '../../components/NavbarAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';

const InputGroup = ({ label, name, value, onChange, unit = '' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <div className="relative">
      <input
        type="number"
        step="0.01"
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-3 py-2 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
        required
      />
      {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>}
    </div>
  </div>
);

const KonfigurasiKandang = () => {
  const [config, setConfig] = useState({
    suhu_normal_min: 28,
    suhu_normal_max: 32,
    suhu_kritis_rendah: 25,
    suhu_kritis_tinggi: 35,
    kelembapan_normal_min: 60,
    kelembapan_normal_max: 70,
    kelembapan_kritis_rendah: 50,
    kelembapan_kritis_tinggi: 80,
    amonia_max: 20,
    amonia_kritis: 30,
    bobot_pertumbuhan_min: 100,
    bobot_target: 2000,
    pakan_min: 50,
    minum_min: 100,
    populasi_awal: 1000,
    bobot_awal: 40,
    luas_kandang: 100,
    peternak_id: 2
  });
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedKandang, setSelectedKandang] = useState('');
  const [hasDefault, setHasDefault] = useState(false);
  const [peternaks, setPeternaks] = useState([]);
  const [currentOwnerId, setCurrentOwnerId] = useState(null);

  useEffect(() => {
    fetchFarms();
    const defaultConfig = localStorage.getItem('defaultConfig');
    setHasDefault(!!defaultConfig);
  }, []);

  useEffect(() => {
    if (selectedKandang) {
      fetchConfig(selectedKandang);
    }
  }, [selectedKandang]);

  const fetchFarms = async () => {
    try {
      const response = await adminService.getFarms();
      const data = response.data.data || response.data;
      const farmList = data.farms || data || [];
      setFarms(farmList);
      if (farmList.length > 0 && !selectedKandang) {
        setSelectedKandang(farmList[0].farm_id || farmList[0].id);
      }
    } catch (error) {
      const errorMessage = handleError('KonfigurasiKandang fetchFarms', error);
      console.error(errorMessage);
      // Fallback to mock data when API fails
      const mockFarms = [
        { id: 1, farm_id: 1, name: 'Kandang A - Brebes', farm_name: 'Kandang A - Brebes' },
        { id: 2, farm_id: 2, name: 'Kandang B - Tegal', farm_name: 'Kandang B - Tegal' },
        { id: 3, farm_id: 3, name: 'Kandang C - Pemalang', farm_name: 'Kandang C - Pemalang' }
      ];
      setFarms(mockFarms);
      if (!selectedKandang) {
        setSelectedKandang(mockFarms[0].farm_id);
      }
    }
  };

  const fetchConfig = async (farmId) => {
    try {
      setLoading(true);
      const response = await adminService.getFarmConfig(farmId);

      const farmData = response.data.data || response.data;

      if (farmData && farmData.config) {
        setConfig(farmData.config);
      } else if (farmData && typeof farmData === 'object' && !farmData.config) {
        // Data is the config itself
        setConfig(farmData);
      }

      // Get owner_id from selected farm
      const selectedFarm = farms.find(f => (f.farm_id || f.id) === parseInt(farmId));
      if (selectedFarm && selectedFarm.owner_id) {
        setCurrentOwnerId(selectedFarm.owner_id);
        fetchPeternaks(selectedFarm.owner_id);
      }
    } catch (error) {
      const errorMessage = handleError('KonfigurasiKandang fetchConfig', error);
      // Keep default config when API fails (already in state)
    } finally {
      setLoading(false);
    }
  };

  const fetchPeternaks = async (ownerId) => {
    try {
      const response = await adminService.getPeternaks(ownerId);
      const data = response.data.data || response.data;
      setPeternaks(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage = handleError('KonfigurasiKandang fetchPeternaks', error);
      console.error(errorMessage);
      setPeternaks([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!hasDefault) {
      localStorage.setItem('defaultConfig', JSON.stringify(config));
      setHasDefault(true);
    }

    try {
      const response = await adminService.updateFarmConfig(selectedKandang, config);

      setModalMessage('Konfigurasi berhasil disimpan!');
      setShowSuccessModal(true);

      // Refresh config after save
      await fetchConfig(selectedKandang);
    } catch (error) {
      const errorMessage = handleError('KonfigurasiKandang handleSubmit', error);
      alert('Gagal menyimpan konfigurasi: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await adminService.resetFarmConfig(selectedKandang);

      setModalMessage('Konfigurasi berhasil direset ke default!');
      setShowResetModal(false);
      setShowSuccessModal(true);

      // Refresh config after reset
      await fetchConfig(selectedKandang);
    } catch (error) {
      const errorMessage = handleError('KonfigurasiKandang handleReset', error);
      alert('Gagal reset konfigurasi: ' + errorMessage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarAdmin /><SidebarAdmin />
        <main className="ml-48 pt-16 px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAdmin /><SidebarAdmin />
      <main className="ml-48 pt-16">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Konfigurasi IoT</h1>
          <p className="text-gray-600 text-sm mt-1 mb-8">Pusat pengaturan konektivitas dan kalibrasi perangkat sensor pada setiap kandang</p>
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Pilih Kandang:</label>
              <select
                value={selectedKandang}
                onChange={(e) => setSelectedKandang(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {farms.map(farm => (
                  <option key={farm.farm_id || farm.id} value={farm.farm_id || farm.id}>
                    {farm.name || farm.farm_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Suhu</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Min Normal (°C)" name="suhu_normal_min" value={config.suhu_normal_min} onChange={handleInputChange} unit="°C" />
                    <InputGroup label="Max Normal (°C)" name="suhu_normal_max" value={config.suhu_normal_max} onChange={handleInputChange} unit="°C" />
                    <InputGroup label="Min Kritis (°C)" name="suhu_kritis_rendah" value={config.suhu_kritis_rendah} onChange={handleInputChange} unit="°C" />
                    <InputGroup label="Max Kritis (°C)" name="suhu_kritis_tinggi" value={config.suhu_kritis_tinggi} onChange={handleInputChange} unit="°C" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Kadar Amonia</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Max Normal (ppm)" name="amonia_max" value={config.amonia_max} onChange={handleInputChange} unit="ppm" />
                    <InputGroup label="Kritis (ppm)" name="amonia_kritis" value={config.amonia_kritis} onChange={handleInputChange} unit="ppm" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Kelembapan</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Min Normal (%)" name="kelembapan_normal_min" value={config.kelembapan_normal_min} onChange={handleInputChange} unit="%" />
                    <InputGroup label="Max Normal (%)" name="kelembapan_normal_max" value={config.kelembapan_normal_max} onChange={handleInputChange} unit="%" />
                    <InputGroup label="Min Kritis (%)" name="kelembapan_kritis_rendah" value={config.kelembapan_kritis_rendah} onChange={handleInputChange} unit="%" />
                    <InputGroup label="Max Kritis (%)" name="kelembapan_kritis_tinggi" value={config.kelembapan_kritis_tinggi} onChange={handleInputChange} unit="%" />
                  </div>
                </div>

                

              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                disabled={!hasDefault}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Reset ke Default
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-400"
              >
                {saving ? 'Menyimpan...' : 'Simpan ke Konfigurasi'}
              </button>
            </div>
          </form>

          {showResetModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Konfirmasi Reset</h3>
                <p className="text-gray-600 mb-6">Apakah Anda yakin ingin mereset semua konfigurasi ke nilai default?</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowResetModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
                  <button onClick={handleReset}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Reset</button>
                </div>
              </div>
            </div>
          )}

          {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Berhasil!</h3>
                <p className="text-gray-600 mb-6">{modalMessage}</p>
                <button onClick={() => setShowSuccessModal(false)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">OK</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default KonfigurasiKandang;
