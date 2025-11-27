import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Check, Star, ChartSpline } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo">
              <img
                src="src/assets/image/logo-broilink.png"
                className="logo-icon"/>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              {['beranda', 'fitur', 'keunggulan', 'testimoni', 'harga', 'kontak'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="nav-link"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </nav>

            <button
              className="btn-login-desktop"
              onClick={() => navigate('/login')}
            >
              Login
            </button>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="nav-mobile">
              {['beranda', 'fitur', 'keunggulan', 'testimoni', 'harga', 'kontak'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="nav-mobile-link"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
              <button
                className="btn-login-mobile"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            </nav>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="beranda" className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              {/* <div className="hero-badge">
                <Check size={16} className="badge-icon" />
                +35% Efisiensi Peternakan
              </div> */}
              
              <h1 className="hero-title">
                Revolusi Peternakan Ayam dengan Teknologi Cerdas
              </h1>
              
              <p className="hero-subtitle">
                Broilink, solusi terdepan untuk manajemen peternakan ayam broiler yang efisien dan modern.
              </p>

              <ul className="hero-features">
                {[
                  'Monitoring kesehatan ayam secara real-time dengan sensor IoT canggih',
                  'Analisis data mendalam untuk optimasi pakan dan pertumbuhan',
                  'Dashboard intuitif untuk manajemen kandang yang mudah'
                ].map((item, idx) => (
                  <li key={idx} className="hero-feature-item">
                    <Check className="feature-check" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button className="btn-cta">
                Mulai Gabung Sekarang
              </button>
            </div>

            <div className="hero-image-wrapper">
              <div className="hero-image-container">
                <img 
                src="src/assets/image/kandang-ayam-broiler.jpg"
                alt="Peternakan Ayam Modern Broilink" 
                className="hero-image" 
            />
              </div>
              {/* <div className="hero-stat-card">
                <div className="stat-number">2000+</div>
                <div className="stat-label">Peternak Bergabung</div>
              </div> */}
            </div>
          </div>
        </section>

        {/* Fitur Section */}
        <section id="fitur" className="section-fitur">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Fitur</h2>
              <p className="section-description">
                Teknologi terdepan untuk mengelola ayam broiler dengan efisien dan modern
              </p>
            </div>

            <div className="feature-grid">
              {[
                {
                  title: 'Monitoring Real-time',
                  description: 'Pantau kandang dan kesehatan ayam secara real-time dengan sensor IoT terintegrasi',
                  icon: '📈'
                },
                {
                  title: 'Analisis Data Cerdas',
                  description: 'Optimalkan hasil dan efisiensi peternakan dengan analisis AI',
                  icon: '📊'
                },
                {
                  title: 'Sistem Keamanan',
                  description: 'Keamanan data enterprise dengan enkripsi end-to-end dan backup otomatis',
                  icon: '🔒'
                }
              ].map((feature, idx) => (
                <div key={idx} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Keunggulan Section */}
        <section id="keunggulan" className="section-keunggulan">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Keunggulan</h2>
              <p className="section-description">
                Mengapa ribuan peternak memilih Broilink sebagai solusi peternakan mereka
              </p>
            </div>

            <div className="keunggulan-grid">
              {[
                {
                  title: 'Peningkatan Produktivitas',
                  description: 'Tingkatkan produktivitas hingga 35% dengan monitoring otomatis',
                  icon: '🔝'
                },
                {
                  title: 'Efisiensi Waktu',
                  description: 'Hemat hingga 60% waktu operasional dengan otomatisasi dan notifikasi real-time',
                  icon: '🕓'
                },
                {
                  title: 'Dukungan 24/7',
                  description: 'Tim ahli siap mendampingi 24/7 demi suksesnya peternakan Anda',
                  icon: '👥'
                }
              ].map((item, idx) => (
                <div key={idx} className="keunggulan-card">
                  <div className="keunggulan-icon">{item.icon}</div>
                  <h3 className="keunggulan-title">{item.title}</h3>
                  <p className="keunggulan-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimoni Section */}
        <section id="testimoni" className="section-testimoni">
          <div className="section-container">
            <div className="section-header">
                
              <h2 className="section-title">Testimoni</h2>
              <p className="section-description">
                Dengarkan pengalaman nyata dari peternak yang telah merasakan manfaat Broilink
              </p>
            </div>

            <div className="testimoni-grid">
              {[
                {
                  name: 'Budi Setiawan',
                  role: 'Peternak',
                  location: 'Bogor, Jawa Barat',
                  text: 'Broilink bener-bener bikin cara saya ngelola kandang jadi lebih gampang. Karena ada monitoring real-time, masalah bisa cepat ketahuan, dan hasil panen naik sampai 40%. Mantap, highly recommended!'
                },
                {
                  name: 'Muklis Kurniawan',
                  role: 'Owner',
                  location: 'Surabaya, Jawa Timur',
                  text: 'Keren banget platformnya! Supportnya cepat tanggap, dan fitur analisis data bener-bener ngebantu kami optimalkan pakan sekaligus ngurangin biaya operasional sampai 25%. Worth it banget!'
                }
              ].map((testimonial, idx) => (
                <div key={idx} className="testimoni-card">
                  <div className="testimoni-header">
                    <div className="testimoni-avatar">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="testimoni-info">
                      <div className="testimoni-name">{testimonial.name}</div>
                      <div className="testimoni-role">{testimonial.role}</div>
                      <div className="testimoni-location">{testimonial.location}</div>
                    </div>
                  </div>
                  <p className="testimoni-text">"{testimonial.text}"</p>
                  <div className="testimoni-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Harga Section */}
        <section id="harga" className="section-harga">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Harga</h2>
            </div>

            <div className="pricing-grid">
              {[
                {
                  title: 'Starter',
                  subtitle: 'Cocok untuk peternakan kecil',
                  price: 'Rp299K',
                  period: '/bulan',
                  features: [
                    'Monitoring hingga 2 kandang',
                    'Dashboard Dasar',
                    'Laporan Mingguan',
                    'Sensor suhu & kelembapan',
                    'Notifikasi dasar'
                  ],
                  featured: false
                },
                {
                  title: 'Professional',
                  subtitle: 'Cocok untuk peternakan menengah',
                  price: 'Rp588K',
                  period: '/bulan',
                  features: [
                    'Monitoring unlimited kandang',
                    'Dashboard advance dengan AI',
                    'Laporan real-time dengan custom',
                    'Support 24/7 (chat & phone)',
                    'Sensor lengkap + kamera',
                    'Analisis prediktif'
                  ],
                  featured: true
                }
              ].map((plan, idx) => (
                <div
                  key={idx}
                  className={`pricing-card ${plan.featured ? 'featured' : ''}`}
                >
                  {plan.featured && (
                    <div className="featured-badge">
                      <Star size={14} fill="currentColor" />
                      Paling Populer
                    </div>
                  )}
                  
                  <h3 className="pricing-title">{plan.title}</h3>
                  <p className="pricing-subtitle">{plan.subtitle}</p>
                  
                  <div className="pricing-price-wrapper">
                    <span className="pricing-price">{plan.price}</span>
                    <span className="pricing-period">{plan.period}</span>
                  </div>

                  <button className={`pricing-btn ${plan.featured ? 'featured' : ''}`}>
                    Mulai Sekarang
                  </button>

                  <ul className="pricing-features">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="pricing-feature-item">
                        <Check className="pricing-check" size={18} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">Broilink</div>
              <p className="footer-brand-text">
                Solusi peternakan ayam broiler terdepan dengan teknologi IoT dan AI untuk hasil optimal.
              </p>
            </div>

            <div className="footer-links">
              <h4 className="footer-links-title">Produk</h4>
              <ul className="footer-links-list">
                <li><button onClick={() => scrollToSection('fitur')}>Fitur</button></li>
                <li><button onClick={() => scrollToSection('keunggulan')}>Keunggulan</button></li>
                <li><button onClick={() => scrollToSection('harga')}>Harga</button></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4 className="footer-links-title">Perusahaan</h4>
              <ul className="footer-links-list">
                <li><a href="#tentang">Tentang</a></li>
                <li><a href="#karir">Karir</a></li>
                <li><a href="#blog">Blog</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4 className="footer-links-title">Dukungan</h4>
              <ul className="footer-links-list">
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#kontak">Kontak</a></li>
                <li><a href="#status">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-address">
              Jl. Kaliurang No. 567 Sinduadi, Sleman 55281 Yogyakarta, Indonesia
            </p>
            <p className="footer-copyright">© 2025 Broilink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;