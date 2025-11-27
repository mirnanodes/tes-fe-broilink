import React, { useState, useEffect } from 'react';
import ownerService from '../../services/ownerService';
import { handleError } from '../../utils/errorHandler';
import RequestModal from '../../components/RequestModal';

const Dashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('Mortalitas');
  const [selectedFilter2, setSelectedFilter2] = useState('Tidak Ada');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [farmData, setFarmData] = useState({
    name: 'Kandang A',
    status: 'Waspada',
    temp: '35°C'
  });

  const [activities, setActivities] = useState([
    { time: '18.30', activity: 'Update Indikator', detail: 'Kelembapan: 70%', status: 'Normal' },
    { time: '17.56', activity: 'Laporan Minum', detail: 'oleh Budi', status: 'Info' },
    { time: '12.45', activity: 'Laporan Pakan', detail: 'oleh Budi', status: 'Info' },
    { time: '08.00', activity: 'Update Indikator', detail: 'Suhu: 35°C', status: 'Waspada' },
    { time: '07.30', activity: 'Update Indikator', detail: 'Suhu: 35,1°C', status: 'Bahaya' }
  ]);

  const [chartData, setChartData] = useState([
    { time: '00:00', value: 3 },
    { time: '12:00', value: 5 },
    { time: '18:00', value: 2 },
    { time: '06:00', value: 4 },
  ]);

  const [chartData2, setChartData2] = useState([
    { time: '00:00', value: 2 },
    { time: '12:00', value: 4 },
    { time: '18:00', value: 3 },
    { time: '06:00', value: 5 },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedFilter, selectedFilter2]);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    setApiError(null);

    console.log('=== DASHBOARD OWNER: Starting data fetch ===');
    console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    console.log('User:', localStorage.getItem('user'));
    console.log('Selected Filter:', selectedFilter);

    try {
      console.log('Calling ownerService.getDashboard()...');
      const response = await ownerService.getDashboard();

      console.log('✅ API Response received:', response);
      console.log('Response data:', response.data);

      const data = response.data.data || response.data;

      if (data.farms && data.farms.length > 0) {
        const firstFarm = data.farms[0];
        console.log('✅ Setting farm data from API:', firstFarm);
        setFarmData({
          name: firstFarm.farm_name || 'Kandang A',
          status: firstFarm.status || 'normal',
          temp: firstFarm.temperature ? `${firstFarm.temperature}°C` : '-'
        });

        // Fetch analytics data for chart based on selected filter
        if (firstFarm.farm_id) {
          await fetchChartData(firstFarm.farm_id);
        }
      } else {
        console.warn('⚠️ No farms data in API response');
      }

      // API returns 'activities' not 'recent_reports'
      if (data.activities && data.activities.length > 0) {
        const acts = data.activities.map(activity => ({
          time: activity.time || '-',
          activity: activity.type === 'sensor' ? 'Update Indikator' : 'Laporan Manual',
          detail: activity.message || '-',
          status: activity.type === 'sensor' ? 'Normal' : 'Info'
        }));
        console.log('✅ Setting activities from API:', acts);
        setActivities(acts);
      } else {
        console.warn('⚠️ No activities in API response, using mock data');
      }

      setIsLoadingData(false);
    } catch (error) {
      const errorMessage = handleError('DashboardOwner fetchData', error);
      console.error('❌ API ERROR:', errorMessage);
      console.error('Error details:', error);
      console.error('Error response:', error.response);

      setApiError(errorMessage);
      setIsLoadingData(false);

      // Mock data already in state - will be displayed as fallback
      console.log('📊 Using mock data as fallback');
    }
  };

  const fetchChartData = async (farmId) => {
    try {
      console.log('Fetching chart data for farm:', farmId, 'Filter1:', selectedFilter, 'Filter2:', selectedFilter2);
      const response = await ownerService.getAnalytics(farmId, '1day');
      const data = response.data.data || response.data;

      console.log('✅ Analytics data:', data);

      if (data.manual_data && data.manual_data.length > 0) {
        // Map filter to data field
        const filterFieldMap = {
          'Mortalitas': 'jumlah_kematian',
          'Bobot': 'rata_rata_bobot',
          'Pakan': 'konsumsi_pakan',
          'Minum': 'konsumsi_air'
        };

        // Data 1 (Bar chart)
        const selectedField = filterFieldMap[selectedFilter] || 'jumlah_kematian';
        const formattedChartData = data.manual_data.slice(0, 4).map(item => ({
          time: new Date(item.report_date || item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(parseFloat(item[selectedField]) || 0)
        }));

        console.log('✅ Setting chart data 1 (bars):', formattedChartData);
        setChartData(formattedChartData);

        // Data 2 (Line chart) - only if not "Tidak Ada"
        if (selectedFilter2 !== 'Tidak Ada') {
          const selectedField2 = filterFieldMap[selectedFilter2] || 'jumlah_kematian';
          const formattedChartData2 = data.manual_data.slice(0, 4).map(item => ({
            time: new Date(item.report_date || item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(parseFloat(item[selectedField2]) || 0)
          }));

          console.log('✅ Setting chart data 2 (line):', formattedChartData2);
          setChartData2(formattedChartData2);
        }
      } else {
        console.warn('⚠️ No manual_data in analytics');
      }
    } catch (error) {
      console.error('❌ Failed to fetch chart data:', error);
    }
  };

  const handlePengajuan = () => {
    setShowRequestModal(true);
  };

  const getStatusBadgeClass = (status) => {
    const baseClass = "inline-block px-3 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'normal':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'info':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'waspada':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'bahaya':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Owner</h1>
          <p className="text-gray-600 text-sm mt-1">Pantau kondisi semua kandang dan aktivitas peternakan Anda</p>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          onClick={handlePengajuan}
        >
          <span className="text-xl font-semibold">+</span>
          Pengajuan Permintaan
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Kondisi Kandang Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kondisi Kandang</h2>
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto mb-4">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="40" fill="#FFD700"/>
                <path d="M40 18 L60 58 L20 58 Z" fill="#fff"/>
                <path d="M38 32 L42 32 L41.5 45 L38.5 45 Z" fill="#FFD700"/>
                <circle cx="40" cy="50" r="2.5" fill="#FFD700"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{farmData.name}</h3>
            <p className="text-base font-semibold text-amber-500 mb-1">{farmData.status}</p>
            <p className="text-2xl font-bold text-red-500">{farmData.temp}</p>
          </div>
        </div>

        {/* Analisis Laporan Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Analisis Laporan (Terbaru)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Data 1 (Batang):</label>
                <select
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option>Mortalitas</option>
                  <option>Bobot</option>
                  <option>Pakan</option>
                  <option>Minum</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Data 2 (Garis):</label>
                <select
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFilter2}
                  onChange={(e) => setSelectedFilter2(e.target.value)}
                >
                  <option>Mortalitas</option>
                  <option>Bobot</option>
                  <option>Pakan</option>
                  <option>Minum</option>
                  <option>Tidak Ada</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-4 h-72">
            {/* Y Axis */}
            <div className="flex flex-col justify-between text-sm text-gray-600 py-4">
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            {/* Chart Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-end gap-8 p-4 border-l-2 border-b-2 border-gray-300 relative">
                {/* Bar Chart */}
                {chartData.map((data, index) => {
                  const barColor = selectedFilter === 'Mortalitas' ? 'from-red-500 to-red-400' :
                                   selectedFilter === 'Bobot' ? 'from-green-500 to-green-400' :
                                   selectedFilter === 'Pakan' ? 'from-orange-500 to-orange-400' :
                                   'from-blue-500 to-blue-400';

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={`w-full bg-gradient-to-t ${barColor} rounded-t min-h-[20px] flex items-start justify-center pt-1`}
                        style={{ height: `${(data.value / 6) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{data.value}</span>
                      </div>
                      <span className="text-xs text-gray-600">{data.time}</span>
                    </div>
                  );
                })}

                {/* Line Chart Overlay - only if data2 is not "Tidak Ada" */}
                {selectedFilter2 !== 'Tidak Ada' && chartData2.length > 0 && chartData.length > 0 && (
                  <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    {/* Draw line */}
                    <polyline
                      points={chartData2.map((data, index) => {
                        const totalBars = chartData.length;
                        const barWidth = 100 / totalBars;
                        const x = (index * barWidth) + (barWidth / 2);
                        const y = 100 - ((data.value / 6) * 100);
                        return `${x}%,${y}%`;
                      }).join(' ')}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      filter="url(#shadow)"
                    />
                    {/* Draw points */}
                    {chartData2.map((data, index) => {
                      const totalBars = chartData.length;
                      const barWidth = 100 / totalBars;
                      const x = (index * barWidth) + (barWidth / 2);
                      const y = 100 - ((data.value / 6) * 100);
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
              <div className="text-center text-sm text-gray-600 font-medium mt-2">Jam</div>
            </div>
            {/* Y Label */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 font-medium transform -rotate-90 whitespace-nowrap">
                {selectedFilter === 'Mortalitas' ? 'Ekor' :
                 selectedFilter === 'Bobot' ? 'Gram' :
                 selectedFilter === 'Pakan' ? 'Kg' :
                 'Liter'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Aktivitas Peternakan Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Peternakan</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktivitas</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-gray-600 text-sm">{activity.time}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900">{activity.activity}</span>
                      <span className="text-sm text-gray-600">{activity.detail}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={getStatusBadgeClass(activity.status)}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRequestModal && (
        <RequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
