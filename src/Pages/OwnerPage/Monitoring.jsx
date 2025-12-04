import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Thermometer, Droplet, Wind, Home } from "lucide-react";
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
import ownerService from '../../services/ownerService';
import { handleError } from '../../utils/errorHandler';

// 1. REGISTER CHART COMPONENTS
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

const Monitoring = () => {
  // --- STATE MANAGEMENT ---
  const [filters, setFilters] = useState({
    data1: 'Suhu Aktual',
    data2: 'Tidak Ada',
    timeRange: '1 Hari Terakhir',
    kandang: 'Kandang A'
  });

  const [sensorData, setSensorData] = useState({
    temperature: 35,
    humidity: 75,
    ammonia: 18,
    status: 'Bahaya'
  });

  // State untuk menyimpan data grafik (Array of Objects)
  const [chartData1, setChartData1] = useState([]);
  const [chartData2, setChartData2] = useState([]);
  const [labels, setLabels] = useState([]);

  const [selectedFarmId, setSelectedFarmId] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [apiError, setApiError] = useState(null);
  
  // Max Value untuk scaling sumbu Y (dihitung dinamis)
  const [maxValue1, setMaxValue1] = useState(40);
  const [maxValue2, setMaxValue2] = useState(100);

  // --- HELPER: WARNA & UNIT ---
  const getMetricColor = (metricName) => {
    switch (metricName) {
      case 'Suhu Aktual': return '#F97316'; // Orange
      case 'Kelembapan Aktual': return '#14B8A6'; // Teal
      case 'Kadar Amonia': return '#8B5CF6'; // Ungu
    }
  };

  const getMetricUnit = (metricName) => {
    switch (metricName) {
      case 'Suhu Aktual': return '°C';
      case 'Kelembapan Aktual': return '%';
      case 'Kadar Amonia': return 'ppm';
    }
  };

  // --- API DATA FETCHING ---
  useEffect(() => {
    fetchMonitoringData();
  }, [filters.timeRange, selectedFarmId, filters.data1, filters.data2]);

  const fetchMonitoringData = async () => {
    setIsLoadingData(true);
    setApiError(null);

    try {
      const periodMap = {
        '1 Hari Terakhir': '1day',
        '1 Minggu Terakhir': '1week',
        '1 Bulan Terakhir': '1month',
        '6 Bulan Terakhir': '6months'
      };
      const period = periodMap[filters.timeRange] || '1day';

      const response = await ownerService.getMonitoring(selectedFarmId, period);
      const data = response.data.data || response.data;

      // 1. Update Sensor Data Cards
      if (data.current) {
        setSensorData({
          temperature: data.current.temperature || 0,
          humidity: data.current.humidity || 0,
          ammonia: data.current.ammonia || 0,
          status: data.current.status || 'Normal'
        });
      }

      // 2. Update Chart Data
      if (data.historical && data.historical.length > 0) {
        const dataFieldMap = {
          'Suhu Aktual': 'temperature',
          'Kelembapan Aktual': 'humidity',
          'Kadar Amonia': 'ammonia'
        };

        // Extract Labels (Waktu)
        const newLabels = data.historical.map(item => {
            const date = new Date(item.timestamp || item.created_at);
            return filters.timeRange === '1 Hari Terakhir' 
                ? date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        });
        setLabels(newLabels);

        // Process Data 1
        const field1 = dataFieldMap[filters.data1] || 'temperature';
        const vals1 = data.historical.map(item => parseFloat(item[field1]) || 0);
        setChartData1(vals1);
        
        // Calculate Max 1
        const max1 = Math.max(...vals1);
        setMaxValue1(Math.ceil(max1 * 1.2) || 40);

        // Process Data 2
        if (filters.data2 !== 'Tidak Ada') {
          const field2 = dataFieldMap[filters.data2] || 'temperature';
          const vals2 = data.historical.map(item => parseFloat(item[field2]) || 0);
          setChartData2(vals2);

          // Calculate Max 2
          const max2 = Math.max(...vals2);
          setMaxValue2(Math.ceil(max2 * 1.2) || 40);
        } else {
          setChartData2([]);
        }
      } else {
        setChartData1([]);
        setChartData2([]);
        setLabels([]);
      }

      setIsLoadingData(false);
    } catch (error) {
      const errorMessage = handleError('Monitoring fetchData', error);
      setApiError(errorMessage);
      setIsLoadingData(false);
      
      // Fallback Data (Agar UI tidak kosong saat error)
      setLabels(['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']);
      setChartData1([24, 25, 28, 32, 30, 26]);
      setChartData2([60, 62, 58, 55, 57, 65]);
    }
  };

  const handleExportExcel = async () => {
    try {
        // Implementasi export
        alert("Fitur export sedang diproses...");
    } catch (error) {
        alert("Gagal export");
    }
  };

  // --- CHART CONFIGURATION (Disamakan dengan DiagramAnalisis) ---
  const getChartConfig = () => {
    const datasets = [];

    // DATA 1: SELALU BATANG (BAR)
    if (chartData1.length > 0) {
      const color = getMetricColor(filters.data1);
      datasets.push({
        label: filters.data1,
        data: chartData1,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        type: 'bar',
        yAxisID: 'y',
        order: 2 // Render di belakang
      });
    }

    // DATA 2: SELALU GARIS (LINE)
    if (filters.data2 !== 'Tidak Ada' && chartData2.length > 0) {
      const color = getMetricColor(filters.data2);
      datasets.push({
        label: filters.data2,
        data: chartData2,
        backgroundColor: 'transparent',
        borderColor: color,
        borderWidth: 2,
        type: 'line',
        yAxisID: 'y1',
        pointBackgroundColor: 'white',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 4,
        order: 1 // Render di depan
      });
    }

    // Sorting: Line selalu di atas Bar
    datasets.sort((a, b) => b.order - a.order);

    return {
      labels: labels,
      datasets: datasets,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            type: 'linear', display: true, position: 'left',
            max: maxValue1, // Menggunakan max value dinamis dari data
            title: { display: true, text: getMetricUnit(filters.data1) },
            grid: { display: false }
          },
          ...(filters.data2 !== 'Tidak Ada' && {
            y1: {
              type: 'linear', display: true, position: 'right',
              max: maxValue2, // Menggunakan max value dinamis dari data
              title: { display: true, text: getMetricUnit(filters.data2) },
              grid: { display: false, drawOnChartArea: false }
            }
          })
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { usePointStyle: true, boxWidth: 8 }
          }
        }
      }
    };
  };

  const chartConfig = getChartConfig();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
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
              <p className="text-xs text-red-600 mt-2">📊 Menampilkan data mock sebagai fallback. Periksa console untuk detail error.</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Monitoring Detail Peternakan</h1>
        <p className="text-gray-600 text-sm mt-1">Pantau kondisi vital kandang Anda secara real-time</p>
      </div>

      {/* METRICS GRID (Tetap dipertahankan sesuai permintaan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Temperature Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Thermometer size={30} />
            </div>
            <div>
              <span className="block text-sm text-gray-600">Suhu Aktual</span>
              <span className="block text-2xl font-bold text-gray-900">{sensorData.temperature}°C</span>
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
              <span className="block text-2xl font-bold text-gray-900">{sensorData.humidity}%</span>
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
              <span className="block text-2xl font-bold text-gray-900">{sensorData.ammonia}ppm</span>
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
              <span className="inline-block mt-1 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">{sensorData.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- CHART CARD (MODEL BARU) --- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        
        {/* 1. Header Judul Grafik */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Grafik Data Sensor {filters.kandang}
          </h2>
        </div>

        {/* 2. Kontrol Filter (Layout Baru) */}
        
	      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 pb-6 border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Data 1 (Batang):</label>
            <select
              value={filters.data1}
              onChange={(e) => setFilters({...filters, data1: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Suhu Aktual</option>
              <option>Kelembapan Aktual</option>
              <option>Kadar Amonia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Data 2 (Garis):</label>
            <select
              value={filters.data2}
              onChange={(e) => setFilters({...filters, data2: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Tidak Ada</option>
              <option>Suhu Aktual</option>
              <option>Kelembapan Aktual</option>
              <option>Kadar Amonia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jangka Waktu:</label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>1 Hari Terakhir</option>
              <option>1 Minggu Terakhir</option>
              <option>1 Bulan Terakhir</option>
              <option>6 Bulan Terakhir</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kandang:</label>
            <select
              value={filters.kandang}
              onChange={(e) => setFilters({...filters, kandang: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Kandang A</option>
              <option>Kandang B</option>
              <option>Kandang C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan:</label>
            <div className="flex flex-col gap-2">
              {filters.data1 !== 'Tidak Ada' && (
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded ${
                    filters.data1 === 'Suhu Aktual' ? 'bg-orange-500' :
                    filters.data1 === 'Kelembapan Aktual' ? 'bg-teal-500' :
                    'bg-purple-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">
                    {filters.data1 === 'Suhu Aktual' && 'Suhu (°C)'}
                    {filters.data1 === 'Kelembapan Aktual' && 'Kelembapan (%)'}
                    {filters.data1 === 'Kadar Amonia' && 'Amonia (ppm)'}
                  </span>
                </div>
              )}
              {filters.data2 !== 'Tidak Ada' && (
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded ${
                    filters.data2 === 'Suhu Aktual' ? 'bg-orange-500' :
                    filters.data2 === 'Kelembapan Aktual' ? 'bg-teal-500' :
                    'bg-purple-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">
                    {filters.data2 === 'Suhu Aktual' && 'Suhu (°C)'}
                    {filters.data2 === 'Kelembapan Aktual' && 'Kelembapan (%)'}
                    {filters.data2 === 'Kadar Amonia' && 'Amonia (ppm)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Canvas Grafik */}
        <div className="h-96 w-full relative">
          {isLoadingData ? (
            <div className="flex items-center justify-center h-full text-gray-400">Loading data...</div>
          ) : (
            <Line data={chartConfig} options={chartConfig.options} />
          )}
        </div>

        {/* Label Sumbu X */}
        <div className="flex justify-center text-gray-600 mt-2">
           <h2 className="text-sm font-medium">
             {filters.timeRange === '1 Hari Terakhir' ? 'Jam' : 'Tanggal'}
           </h2>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;  