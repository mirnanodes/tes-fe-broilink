import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { handleError } from '../../utils/errorHandler';
import NavbarAdmin from '../../components/NavbarAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';

const DashboardAdmin = () => {
  // Initialize with mock data so UI shows something immediately
  const [stats, setStats] = useState({
    total_owners: 12,
    total_peternak: 45,
    pending_requests: 8,
    recent_requests: [
      {
        id: 1,
        name: 'John Doe',
        role: 'Owner',
        user: { name: 'John Doe', role: { name: 'Owner' } },
        created_at: '2025-11-20T10:30:00Z',
        type: 'Permintaan akses kandang baru',
        request_type: 'Permintaan akses kandang baru'
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'Peternak',
        user: { name: 'Jane Smith', role: { name: 'Peternak' } },
        created_at: '2025-11-20T09:15:00Z',
        type: 'Laporan masalah teknis',
        request_type: 'Laporan masalah teknis'
      },
      {
        id: 3,
        name: 'Ahmad Wijaya',
        role: 'Guest',
        user: { name: 'Ahmad Wijaya', role: { name: 'Guest' } },
        created_at: '2025-11-19T16:45:00Z',
        type: 'Pertanyaan umum sistem',
        request_type: 'Pertanyaan umum sistem'
      }
    ]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await adminService.getDashboard();

      const data = response.data.data || response.data;

      // Only update if API returns valid data
      if (data && (data.summary || data.total_owners !== undefined || data.recent_requests || data.recent)) {
        setStats({
          total_owners: data.summary?.total_owner || data.total_owners || 0,
          total_peternak: data.summary?.total_peternak || data.total_peternak || 0,
          pending_requests: data.summary?.total_guest_requests || data.pending_requests || 0,
          recent_requests: data.recent || data.recent_requests || []
        });
      }
    } catch (error) {
      const errorMessage = handleError('DashboardAdmin fetchData', error);
      // Keep mock data (already in state)
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color = 'blue' }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-600 mb-3 text-center">{title}</h3>
      <p className={`text-4xl font-bold text-${color}-500 text-center`}>{value}</p>
    </div>
  );

  const RequestCard = ({ request }) => {
    const userName = request.username || request.sender_name || 'Guest';
    const roleName = request.role || 'Guest';
    const displayTime = request.time || request.sent_time || '—';
    const requestType = request.request_type || '-';

    return (
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow hover:shadow-lg transition-all">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{userName}</h4>
              <span className="text-xs text-gray-500">{roleName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{displayTime}</span>
            </div>
            <p className="text-sm text-gray-700">{requestType}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarAdmin />
        <SidebarAdmin />
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
      <NavbarAdmin />
      <SidebarAdmin />
      <main className="ml-48 pt-16">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard Admin</h1>
          <p className="text-gray-600 text-sm mt-1 mb-8">Tampilan ringkasan statistik vital dan status operasional sistem secara real-time</p>
          <div className="grid grid-cols-3 gap-8">
            <StatCard title="Total Pengguna Owner" value={stats.total_owners} color="blue" />
            <StatCard title="Total Pengguna Peternak" value={stats.total_peternak} color="blue" />
            <StatCard title="Total Laporan Guest" value={stats.pending_requests} color="blue" />
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Permintaan Terbaru</h2>
              <Link
                to="/admin/requests"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
              >
                Lihat Semua Laporan
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {stats.recent_requests?.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {stats.recent_requests.slice(0, 3).map((request, index) => (
                  <RequestCard key={request.id || index} request={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>Belum ada permintaan terbaru</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
