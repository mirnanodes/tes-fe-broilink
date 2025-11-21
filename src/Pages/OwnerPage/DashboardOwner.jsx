import React, { useState, useEffect } from 'react';
import ownerService from '../../services/ownerService';
import { handleError } from '../../utils/errorHandler';
import RequestModal from '../../components/RequestModal';
import './DashboardOwner.css';

const Dashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('Mortalitas');
  const [showRequestModal, setShowRequestModal] = useState(false);

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await ownerService.getDashboard();
      const data = response.data.data || response.data;

      if (data.farms && data.farms.length > 0) {
        const firstFarm = data.farms[0];
        setFarmData({
          name: firstFarm.farm_name || firstFarm.name,
          status: firstFarm.status || 'Waspada',
          temp: firstFarm.latest_sensor ? `${firstFarm.latest_sensor.temperature}°C` : '35°C'
        });
      }

      if (data.recent_reports && data.recent_reports.length > 0) {
        const acts = data.recent_reports.map(r => ({
          time: new Date(r.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
          activity: 'Laporan Manual',
          detail: `Pakan: ${r.konsumsi_pakan}kg`,
          status: 'Info'
        }));
        setActivities(acts);
      }
    } catch (error) {
      const errorMessage = handleError('DashboardOwner fetchData', error);
      console.error(errorMessage);
      // Mock data already in state - will be displayed automatically
    }
  };

  const handlePengajuan = () => {
    setShowRequestModal(true);
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Owner</h1>
          <p className="subtitle">Pantau kondisi semua kandang dan aktivitas peternakan Anda</p>
        </div>
        <button className="btn-primary" onClick={handlePengajuan}>
          <span className="plus-icon">+</span>
          Pengajuan Permintaan
        </button>
      </div>

      <div className="cards-grid">
        <div className="card kondisi-card">
          <h2 className="card-title">Kondisi Kandang</h2>
          <div className="kandang-status">
            <div className="status-icon-warning">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="40" fill="#FFD700"/>
                <path d="M40 18 L60 58 L20 58 Z" fill="#fff"/>
                <path d="M38 32 L42 32 L41.5 45 L38.5 45 Z" fill="#FFD700"/>
                <circle cx="40" cy="50" r="2.5" fill="#FFD700"/>
              </svg>
            </div>
            <h3 className="kandang-name">{farmData.name}</h3>
            <p className="kandang-condition">{farmData.status}</p>
            <p className="kandang-temp">{farmData.temp}</p>
          </div>
        </div>

        <div className="card analisis-card">
          <div className="card-header-row">
            <h2 className="card-title">Analisis Laporan (Terbaru)</h2>
            <select 
              className="filter-select"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option>Mortalitas</option>
              <option>Bobot</option>
              <option>Pakan</option>
              <option>Minum</option>
            </select>
          </div>
          <div className="chart-container">
            <div className="chart-y-axis">
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            <div className="chart-area">
              <div className="chart-bars">
                {chartData.map((data, index) => (
                  <div key={index} className="bar-group">
                    <div className="bar" style={{ height: `${(data.value / 6) * 100}%` }}>
                      <div className="bar-value">{data.value}</div>
                    </div>
                    <span className="bar-label">{data.time}</span>
                  </div>
                ))}
              </div>
              <div className="chart-x-label">Jam</div>
            </div>
            <div className="chart-y-label">Ekor</div>
          </div>
        </div>
      </div>

      <div className="card activities-card">
        <h2 className="card-title">Aktivitas Peternakan</h2>
        <table className="activities-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Aktivitas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr key={index}>
                <td className="time-cell">{activity.time}</td>
                <td>
                  <div className="activity-cell">
                    <span className="activity-name">{activity.activity}</span>
                    <span className="activity-detail">{activity.detail}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${activity.status.toLowerCase()}`}>
                    {activity.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRequestModal && (
        <RequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
