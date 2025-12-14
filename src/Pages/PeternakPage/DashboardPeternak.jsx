import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Thermometer, Droplet, Wind, Home, Bell } from "lucide-react";
import peternakService from '../../services/peternakService';
import { handleError } from '../../utils/errorHandler';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPeternak() {
  const [chartType, setChartType] = useState({ data1: 'bar', data2: null });
  const [selectedData1, setSelectedData1] = useState('pakan');
  const [selectedData2, setSelectedData2] = useState('');

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [farmName, setFarmName] = useState('');

  const [sensorData, setSensorData] = useState({
    suhu: 0,
    kelembapan: 0,
    amonia: 0,
    statusKandang: 'Normal'
  });

  const [chartData, setChartData] = useState({
    pakan: {
      labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
      data: [0, 0, 0, 0, 0, 0, 0],
      color: '#F59E0B',
      unit: 'Kg',
      yMax: 20,
      interval: 5
    },
    minum: {
      labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
      data: [0, 0, 0, 0, 0, 0, 0],
      color: '#06B6D4',
      unit: 'Liter',
      yMax: 20,
      interval: 5
    },
    bobot: {
      labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
      data: [0, 0, 0, 0, 0, 0, 0],
      color: '#10B981',
      unit: 'Kg',
      yMax: 3.0,
      interval: 0.5
    },
    kematian: {
      labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
      data: [0, 0, 0, 0, 0, 0, 0],
      color: '#EF4444',
      unit: 'Ekor',
      yMax: 10,
      interval: 2
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await peternakService.getDashboard();
      const data = response.data.data || response.data;

      console.log('✅ Peternak Dashboard Data:', data);

      // Update sensor data from current readings
      if (data.current) {
        setSensorData({
          suhu: data.current.temperature || 0,
          kelembapan: data.current.humidity || 0,
          amonia: data.current.ammonia || 0,
          statusKandang: data.current.status || 'Normal'
        });
      }

      // Update farm name
      if (data.farm && data.farm.name) {
        setFarmName(data.farm.name);
      }

      // Update chart data from summary
      if (data.summary) {
        const labels = data.summary.labels || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

        setChartData({
          pakan: {
            labels: labels,
            data: data.summary.pakan || [0, 0, 0, 0, 0, 0, 0],
            color: '#F59E0B',
            unit: 'Kg',
            yMax: 20,
            interval: 5
          },
          minum: {
            labels: labels,
            data: data.summary.minum || [0, 0, 0, 0, 0, 0, 0],
            color: '#06B6D4',
            unit: 'Liter',
            yMax: 20,
            interval: 5
          },
          bobot: {
            labels: labels,
            data: data.summary.bobot || [0, 0, 0, 0, 0, 0, 0],
            color: '#10B981',
            unit: 'Kg',
            yMax: 3.0,
            interval: 0.5
          },
          kematian: {
            labels: labels,
            data: data.summary.kematian || [0, 0, 0, 0, 0, 0, 0],
            color: '#EF4444',
            unit: 'Ekor',
            yMax: 10,
            interval: 2
          }
        });
      }

      setLoading(false);
    } catch (error) {
      const errorMessage = handleError('DashboardPeternak fetchData', error);
      console.error('❌ API ERROR:', errorMessage);
      setApiError(errorMessage);
      setLoading(false);
      // Keep initial state as fallback (already in state)
    }
  };

  const getChartConfig = () => {
    const datasets = [];

    // Data 1
    if (selectedData1) {
      const data1 = chartData[selectedData1];
      datasets.push({
        label: selectedData1.charAt(0).toUpperCase() + selectedData1.slice(1),
        data: data1.data,
        backgroundColor: chartType.data1 === 'bar' ? data1.color : 'transparent',
        borderColor: data1.color,
        borderWidth: 2,
        type: chartType.data1,
        yAxisID: 'y',
        order: chartType.data1 === 'line' ? 1 : 2 
      });
    }

    // Data 2
    if (selectedData2) {
      const data2 = chartData[selectedData2];
      datasets.push({
        label: selectedData2.charAt(0).toUpperCase() + selectedData2.slice(1),
        data: data2.data,
        backgroundColor: chartType.data2 === 'bar' ? data2.color : 'transparent',
        borderColor: data2.color,
        borderWidth: 2,
        type: chartType.data2,
        yAxisID: 'y1',
      });
    }

    // Sorting: Line selalu di atas Bar
    datasets.sort((a, b) => {
      const typePriority = { bar: 0, line: 1 };
      return (typePriority[a.type] || 0) - (typePriority[b.type] || 0);
    });

    const primaryData = chartData[selectedData1];
    const secondaryData = selectedData2 ? chartData[selectedData2] : null;

    return {
      labels: primaryData.labels,
      datasets,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
              grid: {
                  display: false // Hilangkan grid vertikal
              }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            max: primaryData.yMax,
            ticks: {
              stepSize: primaryData.interval
            },
            title: {
              display: true,
              text: primaryData.unit
            },
            grid: {
              drawOnChartArea: false, // HANYA hilangkan garis di dalam grafik
              drawTicks: true,        // TETAP tampilkan garis kecil di sebelah angka
              drawBorder: true        // TETAP tampilkan garis sumbu vertikal
            },
            border: {
                display: true         // Memastikan garis sumbu Y tampil (Chart.js v4+)
            }
          },
          ...(secondaryData && {
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              max: secondaryData.yMax,
              ticks: {
                stepSize: secondaryData.interval
              },
              title: {
                display: true,
                text: secondaryData.unit
              },
              grid: {
                drawOnChartArea: false, // Hilangkan garis horizontal (agar tidak tumpang tindih)
                drawTicks: true,
              },
              border: {
                display: true
              }
            }
          })
        },
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    };
  };

  const config = getChartConfig();

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Peternak</h1>
      <p className="text-gray-600 text-sm mt-1 mb-8">Pusat visual pemantauan status dan tren operasional peternakan</p>

      {/* Error Alert */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Gagal Memuat Data dari Backend</h3>
              <p className="text-sm text-red-700 mt-1">{apiError}</p>
              <p className="text-xs text-red-600 mt-2">Data ditampilkan dengan nilai default.</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Aktifkan Notifikasi */}
      <div className="flex justify-end mt-6">
        <a 
          href="https://t.me/Broilink_bot" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          title="Aktifkan Notifikasi Status Kandang"
        >
          <Bell size={20} />
          <span>Aktifkan Notifikasi</span>
        </a>
      </div>

      {/* 5 Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Temperature Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                    <Thermometer size={30} />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Suhu Aktual</span>
                    <span className="block text-2xl font-bold text-gray-900">{sensorData.suhu}°C</span>
                  </div>
                </div>
              </div>
      
              {/* Humidity Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Droplet size={30} />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Kelembapan Aktual</span>
                    <span className="block text-2xl font-bold text-gray-900">{sensorData.kelembapan}%</span>
                  </div>
                </div>
              </div>
      
              {/* Ammonia Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Wind size={30} />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Kadar Amonia</span>
                    <span className="block text-2xl font-bold text-gray-900">{sensorData.amonia} ppm</span>
                  </div>
                </div>
              </div>
      
              {/* Status Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-black">
                    <Home size={30} />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Status Kandang</span>
                    <span className="inline-block mt-1 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">{sensorData.statusKandang}</span>
                  </div>
                </div>
              </div>
            </div>

      {/* Chart Card */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-gray-900">Ringkasan Laporan (7 Hari Terakhir)</h2>
        </div>

        {/* Kontrol Filter (Di Bawah Judul) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 pb-6 border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Data 1 (Batang):</label>
            <select
              value={selectedData1}
              onChange={(e) => setSelectedData1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pakan">Konsumsi Pakan</option>
              <option value="minum">Konsumsi Minum</option>
              <option value="bobot">Rata-rata Bobot</option>
              <option value="kematian">Jumlah Kematian</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Data 2 (Garis):</label>
            <select
              value={selectedData2}
              onChange={(e) => setSelectedData2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tidak Ada</option>
              <option value="pakan">Konsumsi Pakan</option>
              <option value="minum">Konsumsi Minum</option>
              <option value="bobot">Rata-rata Bobot</option>
              <option value="kematian">Jumlah Kematian</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan:</label>
            <div className="flex flex-col gap-2">
              {selectedData1 && (
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded ${
                    selectedData1 === 'pakan' ? 'bg-amber-500' :
                    selectedData1 === 'minum' ? 'bg-cyan-500' :
                    selectedData1 === 'bobot' ? 'bg-emerald-500' :
                    'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">
                    {selectedData1 === 'pakan' && 'Pakan (Kg)'}
                    {selectedData1 === 'minum' && 'Minum (Liter)'}
                    {selectedData1 === 'bobot' && 'Bobot (Kg)'}
                    {selectedData1 === 'kematian' && 'Kematian (Ekor)'}
                  </span>
                </div>
              )}
              {selectedData2 && (
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded ${
                    selectedData2 === 'pakan' ? 'bg-amber-500' :
                    selectedData2 === 'minum' ? 'bg-cyan-500' :
                    selectedData2 === 'bobot' ? 'bg-emerald-500' :
                    'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">
                    {selectedData2 === 'pakan' && 'Pakan (Kg)'}
                    {selectedData2 === 'minum' && 'Minum (Liter)'}
                    {selectedData2 === 'bobot' && 'Bobot (Kg)'}
                    {selectedData2 === 'kematian' && 'Kematian (Ekor)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-96">
          <Line data={config} options={config.options} />
        </div>
        <div className="flex justify-center text-gray-600 mt-2">
           <h2 className="text-sm font-medium">Hari</h2>
        </div>
      </div>
    </div>
  );
}