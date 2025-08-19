import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="logo">GeoGuardian</Link>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Your Personal Safety Guardian</h1>
            <p>Real-time Protection at Your Fingertips</p>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
          <div className="hero-visual">
            <div>Interactive Map Animation</div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <h2>Powerful Safety Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Real-time Tracking</h3>
              <p>GPS-powered location monitoring accessible across all devices</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Smart Geofencing</h3>
              <p>Customizable safe zones with automated boundary alerts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚨</div>
              <h3>Emergency SOS</h3>
              <p>Instant alerts to designated guardians with live location</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
