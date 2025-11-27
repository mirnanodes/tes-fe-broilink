import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { handleError } from '../../utils/errorHandler';
import NavbarAdmin from '../../components/NavbarAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';

const ManajemenPengguna = () => {
  // Initialize with mock data
  const [users, setUsers] = useState([
    {
      id: 1,
      user_id: 1,
      username: 'owner1',
      name: 'Ahmad Ridwan',
      email: 'ahmad@example.com',
      phone_number: '+62812-3456-7890',
      role: { id: 2, name: 'Owner' },
      role_id: 2,
      last_login: '2025-11-20T10:00:00Z',
      created_at: '2025-01-15T08:00:00Z'
    },
    {
      id: 2,
      user_id: 2,
      username: 'peternak1',
      name: 'Siti Nurhaliza',
      email: 'siti@example.com',
      phone_number: '+62813-9876-5432',
      role: { id: 3, name: 'Peternak' },
      role_id: 3,
      last_login: '2025-11-19T15:30:00Z',
      created_at: '2025-02-10T09:00:00Z'
    },
    {
      id: 3,
      user_id: 3,
      username: 'owner2',
      name: 'Budi Santoso',
      email: 'budi@example.com',
      phone_number: '+62815-1111-2222',
      role: { id: 2, name: 'Owner' },
      role_id: 2,
      last_login: '2025-11-18T12:00:00Z',
      created_at: '2025-03-05T10:00:00Z'
    },
    {
      id: 4,
      user_id: 4,
      username: 'peternak2',
      name: 'Dewi Lestari',
      email: 'dewi@example.com',
      phone_number: '+62817-3333-4444',
      role: { id: 3, name: 'Peternak' },
      role_id: 3,
      last_login: '2025-11-17T08:45:00Z',
      created_at: '2025-04-12T11:00:00Z'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total: 4, owner: 2, peternak: 2 });
  const [activeTab, setActiveTab] = useState('peternak');
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [owners, setOwners] = useState([
    { id: 1, user_id: 1, name: 'Ahmad Ridwan', email: 'ahmad@example.com' },
    { id: 3, user_id: 3, name: 'Budi Santoso', email: 'budi@example.com' }
  ]);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role_id: '',
    phone_number: '',
    status: 'active',
    farm_id: '',
    owner_id: '',
    farm_name: '',
    location: '',
    farm_area: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchOwners();
  }, [currentPage]);

  const calculateStatus = (lastLogin) => {
    if (!lastLogin) return 'nonaktif';
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffDays = Math.floor((now - loginDate) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 ? 'aktif' : 'nonaktif';
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();

      const data = response.data.data || response.data;

      if (data && Array.isArray(data)) {
        setUsers(data);

        // Calculate stats from users array since API doesn't return stats
        // API returns role as string, not object
        const ownerCount = data.filter(u => u.role === 'Owner').length;
        const peternakCount = data.filter(u => u.role === 'Peternak').length;
        const calculatedStats = {
          total: data.length,
          owner: ownerCount,
          peternak: peternakCount
        };
        setStats(calculatedStats);
      }
    } catch (error) {
      const errorMessage = handleError('ManajemenPengguna fetchUsers', error);
      // Keep mock data (already in state)
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    try {
      const response = await adminService.getUsers(searchQuery);
      const data = response.data.data || response.data;

      if (data && Array.isArray(data)) {
        setUsers(data);

        // Recalculate stats for search results
        const ownerCount = data.filter(u => u.role?.name === 'Owner' || u.role_id === 2).length;
        const peternakCount = data.filter(u => u.role?.name === 'Peternak' || u.role_id === 3).length;
        setStats({
          total: data.length,
          owner: ownerCount,
          peternak: peternakCount
        });
      }
    } catch (error) {
      const errorMessage = handleError('ManajemenPengguna handleSearch', error);
      // Keep current data on search error
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await adminService.getOwners();
      const data = response.data.data || response.data;
      if (data && Array.isArray(data)) {
        setOwners(data);
      }
    } catch (error) {
      const errorMessage = handleError('ManajemenPengguna fetchOwners', error);
      console.error(errorMessage);
      // Keep mock data (already in state)
    }
  };

  const openAddFarmModal = (owner) => {
    setSelectedOwner(owner);
    setShowAddFarmModal(true);
  };

  const handleAddFarm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await adminService.createFarm({
        owner_id: selectedOwner.user_id,
        farm_name: formData.get('farm_name'),
        location: formData.get('location'),
        initial_population: formData.get('initial_population') || null,
        farm_area: formData.get('farm_area') || null,
      });
      alert('Kandang berhasil ditambahkan!');
      setShowAddFarmModal(false);
      setSelectedOwner(null);
    } catch (error) {
      const errorMessage = handleError('ManajemenPengguna handleAddFarm', error);
      alert('Gagal menambah kandang: ' + errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'add') {
        const payload = {
          username: formData.username,
          name: formData.name,
          password: formData.password,
          phone_number: formData.phone_number,
          status: formData.status || 'active',
        };

        if (activeTab === 'owner') {
          payload.role_id = 2;
          payload.email = formData.email;
        } else {
          payload.role_id = 3;
          payload.email = formData.email || `${formData.username}@broilink.com`; // Default email for peternak
        }

        const response = await adminService.createUser(payload);
      } else if (modalType === 'edit') {
        const editPayload = {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number,
        };

        // Only include password if it's not empty
        if (formData.password && formData.password.trim() !== '') {
          editPayload.password = formData.password;
        }

        const response = await adminService.updateUser(selectedUser.user_id, editPayload);
      }

      setShowModal(false);
      fetchUsers();
      resetForm();
      alert('Berhasil!');
    } catch (error) {
      const errorMessage = handleError('ManajemenPengguna handleSubmit', error);
      alert('Gagal: ' + errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteUser(selectedUser.user_id);
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      const errorMessage = handleError('ManajemenPengguna handleDelete', error);
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      role_id: '',
      phone_number: '',
      status: 'active',
      farm_id: '',
      owner_id: '',
      farm_name: '',
      location: '',
      farm_area: '',
    });
    setSelectedUser(null);
    setActiveTab('peternak');
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (user && type === 'edit') {
      setFormData({
        username: user.username || '',
        name: user.name,
        email: user.email,
        password: '',
        role_id: user.role_id,
        phone_number: user.phone_number || '',
        status: user.status || 'active',
        farm_id: user.farm_id || '',
        owner_id: '',
        farm_name: '',
        location: '',
        farm_area: '',
      });
    } else {
      setActiveTab('peternak');
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAdmin />
      <SidebarAdmin />
      <main className="ml-48 pt-24">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>

          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2 text-center">Total Pengguna</h3>
              <p className="text-4xl font-bold text-blue-500 text-center">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2 text-center">Total Pengguna Owner</h3>
              <p className="text-4xl font-bold text-blue-500 text-center">{stats.owner}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2 text-center">Total Pengguna Peternak</h3>
              <p className="text-4xl font-bold text-blue-500 text-center">{stats.peternak}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Daftar Pengguna ({users.length})</h2>

            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cari User</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Masukkan nama atau email pengguna..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cari
                  </button>
                </div>
              </div>
              <button
                onClick={() => openModal('add')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Tambahkan Akun
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal Bergabung</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Login Terakhir</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-12 text-gray-500">
                            <p>Tidak ada data pengguna</p>
                          </td>
                        </tr>
                      ) : (
                        users.slice((currentPage - 1) * 5, currentPage * 5).map((user) => {
                          const status = user.status || calculateStatus(user.last_login);
                          const displayEmail = typeof user.email === 'string' ? user.email : (user.email?.email || '—');
                          const displayName = typeof user.name === 'string' ? user.name : (user.name?.name || '—');
                          const displayRole = typeof user.role === 'string' ? user.role : (user.role?.name || 'N/A');

                          return (
                            <tr key={user.user_id || user.id} className="hover:bg-blue-50 transition-colors">
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">{displayName}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">{displayRole}</td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                  status === 'active' || status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {status === 'active' || status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600">
                                {user.date_joined ? formatDateTime(user.date_joined) : '—'}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600">
                                {user.last_login ? formatDateTime(user.last_login) : '—'}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600">{displayEmail}</td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  {(displayRole === 'Owner') && (
                                    <button
                                      onClick={() => openAddFarmModal(user)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Tambah Kandang"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => openModal('edit', user)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    </svg>
                                  </button>

                                  <button
                                    onClick={() => openModal('delete', user)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Hapus"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
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
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {currentPage + 1}
                  </button>
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                {modalType === 'delete' ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Konfirmasi Penghapusan</h3>
                    <p className="text-gray-600 mb-6">
                      Apakah Anda yakin ingin menghapus akun <strong>{selectedUser?.name}</strong>?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {modalType === 'add' ? 'Tambah Akun Baru' : 'Edit Akun'}
                    </h3>

                    {modalType === 'add' && (
                      <div className="flex gap-2 mb-6 border-b">
                        <button
                          type="button"
                          onClick={() => setActiveTab('peternak')}
                          className={`px-4 py-2 ${activeTab === 'peternak' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'text-gray-500'}`}
                        >
                          Tambahkan Peternak
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('owner')}
                          className={`px-4 py-2 ${activeTab === 'owner' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'text-gray-500'}`}
                        >
                          Tambahkan Owner
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {modalType === 'add' ? (
                        activeTab === 'peternak' ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Peternak</label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nama Lengkap Peternak"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                              <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Username"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                              <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Owner</label>
                              <select
                                value={formData.owner_id}
                                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              >
                                <option value="">Pilih Owner</option>
                                {owners.map(o => (
                                  <option key={o.user_id} value={o.user_id}>{o.name}</option>
                                ))}
                              </select>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Owner</label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nama Lengkap Owner"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                              <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Username"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                              <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kandang (opsional)</label>
                              <input
                                type="text"
                                value={formData.farm_name}
                                onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                                placeholder="Kandang Broiler 1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        )
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                              type="text"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                            <input
                              type="text"
                              value={formData.phone_number}
                              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password (Kosongkan jika tidak ingin mengubah)</label>
                            <input
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                          </div>
                        </>
                      )}
                      <div className="flex gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => { setShowModal(false); resetForm(); }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {modalType === 'add' ? 'Tambah' : 'Simpan'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {showAddFarmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Tambah Kandang untuk: {selectedOwner?.name}
                </h3>

                <form onSubmit={handleAddFarm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kandang</label>
                    <input
                      type="text"
                      name="farm_name"
                      placeholder="Kandang Broiler 1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="Yogyakarta"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Populasi Awal (ekor)</label>
                    <input
                      type="number"
                      name="initial_population"
                      placeholder="1000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Luas Kandang (m²)</label>
                    <input
                      type="number"
                      name="farm_area"
                      placeholder="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => { setShowAddFarmModal(false); setSelectedOwner(null); }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Tambah Kandang
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManajemenPengguna;
