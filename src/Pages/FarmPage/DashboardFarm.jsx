import React, { useState, useEffect } from 'react';
import peternakService from '../../services/peternakService';
import { handleError } from '../../utils/errorHandler';
import './DashboardFarm.css';


const DashboardPeternak = () => {
  const [filters, setFilters] = useState({
    data1: 'Konsumsi Pakan',
    data2: 'Tidak Ada'
  });

  const [sensorData, setSensorData] = useState({
    temperature: 35,
    humidity: 75,
    ammonia: 18,
    status: 'normal'
  });

  const [chartData, setChartData] = useState([
    { day: 'Senin', value: 8 },
    { day: 'Selasa', value: 4 },
    { day: 'Rabu', value: 3 },
    { day: 'Kamis', value: 4 },
    { day: 'Jumat', value: 4 },
    { day: 'Sabtu', value: 7 },
    { day: 'Minggu', value: 7 }
  ]);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [farmName, setFarmName] = useState('');
  const maxValue = 25;

  useEffect(() => {
    fetchDashboardData();
  }, [filters.data1]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await peternakService.getDashboard();
      const data = response.data.data || response.data;

      console.log('✅ Peternak Dashboard Data:', data);

      // Update sensor data
      if (data.current) {
        setSensorData({
          temperature: data.current.temperature || 35,
          humidity: data.current.humidity || 75,
          ammonia: data.current.ammonia || 18,
          status: data.current.status || 'normal'
        });
      }

      // Update farm name
      if (data.farm_name) {
        setFarmName(data.farm_name);
      }

      // Update chart data based on selected filter
      if (data.summary) {
        const dataMap = {
          'Konsumsi Pakan': data.summary.pakan || [],
          'Konsumsi Minum': data.summary.minum || [],
          'Rata-rata Bobot': data.summary.bobot || [],
          'Jumlah Kematian': data.summary.kematian || []
        };

        const selectedData = dataMap[filters.data1] || data.summary.pakan || [];
        const labels = data.summary.labels || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

        const formattedChartData = labels.map((label, index) => ({
          day: label,
          value: selectedData[index] || 0
        }));

        setChartData(formattedChartData);
      }

      setLoading(false);
    } catch (error) {
      const errorMessage = handleError('DashboardPeternak fetchData', error);
      console.error('❌ API ERROR:', errorMessage);
      setApiError(errorMessage);
      setLoading(false);
      // Keep mock data as fallback (already in state)
    }
  };

  return (
    <div className="dashboard-peternak-container">
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
              <p className="text-xs text-red-600 mt-2">📊 Menampilkan data mock sebagai fallback.</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="metrics-grid-peternak">
        <div className="metric-card-peternak">
          <div className="metric-icon-peternak temperature-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
              <path d="M20 5c-2.21 0-4 1.79-4 4v12.17c-1.79 1.06-3 3-3 5.23 0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.23-1.21-4.17-3-5.23V9c0-2.21-1.79-4-4-4zm0 23c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
            </svg>
          </div>
          <div className="metric-info-peternak">
            <span className="metric-label-peternak">Suhu Aktual</span>
            <span className="metric-value-peternak">{sensorData.temperature}°C</span>
          </div>
        </div>

        <div className="metric-card-peternak">
          <div className="metric-icon-peternak humidity-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
              <path d="M20 5c-6 7-10 12-10 17 0 5.52 4.48 10 10 10s10-4.48 10-10c0-5-4-10-10-17zm0 24c-3.31 0-6-2.69-6-6 0-2.5 2-5.5 6-10 4 4.5 6 7.5 6 10 0 3.31-2.69 6-6 6z"/>
            </svg>
          </div>
          <div className="metric-info-peternak">
            <span className="metric-label-peternak">Kelembapan Aktual</span>
            <span className="metric-value-peternak">{sensorData.humidity}%</span>
          </div>
        </div>

        <div className="metric-card-peternak">
          <div className="metric-icon-peternak ammonia-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
              <path d="M8 12h4v16H8V12zm10-4h4v20h-4V8zm10 8h4v12h-4V16z"/>
            </svg>
          </div>
          <div className="metric-info-peternak">
            <span className="metric-label-peternak">Kadar Amonia</span>
            <span className="metric-value-peternak">{sensorData.ammonia} ppm</span>
          </div>
        </div>

        <div className="metric-card-peternak">
          <div className="metric-icon-peternak status-icon">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" fill={sensorData.status === 'normal' ? '#4caf50' : sensorData.status === 'waspada' ? '#ff9800' : '#f44336'}/>
              <path d="M40 22 L26 36 L26 58 L54 58 L54 36 Z" fill={sensorData.status === 'normal' ? '#4caf50' : sensorData.status === 'waspada' ? '#ff9800' : '#f44336'}/>
              <path d="M34 44 L46 44 L46 58 L34 58 Z" fill={sensorData.status === 'normal' ? '#4caf50' : sensorData.status === 'waspada' ? '#ff9800' : '#f44336'}/>
              <path d="M40 16 L20 36 L24 36 L40 20 L56 36 L60 36 Z" fill={sensorData.status === 'normal' ? '#4caf50' : sensorData.status === 'waspada' ? '#ff9800' : '#f44336'}/>
            </svg>
          </div>
          <div className="metric-info-peternak">
            <span className="metric-label-peternak">Status Kandang</span>
            <span className={`status-badge-${sensorData.status === 'normal' ? 'normal' : sensorData.status === 'waspada' ? 'warning' : 'danger'}`}>
              {sensorData.status === 'normal' ? 'Normal' : sensorData.status === 'waspada' ? 'Waspada' : 'Bahaya'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section-peternak">
        <h2 className="section-title-peternak">Ringkasan Laporan (7 Hari Terakhir)</h2>
        
        <div className="chart-filters-peternak">
          <div className="filter-group-peternak">
            <label>Pilih Data 1 (Batang) :</label>
            <select 
              value={filters.data1}
              onChange={(e) => setFilters({...filters, data1: e.target.value})}
            >
              <option>Konsumsi Pakan</option>
              <option>Konsumsi Minum</option>
              <option>Rata-rata Bobot</option>
              <option>Jumlah Kematian</option>
              <option>Tidak Ada</option>
            </select>
          </div>

          <div className="filter-group-peternak">
            <label>Pilih Data 2 (Garis) :</label>
            <select 
              value={filters.data2}
              onChange={(e) => setFilters({...filters, data2: e.target.value})}
            >
              <option>Konsumsi Pakan</option>
              <option>Konsumsi Minum</option>
              <option>Rata-rata Bobot</option>
              <option>Jumlah Kematian</option>
              <option>Tidak Ada</option>
            </select>
          </div>

          <div className="chart-legend-peternak">
            <span className="legend-label-peternak">Keterangan:</span>
            <div className="legend-item-peternak">
              <span className="legend-color-peternak"></span>
              <span>Pakan (kg)</span>
            </div>
          </div>
        </div>

        <div className="chart-wrapper-peternak">
          <div className="chart-y-label-peternak">Kg</div>
          <div className="chart-content-peternak">
            <div className="chart-y-values-peternak">
              <span>25</span>
              <span>20</span>
              <span>15</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
            <div className="chart-bars-wrapper-peternak">
              {chartData.map((data, index) => (
                <div key={index} className="bar-group-peternak">
                  <div 
                    className="bar-peternak"
                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                  >
                    <div className="bar-tooltip-peternak">{data.value} kg</div>
                  </div>
                  <span className="bar-label-peternak">{data.day}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-x-label-peternak">Hari</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPeternak;