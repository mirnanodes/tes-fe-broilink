import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, History } from "lucide-react";

const SidebarAdmin = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin/dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { path: "/admin/users", icon: <Users size={18} />, label: "Manajemen Pengguna" },
    { path: "/admin/farms", icon: <Settings size={18} />, label: "Konfigurasi IoT" },
    { path: "/admin/requests", icon: <History size={18} />, label: "Riwayat Laporan" },  
  ];

  return (
    <aside className="w-50 bg-white border-r border-gray-200 h-screen fixed left-0 top-10">
      <nav className="py-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#2DD4BF] bg-[#F0FDFA] border-r-4 border-[#2DD4BF]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarAdmin;
