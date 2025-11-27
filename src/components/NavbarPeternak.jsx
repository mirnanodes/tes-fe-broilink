import React, { useState } from 'react';
import authService from '../services/authService';
import broilinkLogo from '../assets/image/logo-broilink.png';

const NavbarPeternak = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = authService.getUser();
  const peternakName = user?.name || 'Peternak';
  const ownerName = localStorage.getItem('ownerName') || '—';

  const handleLogout = async () => {
    await authService.logout();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo - KIRI */}
        <div className="flex items-center gap-3">
          <img src={broilinkLogo} alt="Broilink Logo" className="h-10 w-auto" />
        </div>

        {/* User Info - KANAN */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{peternakName}</p>
              <p className="text-xs text-gray-500">Owner: {ownerName}</p>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{peternakName}</p>
                <p className="text-xs text-gray-500">Owner: {ownerName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavbarPeternak;
