import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileInput, User } from "lucide-react";


const SidebarPeternak = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/peternak/dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { path: "/peternak/input", icon: <FileInput size={18} />, label: "Input Hasil Kerja" },
    { path: "/peternak/profile", icon: <User size={18} />, label: " Profil" },
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

export default SidebarPeternak;
