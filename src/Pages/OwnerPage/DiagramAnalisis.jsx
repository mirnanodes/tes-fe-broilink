import React, { useState, useEffect } from 'react';
import ownerService from '../../services/ownerService';
import { handleError } from '../../utils/errorHandler';

const DiagramAnalisis = () => {
  const [filters, setFilters] = useState({
    data1: 'Konsumsi Pakan',
    data2: 'Tidak Ada',
    timeRange: '1 Hari Terakhir',
    kandang: 'Kandang A'
  });

  const [chartData, setChartData] = useState([
    { time: '00.00', value: 7 },
    { time: '04.00', value: 14 },
    { time: '08.00', value: 2 },
    { time: '12.00', value: 3 },
    { time: '16.00', value: 14 },
    { time: '20.00', value: 5 }
  ]);

  const [chartData2, setChartData2] = useState([
    { time: '00.00', value: 5 },
    { time: '04.00', value: 10 },
    { time: '08.00', value: 4 },
    { time: '12.00', value: 6 },
    { time: '16.00', value: 12 },
    { time: '20.00', value: 8 }
  ]);

  const [selectedFarmId, setSelectedFarmId] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [maxValue, setMaxValue] = useState(25);
  const [maxValue2, setMaxValue2] = useState(25);

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters.timeRange, selectedFarmId, filters.data1, filters.data2]);

  const fetchAnalyticsData = async () => {
    setIsLoadingData(true);
    setApiError(null);

    console.log('=== DIAGRAM ANALISIS: Starting data fetch ===');
    console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    console.log('Farm ID:', selectedFarmId);
    console.log('Time Range:', filters.timeRange);
    console.log('Selected Data:', filters.data1);

    try {
      const periodMap = {
        '1 Hari Terakhir': '1day',
        '1 Minggu Terakhir': '7days',
        '1 Bulan Terakhir': '30days',
        '6 Bulan Terakhir': '30days'
      };
      const period = periodMap[filters.timeRange] || '7days';

      console.log('Calling ownerService.getAnalytics()...');
      const response = await ownerService.getAnalytics(selectedFarmId, period);

      console.log('✅ API Response received:', response);
      console.log('Response data:', response.data);

      const data = response.data.data || response.data;

      if (data.manual_data && data.manual_data.length > 0) {
        // Map data field based on selection
        const dataFieldMap = {
          'Konsumsi Pakan': 'konsumsi_pakan',
          'Konsumsi Minum': 'konsumsi_air',
          'Rata-rata Bobot': 'rata_rata_bobot',
          'Jumlah Kematian': 'jumlah_kematian'
        };

        // Data 1 (Bar chart)
        const selectedField = dataFieldMap[filters.data1] || 'konsumsi_pakan';
        const formattedData = data.manual_data.map(item => ({
          time: new Date(item.report_date || item.created_at).toLocaleDateString('id-ID', { weekday: 'long' }),
          value: parseFloat(item[selectedField]) || 0
        }));

        console.log('✅ Setting chart data 1 from API:', formattedData);
        setChartData(formattedData);

        // Calculate max value dynamically
        const maxVal = Math.max(...formattedData.map(d => d.value));
        setMaxValue(Math.ceil(maxVal * 1.2) || 25); // 20% buffer

        // Data 2 (Line chart)
        if (filters.data2 !== 'Tidak Ada') {
          const selectedField2 = dataFieldMap[filters.data2] || 'konsumsi_pakan';
          const formattedData2 = data.manual_data.map(item => ({
            time: new Date(item.report_date || item.created_at).toLocaleDateString('id-ID', { weekday: 'long' }),
            value: parseFloat(item[selectedField2]) || 0
          }));

          console.log('✅ Setting chart data 2 from API:', formattedData2);
          setChartData2(formattedData2);

          const maxVal2 = Math.max(...formattedData2.map(d => d.value));
          setMaxValue2(Math.ceil(maxVal2 * 1.2) || 25);
        }
      } else {
        console.warn('⚠️ No manual_data in API response');
      }

      setIsLoadingData(false);
    } catch (error) {
      const errorMessage = handleError('DiagramAnalisis fetchData', error);
      console.error('❌ API ERROR:', errorMessage);
      console.error('Error details:', error);
      console.error('Error response:', error.response);

      setApiError(errorMessage);
      setIsLoadingData(false);

      // Fallback to mock data - already in state
      console.log('📊 Using mock data as fallback');
    }
  };

  const handleExportExcel = async () => {
    try {
      console.log('Exporting data for farm:', selectedFarmId);
      const response = await ownerService.exportData(selectedFarmId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data-kandang-${selectedFarmId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.log('✅ Export successful');
    } catch (error) {
      const errorMessage = handleError('DiagramAnalisis exportData', error);
      console.error('❌ Export error:', errorMessage);
      alert('Gagal export data: ' + errorMessage);
    }
  };

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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analisis Laporan Peternakan</h1>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Grafik Analisis Laporan Kandang A</h2>

        {/* Chart Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 pb-6 border-b border-gray-200">
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
                    filters.data1 === 'Konsumsi Pakan' ? 'bg-orange-500' :
                    filters.data1 === 'Konsumsi Minum' ? 'bg-blue-500' :
                    filters.data1 === 'Rata-rata Bobot' ? 'bg-green-500' :
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

        {/* Chart */}
        <div className="flex gap-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 transform -rotate-90 whitespace-nowrap">
              {filters.data1 === 'Konsumsi Pakan' && 'Kg'}
              {filters.data1 === 'Konsumsi Minum' && 'Liter'}
              {filters.data1 === 'Rata-rata Bobot' && 'Gram'}
              {filters.data1 === 'Jumlah Kematian' && 'Ekor'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex gap-4 h-96">
              {/* Y Axis */}
              <div className="flex flex-col justify-between text-sm text-gray-600 pr-3">
                <span>{maxValue}</span>
                <span>{Math.floor(maxValue * 0.8)}</span>
                <span>{Math.floor(maxValue * 0.6)}</span>
                <span>{Math.floor(maxValue * 0.4)}</span>
                <span>{Math.floor(maxValue * 0.2)}</span>
                <span>0</span>
              </div>
              {/* Chart Bars */}
              <div className="flex-1 flex items-end justify-around gap-3 border-l-2 border-b-2 border-gray-300 px-5 relative">
                {chartData.map((data, index) => {
                  const barColorClass = filters.data1 === 'Konsumsi Pakan' ? 'from-orange-400 to-orange-600' :
                                         filters.data1 === 'Konsumsi Minum' ? 'from-blue-400 to-blue-600' :
                                         filters.data1 === 'Rata-rata Bobot' ? 'from-green-400 to-green-600' :
                                         'from-red-400 to-red-600';

                  const shadowColor = filters.data1 === 'Konsumsi Pakan' ? 'shadow-orange-300' :
                                      filters.data1 === 'Konsumsi Minum' ? 'shadow-blue-300' :
                                      filters.data1 === 'Rata-rata Bobot' ? 'shadow-green-300' :
                                      'shadow-red-300';

                  const hoverShadow = filters.data1 === 'Konsumsi Pakan' ? 'group-hover:shadow-orange-400' :
                                      filters.data1 === 'Konsumsi Minum' ? 'group-hover:shadow-blue-400' :
                                      filters.data1 === 'Rata-rata Bobot' ? 'group-hover:shadow-green-400' :
                                      'group-hover:shadow-red-400';

                  return (
                    <div key={index} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                      <div
                        className={`w-full max-w-[70px] bg-gradient-to-b ${barColorClass} rounded-t-md relative cursor-pointer transition-all duration-300 group-hover:opacity-85 group-hover:-translate-y-1 shadow-md ${shadowColor} group-hover:shadow-lg ${hoverShadow}`}
                        style={{ height: `${(data.value / maxValue) * 100}%`, minHeight: '8px' }}
                      >
                        <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-900/85 text-white px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          {data.value} {filters.data1 === 'Konsumsi Pakan' ? 'kg' : filters.data1 === 'Konsumsi Minum' ? 'L' : filters.data1 === 'Rata-rata Bobot' ? 'g' : 'ekor'}
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{data.time}</span>
                    </div>
                  );
                })}

                {/* Line Chart Overlay - only if data2 is not "Tidak Ada" */}
                {filters.data2 !== 'Tidak Ada' && chartData2.length > 0 && chartData.length > 0 && (
                  <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <filter id="line-shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    {/* Draw line */}
                    <polyline
                      points={chartData2.map((data, index) => {
                        const totalBars = chartData.length;
                        const barWidth = 100 / totalBars;
                        const x = (index * barWidth) + (barWidth / 2);
                        const y = 100 - ((data.value / maxValue2) * 100);
                        return `${x}%,${y}%`;
                      }).join(' ')}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      filter="url(#line-shadow)"
                    />
                    {/* Draw points */}
                    {chartData2.map((data, index) => {
                      const totalBars = chartData.length;
                      const barWidth = 100 / totalBars;
                      const x = (index * barWidth) + (barWidth / 2);
                      const y = 100 - ((data.value / maxValue2) * 100);
                      return (
                        <circle
                          key={index}
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="5"
                          fill="#8b5cf6"
                          stroke="white"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>
            <div className="text-center text-sm font-medium text-gray-700 mt-2">
              {filters.timeRange === '1 Hari Terakhir' && 'Jam'}
              {(filters.timeRange === '1 Minggu Terakhir' || filters.timeRange === '1 Bulan Terakhir') && 'Hari'}
              {filters.timeRange === '6 Bulan Terakhir' && 'Bulan'}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12l-4-4h3V3h2v5h3l-4 4z"/>
              <path d="M3 14h14v3H3v-3z"/>
            </svg>
            Export ke Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagramAnalisis;
