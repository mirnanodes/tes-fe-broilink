import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import './Login.css';
import logoBroilink from '../assets/image/logo-broilink.png';
import apiService from '../services/apiService';

const ModalBase = ({ title, children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-header">
                <h2>{title}</h2>
                <button className="modal-close-button" onClick={onClose}>
                    &times;
                </button>
            </div>
            <div className="modal-body">
                {children}
            </div>
        </div>
    </div>
);

const ModalSelectProblem = ({ onClose, onSelectProblem }) => (
    <ModalBase title="Laporan Masalah Akun" onClose={onClose}>
        <p className="modal-subtitle">Silahkan pilih masalah yang terjadi pada akun Anda</p>
        <div className="modal-button-group">
            <button className="modal-problem-button" onClick={() => onSelectProblem('Lupa Password')}>
                Lupa Password Akun
            </button>
            <button className="modal-problem-button" onClick={() => onSelectProblem('Masalah Lain')}>
                Masalah Akun Lain
            </button>
        </div>
    </ModalBase>
);

const ModalForgotPassword = ({ onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiService.public.forgotPassword(email);
            if (response.success) {
                onClose();
                onSuccess('Lupa Password');
            }
        } catch (err) {
            if (err.message.includes('404')) {
                setError('Akun tidak ditemukan');
            } else {
                setError('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBase title="Lupa Password Akun" onClose={onClose}>
            <label htmlFor="recovery-email" className="modal-label">Email</label>
            <input
                id="recovery-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modal-input"
                placeholder="Masukkan email Anda"
            />
            {error && <p className="modal-error">{error}</p>}
            <button
                className="modal-action-button primary"
                onClick={handleSubmit}
                disabled={!email || loading}>
                {loading ? 'Mengirim...' : 'Kirim Permintaan'}
            </button>
        </ModalBase>
    );
};

const ModalOtherProblem = ({ onClose, onSuccess }) => {
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [problemType, setProblemType] = useState('Menunggu Detail Login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiService.public.guestReport({
                whatsapp,
                email,
                problem_type: problemType
            });
            if (response.success) {
                onClose();
                onSuccess('Masalah Lain');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBase title="Laporan Masalah Akun Lain" onClose={onClose}>
            <label htmlFor="whatsapp" className="modal-label">Nomor WhatsApp</label>
            <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="modal-input"
                placeholder="Contoh: 081234567890"
            />
            <label htmlFor="email" className="modal-label">Email</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modal-input"
                placeholder="Masukkan email Anda"
            />
            <label htmlFor="problem-type" className="modal-label">Jenis Masalah</label>
            <select
                id="problem-type"
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
                className="modal-select"
            >
                <option value="Menunggu Detail Login">Menunggu Detail Login</option>
                <option value="Masalah Data">Masalah Data</option>
                <option value="Lainnya">Lainnya</option>
            </select>
            {error && <p className="modal-error">{error}</p>}
            <button
                className="modal-action-button primary"
                onClick={handleSubmit}
                disabled={!whatsapp || !email || !problemType || loading}
            >
                {loading ? 'Mengirim...' : 'Kirim Permintaan'}
            </button>
        </ModalBase>
    );
};

const NotificationSuccess = ({ type }) => (
    <div className="notification-success">
        <CheckCircle size={24} color="#38c172" />
        <p>Laporan Berhasil Terkirim</p>
    </div>
);


// --- Komponen Login Utama ---

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State untuk Modal
    const [modalType, setModalType] = useState(null); // null, 'select', 'forgot', 'other'
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiService.auth.login({ username, password });

            if (response.success && response.user) {
                // Set localStorage for authentication
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', response.user.role);
                localStorage.setItem('user', JSON.stringify(response.user));

                // Navigate based on user role
                const role = response.user.role;
                if (role === 'Admin') {
                    navigate('/admin/dashboard');
                } else if (role === 'Owner') {
                    navigate('/owner/dashboard');
                } else if (role === 'Peternak') {
                    navigate('/peternak/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError('Username atau password salah');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleContactAdmin = () => {
        // ADMIN WHATSAPP NUMBER - REPLACE WITH YOUR ACTUAL NUMBER
        const adminWhatsApp = 'YOUR_ADMIN_WHATSAPP_NUMBER'; // TODO: ISI DENGAN NOMOR WHATSAPP ADMIN ANDA (Format: 6281234567890)
        window.open(`https://wa.me/${adminWhatsApp}`, '_blank');
    };

    const openLaporModal = () => {
        setModalType('select');
        setShowSuccess(false);
    };

    const handleSelectProblem = (problem) => {
        if (problem === 'Lupa Password') {
            setModalType('forgot');
        } else if (problem === 'Masalah Lain') {
            setModalType('other');
        }
    };

    const handleReportSuccess = (type) => {
        setModalType(null);
        setShowSuccess(true);
        // Hilangkan notifikasi setelah 3 detik
        setTimeout(() => setShowSuccess(false), 3000); 
    };

    const renderModal = () => {
        switch (modalType) {
            case 'select':
                return <ModalSelectProblem onClose={() => setModalType(null)} onSelectProblem={handleSelectProblem} />;
            case 'forgot':
                return <ModalForgotPassword onClose={() => setModalType(null)} onSuccess={handleReportSuccess} />;
            case 'other':
                return <ModalOtherProblem onClose={() => setModalType(null)} onSuccess={handleReportSuccess} />;
            default:
                return null;
        }
    };

    return (
        <div className="login-container">
            {renderModal()} 
            {showSuccess && <NotificationSuccess />} {/* Notifikasi sukses ditampilkan di atas semua */}

            <div className="login-box">
                {/* Left Section - Login Form */}
                <div className="login-form-side">
                    {/* ... (Konten Selamat Datang, Form Username/Password) ... */}
                    <h1 className="welcome-title">Selamat Datang</h1>
                    <p className="subtitle">Masuk ke akun Broilink Anda</p>
                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Username Field */}
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        {/* Password Field */}
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                        {/* Remember Me */}
                        <div className="remember-me-checkbox">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember">Ingat Saya</label>
                        </div>
                        {/* Error Message */}
                        {error && <p className="login-error">{error}</p>}
                        {/* Submit Button */}
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'Masuk...' : 'Masuk'}
                        </button>
                        {/* Back to Home Button */}
                        <button
                            type="button"
                            onClick={handleBackToHome}
                            className="login-button secondary"
                            style={{ marginTop: '15px' }}
                        >
                            Kembali ke Beranda
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="form-links">
                        <p>
                            Belum Punya Akun?{' '}
                            <a href="#hubungi-admin" onClick={(e) => { e.preventDefault(); handleContactAdmin(); }}>
                                Hubungi Admin
                            </a>
                        </p>
                        <p>
                            Ada Masalah Akun?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); openLaporModal(); }}>
                                Lapor di Sini
                            </a>
                        </p>
                    </div>
                </div>

                {/* Right Section - Product Info (Tidak Berubah) */}
                <div className="product-info-side">
                    <div className="logo">
                        <img
                            src={logoBroilink}
                            alt="Broilink Logo"
                            className="logo-icon"
                        />
                    </div>
                    <p className="tagline">
                        Teknologi pintar untuk peternakan ayam broiler yang lebih efisien dan produktif
                    </p>
                    <ul className="feature-list">
                        <li>
                            <span className="dot dot-green"></span>
                            Monitoring Real-time
                        </li>
                        <li>
                            <span className="dot dot-blue"></span>
                            Analisis Data Cerdas
                        </li>
                        <li>
                            <span className="dot dot-green"></span>
                            Otomasi Kandang
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Login;