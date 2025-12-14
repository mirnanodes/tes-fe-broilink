import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { handleError } from '../../utils/errorHandler';
import NavbarAdmin from '../../components/NavbarAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';

const RiwayatLaporan = () => {
  // Initialize with mock data
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: 'Budi Santoso',
      role: 'Owner',
      user: { name: 'Budi Santoso', role: { name: 'Owner' } },
      phone: '+62812-3456-7890',
      whatsapp: '+62812-3456-7890',
      created_at: '2025-11-20T14:30:00Z',
      request_type: 'Permintaan reset password',
      detail: 'Permintaan reset password',
      status: 'menunggu'
    },
    {
      id: 2,
      name: 'Siti Aminah',
      role: 'Peternak',
      user: { name: 'Siti Aminah', role: { name: 'Peternak' } },
      phone: '+62813-9876-5432',
      whatsapp: '+62813-9876-5432',
      created_at: '2025-11-20T11:15:00Z',
      request_type: 'Laporan error sistem',
      detail: 'Laporan error sistem',
      status: 'diproses'
    },
    {
      id: 3,
      name: 'Andi Wijaya',
      role: 'Owner',
      user: { name: 'Andi Wijaya', role: { name: 'Owner' } },
      phone: '+62815-2468-1357',
      whatsapp: '+62815-2468-1357',
      created_at: '2025-11-19T09:45:00Z',
      request_type: 'Permintaan akses kandang baru',
      detail: 'Permintaan akses kandang baru',
      status: 'selesai'
    },
    {
      id: 4,
      name: 'Dewi Lestari',
      role: 'Peternak',
      user: { name: 'Dewi Lestari', role: { name: 'Peternak' } },
      phone: '+62817-5555-8888',
      whatsapp: '+62817-5555-8888',
      created_at: '2025-11-18T16:20:00Z',
      request_type: 'Pertanyaan teknis',
      detail: 'Pertanyaan teknis',
      status: 'selesai'
    },
    {
      id: 5,
      name: 'Rudi Hartono',
      role: 'Guest',
      user: { name: 'Rudi Hartono', role: { name: 'Guest' } },
      phone: '+62819-1111-2222',
      whatsapp: '+62819-1111-2222',
      created_at: '2025-11-18T10:00:00Z',
      request_type: 'Masalah login',
      detail: 'Masalah login',
      status: 'ditolak'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Terbaru');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [currentPage, filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const sortOrder = filter === 'Terbaru' ? 'newest' : 'oldest';
      const response = await adminService.getRequests(sortOrder, currentPage);

      const data = response.data.data || response.data;

      if (data && Array.isArray(data)) {
        // Filter out Peternak requests (Peternak cannot submit requests)
        const filteredData = data
          .filter(req => req.role !== 'Peternak')
          .map(req => ({
            ...req,
            // Ensure Guest request_type always shows "-"
            request_type: req.role === 'Guest' ? '-' : req.request_type
          }));

        setRequests(filteredData);
      }
    } catch (error) {
      const errorMessage = handleError('RiwayatLaporan fetchRequests', error);
      // Keep mock data (already in state)
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await adminService.updateRequestStatus(requestId, newStatus);
      fetchRequests();
    } catch (error) {
      const errorMessage = handleError('RiwayatLaporan handleStatusUpdate', error);
      alert('Gagal mengupdate status: ' + errorMessage);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Menunggu',
      'approved': 'Disetujui',
      'rejected': 'Ditolak'
    };
    return labels[status.toLowerCase()] || status;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarAdmin /><SidebarAdmin />
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
      <NavbarAdmin /><SidebarAdmin />
      <main className="ml-48 pt-16">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Riwayat Laporan & Permintaan</h1>
          <p className="text-gray-600 text-sm mt-1 mb-8">Log semua permintaan yang dikirimkan oleh pengguna sistem</p>

          <div className="flex justify-end items-center gap-2">
            <span className="text-sm text-gray-600">Urutkan:</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option>Terbaru</option>
                <option>Terlama</option>
              </select>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-end mb-6">
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">WhatsApp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Waktu</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Detail Permintaan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-500">
                        <p>Belum ada laporan</p>
                      </td>
                    </tr>
                  ) : (
                    requests.slice((currentPage - 1) * 5, currentPage * 5).map((log, index) => (
                      <tr key={log.request_id || log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-900">{(currentPage - 1) * 5 + index + 1}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{log.username || log.sender_name || 'Guest'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{log.role || '—'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{log.phone_number || '—'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {log.sent_time ? formatDateTime(log.sent_time) : (log.created_at ? formatDateTime(log.created_at) : '—')}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{log.request_type || '—'}</td>
                        <td className="px-4 py-4">
                          <select
                            value={log.status || 'pending'}
                            onChange={(e) => handleStatusUpdate(log.request_id || log.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-cyan-500 ${getStatusColor(log.status)}`}
                          >
                            <option value="pending">Menunggu</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {currentPage}
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={requests.length < 5}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {currentPage + 1}
              </button>
              <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiwayatLaporan;
