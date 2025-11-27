import React, { useState, useEffect } from 'react';
import ownerService from '../../services/ownerService';
import { handleError } from '../../utils/errorHandler';

const Monitoring = () => {
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

  const [chartData, setChartData] = useState([
    { time: '00.00', value: 24 },
    { time: '04.00', value: 24 },
    { time: '08.00', value: 24 },
    { time: '12.00', value: 27 },
    { time: '16.00', value: 27 },
    { time: '20.00', value: 35 }
  ]);

  const [chartData2, setChartData2] = useState([
    { time: '00.00', value: 65 },
    { time: '04.00', value: 70 },
    { time: '08.00', value: 68 },
    { time: '12.00', value: 60 },
    { time: '16.00', value: 75 },
    { time: '20.00', value: 72 }
  ]);

  const [selectedFarmId, setSelectedFarmId] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [maxValue, setMaxValue] = useState(40);
  const [maxValue2, setMaxValue2] = useState(100);

  useEffect(() => {
    fetchMonitoringData();
  }, [filters.timeRange, selectedFarmId, filters.data1, filters.data2]);

  const fetchMonitoringData = async () => {
    setIsLoadingData(true);
    setApiError(null);

    console.log('=== MONITORING: Starting data fetch ===');
    console.log('Farm ID:', selectedFarmId);
    console.log('Time Range:', filters.timeRange);
    console.log('Selected Data:', filters.data1);

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

      console.log('✅ Monitoring Data:', data);

      if (data.current) {
        setSensorData({
          temperature: data.current.temperature || 35,
          humidity: data.current.humidity || 75,
          ammonia: data.current.ammonia || 18,
          status: data.current.status || 'Bahaya'
        });
      }

      if (data.historical && data.historical.length > 0) {
        // Map data field based on selection
        const dataFieldMap = {
          'Suhu Aktual': 'temperature',
          'Kelembapan Aktual': 'humidity',
          'Kadar Amonia': 'ammonia'
        };

        // Data 1 (Bar chart)
        const selectedField = dataFieldMap[filters.data1] || 'temperature';
        const formattedData = data.historical.map(item => ({
          time: item.timestamp || item.created_at,
          value: parseFloat(item[selectedField]) || 0
        }));

        console.log('✅ Setting chart data 1:', formattedData);
        setChartData(formattedData);

        // Calculate max value dynamically based on data type
        const maxVal = Math.max(...formattedData.map(d => d.value));
        let calculatedMax = Math.ceil(maxVal * 1.2); // 20% buffer

        // Set minimum max values based on data type
        if (selectedField === 'temperature' && calculatedMax < 40) calculatedMax = 40;
        if (selectedField === 'humidity' && calculatedMax < 100) calculatedMax = 100;
        if (selectedField === 'ammonia' && calculatedMax < 30) calculatedMax = 30;

        setMaxValue(calculatedMax);

        // Data 2 (Line chart)
        if (filters.data2 !== 'Tidak Ada') {
          const selectedField2 = dataFieldMap[filters.data2] || 'temperature';
          const formattedData2 = data.historical.map(item => ({
            time: item.timestamp || item.created_at,
            value: parseFloat(item[selectedField2]) || 0
          }));

          console.log('✅ Setting chart data 2:', formattedData2);
          setChartData2(formattedData2);

          const maxVal2 = Math.max(...formattedData2.map(d => d.value));
          let calculatedMax2 = Math.ceil(maxVal2 * 1.2);

          if (selectedField2 === 'temperature' && calculatedMax2 < 40) calculatedMax2 = 40;
          if (selectedField2 === 'humidity' && calculatedMax2 < 100) calculatedMax2 = 100;
          if (selectedField2 === 'ammonia' && calculatedMax2 < 30) calculatedMax2 = 30;

          setMaxValue2(calculatedMax2);
        }
      }

      setIsLoadingData(false);
    } catch (error) {
      const errorMessage = handleError('Monitoring fetchData', error);
      console.error('❌ API ERROR:', errorMessage);

      setApiError(errorMessage);
      setIsLoadingData(false);

      // Fallback to mock data - already in state
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
        <h1 className="text-3xl font-bold text-gray-900">Monitoring Detail Peternakan</h1>
        <p className="text-gray-600 text-sm mt-1">Pantau kondisi vital kandang Anda secara real-time</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Temperature Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 5c-2.21 0-4 1.79-4 4v12.17c-1.79 1.06-3 3-3 5.23 0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.23-1.21-4.17-3-5.23V9c0-2.21-1.79-4-4-4zm0 23c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
              </svg>
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
              <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 5c-6 7-10 12-10 17 0 5.52 4.48 10 10 10s10-4.48 10-10c0-5-4-10-10-17zm0 24c-3.31 0-6-2.69-6-6 0-2.5 2-5.5 6-10 4 4.5 6 7.5 6 10 0 3.31-2.69 6-6 6z"/>
              </svg>
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
              <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor">
                <path d="M8 12h4v16H8V12zm10-4h4v20h-4V8zm10 8h4v12h-4V16z"/>
              </svg>
            </div>
            <div>
              <span className="block text-sm text-gray-600">Kadar Amonia</span>
              <span className="block text-2xl font-bold text-gray-900">{sensorData.ammonia} ppm</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 5L6 13v8c0 8.84 6.12 17.09 14 19 7.88-1.91 14-10.16 14-19v-8L20 5zm-2 24l-6-6 1.41-1.41L18 26.17l8.59-8.58L28 19l-10 10z"/>
              </svg>
            </div>
            <div>
              <span className="block text-sm text-gray-600">Status Kandang</span>
              <span className="inline-block mt-1 px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                {sensorData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Grafik Data Sensor Kandang A</h2>

        {/* Chart Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 pb-6 border-b border-gray-200">
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
              <option>Suhu Aktual</option>
              <option>Kelembapan Aktual</option>
              <option>Kadar Amonia</option>
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
                    filters.data1 === 'Suhu Aktual' ? 'bg-orange-500' :
                    filters.data1 === 'Kelembapan Aktual' ? 'bg-blue-500' :
                    'bg-green-500'
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
                  <div className="w-4 h-1 bg-purple-500 rounded"></div>
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

        {/* Chart */}
        <div className="flex gap-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 transform -rotate-90 whitespace-nowrap">
              {filters.data1 === 'Suhu Aktual' && '°C'}
              {filters.data1 === 'Kelembapan Aktual' && '%'}
              {filters.data1 === 'Kadar Amonia' && 'ppm'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex gap-4 h-96">
              {/* Y Axis */}
              <div className="flex flex-col justify-between text-sm text-gray-600 pr-3">
                <span>{maxValue}</span>
                <span>{Math.floor(maxValue * 0.75)}</span>
                <span>{Math.floor(maxValue * 0.5)}</span>
                <span>{Math.floor(maxValue * 0.25)}</span>
                <span>0</span>
              </div>
              {/* Chart Bars */}
              <div className="flex-1 flex items-end justify-around gap-3 border-l-2 border-b-2 border-gray-300 px-5 relative">
                {chartData.map((data, index) => {
                  const barColorClass = filters.data1 === 'Suhu Aktual' ? 'from-orange-400 to-orange-600' :
                                         filters.data1 === 'Kelembapan Aktual' ? 'from-blue-400 to-blue-600' :
                                         'from-green-400 to-green-600';

                  const shadowColor = filters.data1 === 'Suhu Aktual' ? 'shadow-orange-300' :
                                      filters.data1 === 'Kelembapan Aktual' ? 'shadow-blue-300' :
                                      'shadow-green-300';

                  const hoverShadow = filters.data1 === 'Suhu Aktual' ? 'group-hover:shadow-orange-400' :
                                      filters.data1 === 'Kelembapan Aktual' ? 'group-hover:shadow-blue-400' :
                                      'group-hover:shadow-green-400';

                  return (
                    <div key={index} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                      <div
                        className={`w-full max-w-[70px] bg-gradient-to-b ${barColorClass} rounded-t-md relative cursor-pointer transition-all duration-300 group-hover:opacity-85 group-hover:-translate-y-1 shadow-md ${shadowColor} group-hover:shadow-lg ${hoverShadow}`}
                        style={{ height: `${(data.value / maxValue) * 100}%`, minHeight: '8px' }}
                      >
                        <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-900/85 text-white px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          {data.value} {filters.data1 === 'Suhu Aktual' ? '°C' : filters.data1 === 'Kelembapan Aktual' ? '%' : 'ppm'}
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
                      <filter id="monitor-shadow">
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
                      filter="url(#monitor-shadow)"
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
      </div>
    </div>
  );
};

export default Monitoring;
