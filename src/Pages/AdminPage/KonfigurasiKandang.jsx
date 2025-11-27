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
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
        alert('Please select a CSV file');
        e.target.value = '';
        return;
      }
      setCsvFile(file);
      setUploadResult(null);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first');
      return;
    }

    if (!selectedKandang) {
      alert('Please select a kandang first');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const response = await adminService.uploadIotCsv(selectedKandang, csvFile);
      const data = response.data.data || response.data;

      setUploadResult({
        success: true,
        message: response.data.message || 'Upload successful',
        inserted: data.inserted,
        errors: data.errors || [],
        total_rows: data.total_rows
      });

      // Clear file input
      setCsvFile(null);
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      const errorMessage = handleError('KonfigurasiKandang handleCsvUpload', error);
      setUploadResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarAdmin /><SidebarAdmin />
        <main className="ml-48 pt-24 px-8 py-8">
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
      <main className="ml-48 pt-24">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Konfigurasi Kandang</h1>
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

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Pakan</h2>
                  <InputGroup label="Min Normal (gram)" name="pakan_min" value={config.pakan_min} onChange={handleInputChange} unit="g" />
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Populasi Awal</h2>
                  <InputGroup label="Jumlah (ekor)" name="populasi_awal" value={config.populasi_awal} onChange={handleInputChange} unit="ekor" />
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Luas Kandang</h2>
                  <InputGroup label="Luas (m²)" name="luas_kandang" value={config.luas_kandang} onChange={handleInputChange} unit="m²" />
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

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Bobot</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Min/Minggu (g)" name="bobot_pertumbuhan_min" value={config.bobot_pertumbuhan_min} onChange={handleInputChange} unit="g" />
                    <InputGroup label="Target Panen (g)" name="bobot_target" value={config.bobot_target} onChange={handleInputChange} unit="g" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Minum</h2>
                  <InputGroup label="Min Normal (liter)" name="minum_min" value={config.minum_min} onChange={handleInputChange} unit="L" />
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Bobot Rata-rata Awal</h2>
                  <InputGroup label="Bobot (gram)" name="bobot_awal" value={config.bobot_awal || ''} onChange={handleInputChange} unit="g" />
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Peternak Penanggung Jawab</h2>
                  {peternaks.length > 0 ? (
                    <div className="space-y-3">
                      {peternaks.map((peternak, index) => (
                        <div key={peternak.user_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {peternak.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{peternak.name}</p>
                            <p className="text-xs text-gray-500 truncate">{peternak.email}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Aktif
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Belum ada peternak yang ditugaskan</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Data IoT (CSV)</h2>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-cyan-500 transition-colors">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="text-center">
                          <label htmlFor="csv-file-input" className="cursor-pointer">
                            <span className="text-sm font-medium text-cyan-600 hover:text-cyan-700">Click to upload</span>
                            <span className="text-sm text-gray-500"> or drag and drop</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">CSV file with headers: timestamp, temperature, humidity, ammonia</p>
                        </div>
                        <input
                          id="csv-file-input"
                          type="file"
                          accept=".csv,text/csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {csvFile && (
                      <div className="flex items-center gap-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                        <svg className="w-8 h-8 text-cyan-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{csvFile.name}</p>
                          <p className="text-xs text-gray-500">{(csvFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button
                          onClick={() => {
                            setCsvFile(null);
                            const fileInput = document.getElementById('csv-file-input');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleCsvUpload}
                      disabled={!csvFile || uploading}
                      className="w-full px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload CSV</span>
                        </>
                      )}
                    </button>

                    {uploadResult && (
                      <div className={`p-4 rounded-lg border ${uploadResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start gap-3">
                          {uploadResult.success ? (
                            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${uploadResult.success ? 'text-green-900' : 'text-red-900'}`}>
                              {uploadResult.message}
                            </p>
                            {uploadResult.success && (
                              <div className="mt-2 text-xs text-green-800 space-y-1">
                                <p>Total rows: {uploadResult.total_rows}</p>
                                <p>Successfully inserted: {uploadResult.inserted}</p>
                                {uploadResult.errors && uploadResult.errors.length > 0 && (
                                  <div className="mt-2">
                                    <p className="font-medium">Errors found:</p>
                                    <ul className="mt-1 ml-4 list-disc space-y-0.5">
                                      {uploadResult.errors.slice(0, 5).map((error, idx) => (
                                        <li key={idx} className="text-red-700">{error}</li>
                                      ))}
                                      {uploadResult.errors.length > 5 && (
                                        <li className="text-red-700">... and {uploadResult.errors.length - 5} more errors</li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-xs text-blue-800">
                          <p className="font-medium mb-1">Format CSV yang diperlukan:</p>
                          <ul className="ml-4 list-disc space-y-0.5">
                            <li>Header: timestamp, temperature, humidity, ammonia</li>
                            <li>Timestamp format: YYYY-MM-DD HH:MM:SS</li>
                            <li>Temperature: 0-50°C</li>
                            <li>Humidity: 0-100%</li>
                            <li>Ammonia: 0-100 ppm</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
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
