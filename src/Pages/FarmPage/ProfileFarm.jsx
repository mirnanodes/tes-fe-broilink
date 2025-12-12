import React, { useEffect, useState } from 'react';
import peternakService from '../../services/peternakService';
import './ProfileFarm.css';

const ProfileFarm = () => {
  const [profileData, setProfileData] = useState({
    nama: '',
    whatsapp: '',
    email: '',
    owner_name: '',
    farm_assigned: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = () => {
    console.log('Upload photo');
    alert('Fitur upload foto akan diimplementasikan');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await peternakService.getProfile();
        const data = response.data?.data || response.data || {};

        setProfileData({
          nama: data.name || '',
          whatsapp: data.phone_number || '',
          email: data.email || '',
          owner_name: data.owner_name || '-',
          farm_assigned: data.farm_assigned || '-'
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
        alert('Gagal memuat profil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await peternakService.updateProfile({
        name: profileData.nama,
        email: profileData.email,
        phone_number: profileData.whatsapp
      });
      alert('Profil berhasil disimpan!');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Gagal menyimpan profil');
    }
  };

  return (
    <div className="profil-container">
      <div className="profil-header">
        <h1>Profil Saya</h1>
      </div>

      <div className="profil-card">
        <div className="profile-photo-section">
          <div className="profile-photo">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="60" fill="#333"/>
              <circle cx="60" cy="45" r="20" fill="#fff"/>
              <path d="M25 95c0-19.33 15.67-35 35-35s35 15.67 35 35" fill="#fff"/>
            </svg>
          </div>
          <button className="btn-upload-photo" onClick={handlePhotoUpload}>
            Ubah Foto Profile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group-profil">
            <label htmlFor="owner">Owner</label>
            <div className="input-with-icon">
              <input
                type="text"
                id="owner"
                name="owner"
                value={isLoading ? 'Memuat...' : profileData.owner_name}
                disabled
              />
              <span className="input-lock-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 7h-1V5c0-2.76-2.24-5-5-5S4 2.24 4 5v2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM6 5c0-1.65 1.35-3 3-3s3 1.35 3 3v2H6V5zm4 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              </span>
            </div>
          </div>

          <div className="form-group-profil">
            <label htmlFor="farm">Kandang</label>
            <div className="input-with-icon">
              <input
                type="text"
                id="farm"
                name="farm"
                value={isLoading ? 'Memuat...' : profileData.farm_assigned}
                disabled
              />
              <span className="input-lock-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 7h-1V5c0-2.76-2.24-5-5-5S4 2.24 4 5v2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM6 5c0-1.65 1.35-3 3-3s3 1.35 3 3v2H6V5zm4 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              </span>
            </div>
          </div>

          <div className="form-group-profil">
            <label htmlFor="nama">Nama Lengkap</label>
            <div className="input-with-icon">
              <input
                type="text"
                id="nama"
                name="nama"
                value={isLoading ? 'Memuat...' : profileData.nama}
                onChange={handleChange}
                disabled
              />
              <span className="input-lock-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 7h-1V5c0-2.76-2.24-5-5-5S4 2.24 4 5v2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM6 5c0-1.65 1.35-3 3-3s3 1.35 3 3v2H6V5zm4 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              </span>
            </div>
          </div>

          <div className="form-group-profil">
            <label htmlFor="whatsapp">Nomor WhatsApp</label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={profileData.whatsapp}
              onChange={handleChange}
              placeholder="+62 812-xxxx-xxxx"
            />
          </div>

          <div className="form-group-profil">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              placeholder="email@example.com"
            />
          </div>

          <div className="form-actions-profil">
            <button type="submit" className="btn-save-profil">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileFarm;
