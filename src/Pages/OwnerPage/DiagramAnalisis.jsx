import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Download } from 'lucide-react';
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

const DiagramAnalisis = () => {
  // --- STATE MANAGEMENT ---
  const [filters, setFilters] = useState({
    data1: 'Konsumsi Pakan',
    data2: 'Tidak Ada',
    timeRange: '1 Hari Terakhir',
    kandang: 'Kandang A'
  });

  // Default Mock Data (sebagai placeholder sebelum API load)
  const [chartData1, setChartData1] = useState([]);
  const [chartData2, setChartData2] = useState([]);
  const [labels, setLabels] = useState([]);

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [apiError, setApiError] = useState(null);

  // --- HELPER: WARNA CHART BERDASARKAN METRIK ---
  const getMetricColor = (metricName) => {
    switch (metricName) {
      case 'Konsumsi Pakan': return '#F59E0B'; // Amber
      case 'Konsumsi Minum': return '#06B6D4'; // Cyan
      case 'Rata-rata Bobot': return '#10B981'; // Emerald
      case 'Jumlah Kematian': return '#EF4444'; // Red
      default: return '#9CA3AF'; // Gray
    }
  };

  const getMetricUnit = (metricName) => {
    switch (metricName) {
      case 'Konsumsi Pakan': return 'Kg';
      case 'Konsumsi Minum': return 'Liter';
      case 'Rata-rata Bobot': return 'Gram'; 
      case 'Jumlah Kematian': return 'Ekor';
      default: return '';
    }
  };

  // --- FETCH FARMS ON MOUNT ---
  useEffect(() => {
    fetchFarmList();
  }, []);

  // --- API DATA FETCHING ---
  useEffect(() => {
    if (selectedFarmId) {
      fetchAnalyticsData();
    }
  }, [filters.timeRange, selectedFarmId, filters.data1, filters.data2]);

  const fetchFarmList = async () => {
    try {
      const response = await ownerService.getDashboard();
      const farmList = response.data.data.farms || [];

      setFarms(farmList);

      // Auto-select first farm
      if (farmList.length > 0 && !selectedFarmId) {
        setSelectedFarmId(farmList[0].farm_id);
        setFilters(prev => ({ ...prev, kandang: farmList[0].farm_name }));
      }
    } catch (error) {
      console.error('Failed to fetch farms:', error);
      // Keep using mock data if farms fetch fails
    }
  };

  const fetchAnalyticsData = async () => {
    setIsLoadingData(true);
    setApiError(null);

    try {
      const periodMap = {
        '1 Hari Terakhir': '1day',
        '1 Minggu Terakhir': '1week',
        '1 Bulan Terakhir': '1month',
        '6 Bulan Terakhir': '6months'
      };
      const period = periodMap[filters.timeRange] || '1week';

      const response = await ownerService.getAnalytics(selectedFarmId, period);

      // NEW: Handle aggregate API response format
      // Response structure: { labels: [], feed: [], water: [], avg_weight: [], mortality: [], meta: {} }
      const aggregateData = response.data;

      if (aggregateData.labels && aggregateData.labels.length > 0) {
        // Mapping field API - NEW field names from aggregate endpoint
        const dataFieldMap = {
          'Konsumsi Pakan': 'feed',
          'Konsumsi Minum': 'water',
          'Rata-rata Bobot': 'avg_weight',
          'Jumlah Kematian': 'mortality'
        };

        // Set labels directly from aggregate response (already formatted in Indonesian)
        setLabels(aggregateData.labels);

        // Process Data 1
        const field1 = dataFieldMap[filters.data1] || 'feed';
        const data1Values = (aggregateData[field1] || []).map(v => v !== null ? v : 0);
        setChartData1(data1Values);

        // Process Data 2
        if (filters.data2 !== 'Tidak Ada') {
          const field2 = dataFieldMap[filters.data2] || 'feed';
          const data2Values = (aggregateData[field2] || []).map(v => v !== null ? v : 0);
          setChartData2(data2Values);
        } else {
          setChartData2([]);
        }
      } else {
        // Fallback jika kosong
        setChartData1([]);
        setChartData2([]);
        setLabels([]);
      }
      setIsLoadingData(false);
    } catch (error) {
      const errorMessage = handleError('DiagramAnalisis fetchData', error);
      setApiError(errorMessage);
      setIsLoadingData(false);

      // Fallback Data Mock saat Error (Agar tampilan tidak rusak)
      setLabels(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']);
      setChartData1([10, 12, 11, 13, 15, 14, 16]);
      setChartData2([5, 8, 7, 9, 10, 11, 12]);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await ownerService.exportData(selectedFarmId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data-kandang-${selectedFarmId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Gagal export data: ' + handleError('Export', error));
    }
  };

  // --- CHART CONFIGURATION ---
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
        order: 1 // Render di depan (prioritas)
      });
    }

    // Sorting agar Line selalu di atas Bar
    datasets.sort((a, b) => (a.order || 0) - (b.order || 0)); // Ascending: order 1 (Line) first? No, index 0 is bottom.
    // Koreksi: Chart.js render index 0 paling bawah.
    // Kita ingin Bar (order 2) di index 0, Line (order 1) di index 1.
    // Jadi sort DESCENDING based on order value.
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
            title: { display: true, text: getMetricUnit(filters.data1) },
            grid: { display: false }
          },
          ...(filters.data2 !== 'Tidak Ada' && {
            y1: {
              type: 'linear', display: true, position: 'right',
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
      
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analisis Laporan Peternakan</h1>
        <p className="text-gray-600 text-sm mt-1 mb-8">Laporan lengkap dan terperinci mengenai aspek finansial dan operasional</p>
      </div>

      {/* ERROR ALERT */}
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

      {/* --- CHART CARD --- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        
        {/* 1. Header Judul Grafik */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Grafik Analisis Laporan {filters.kandang}
          </h2>
        </div>

        {/* 2. Kontrol Filter (Di Bawah Judul) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 pb-6 border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Data 1 (Batang):</label>
            <select
              value={filters.data1}
              onChange={(e) => setFilters({...filters, data1: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Konsumsi Pakan</option>
              <option>Konsumsi Minum</option>
              <option>Rata-rata Bobot</option>
              <option>Jumlah Kematian</option>
              <option>Tidak Ada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Data 2 (Garis):</label>
            <select
              value={filters.data2}
              onChange={(e) => setFilters({...filters, data2: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Konsumsi Pakan</option>
              <option>Konsumsi Minum</option>
              <option>Rata-rata Bobot</option>
              <option>Jumlah Kematian</option>
              <option>Tidak Ada</option>
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
              value={selectedFarmId || ''}
              onChange={(e) => {
                const farmId = Number(e.target.value);
                setSelectedFarmId(farmId);
                const farm = farms.find(f => f.farm_id === farmId);
                if (farm) {
                  setFilters({...filters, kandang: farm.farm_name});
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {farms.length > 0 ? (
                farms.map(farm => (
                  <option key={farm.farm_id} value={farm.farm_id}>
                    {farm.farm_name}
                  </option>
                ))
              ) : (
                <option>Memuat kandang...</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan:</label>
            <div className="flex flex-col gap-2">
              {filters.data1 !== 'Tidak Ada' && (
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded ${
                    filters.data1 === 'Konsumsi Pakan' ? 'bg-amber-500' :
                    filters.data1 === 'Konsumsi Minum' ? 'bg-cyan-500' :
                    filters.data1 === 'Rata-rata Bobot' ? 'bg-emerald-500' :
                    'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">
                    {filters.data1 === 'Konsumsi Pakan' && 'Pakan (Kg)'}
                    {filters.data1 === 'Konsumsi Minum' && 'Minum (Liter)'}
                    {filters.data1 === 'Rata-rata Bobot' && 'Bobot (Gram)'}
                    {filters.data1 === 'Jumlah Kematian' && 'Kematian (Ekor)'}
                  </span>
                </div>
              )}
              {filters.data2 !== 'Tidak Ada' && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-600">
                    {filters.data2 === 'Konsumsi Pakan' && 'Pakan (Kg)'}
                    {filters.data2 === 'Konsumsi Minum' && 'Minum (Liter)'}
                    {filters.data2 === 'Rata-rata Bobot' && 'Bobot (Gram)'}
                    {filters.data2 === 'Jumlah Kematian' && 'Kematian (Ekor)'}
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
             {filters.timeRange === '1 Hari Terakhir' ? 'Jam' : 'Hari'}
           </h2>
        </div>
      </div>
      {/* Export Button */}
        <div className="flex justify-center mt-6 pt-6">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <Download size={18} />
            Export ke CSV
          </button>
        </div>
    </div>
  );
};

export default DiagramAnalisis;