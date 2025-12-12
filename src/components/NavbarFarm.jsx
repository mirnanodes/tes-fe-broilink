import React, { useState, useEffect } from 'react';
import peternakService from '../services/peternakService';

export default function NavbarFarm() {
  const [profileData, setProfileData] = useState({
    name: '-',
    owner_name: '-',
    farm_name: '-'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await peternakService.getProfile();
        const data = response.data?.data || response.data || {};

        setProfileData({
          name: data.name || '-',
          owner_name: data.owner_name || '-',
          farm_name: data.farm_assigned || '-'
        });
      } catch (error) {
        console.error('Failed to fetch profile for navbar', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="flex justify-end items-center p-4 border-b bg-white shadow-sm">
      <div className="text-right">
        <p className="font-medium">{profileData.name}</p>
        <p className="text-sm text-gray-500">Owner: {profileData.owner_name}</p>
      </div>
      <div className="w-10 h-10 ml-4 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-600">👤</span>
      </div>
    </div>
  );
}
