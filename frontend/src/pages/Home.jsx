import React from 'react';

const Home = ({ onNavigate }) => {
    return (
        <div className="landing-page-root">
            {/* Navigation Header */}
            <header className="landing-navbar">
                <div className="landing-nav-logo">
                    <span>📦</span> TransitOps
                </div>
                <div className="landing-nav-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => onNavigate('login')}
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        Sign In
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => onNavigate('signup')}
                    >
                        Register
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero animate-fade-in">
                <h1>Digitized Transport Operations Fleet Management</h1>
                <p>
                    Analyze vehicle ROI, orchestrate real-time dispatches, tracks fuel/expense accounting sheets,
                    and monitor driver licensing compliance within one integrated glassmorphic cloud workstation.
                </p>
                <div className="hero-buttons">
                    <button
                        className="btn btn-primary"
                        onClick={() => onNavigate('signup')}
                        style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}
                    >
                        Get Started Free
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => onNavigate('login')}
                        style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        Enter Workspace ➔
                    </button>
                </div>
            </section>

            {/* Stats Counter Bar Banner */}
            <section className="landing-stats-bar">
                <div className="stats-bar-container">
                    <div className="stat-item">
                        <div className="stat-item-number">50+</div>
                        <div className="stat-item-label">Active Carriers</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-item-number">40K+</div>
                        <div className="stat-item-label">Completed Trips</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-item-number">98.4%</div>
                        <div className="stat-item-label">Fleet Utilization</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-item-number">12.5%</div>
                        <div className="stat-item-label">ROI Increase</div>
                    </div>
                </div>
            </section>

            {/* Features Description Matrix */}
            <section className="landing-features-grid">
                <div className="feature-glass-card">
                    <div className="feature-icon-box">📊</div>
                    <h3>Centralized Dashboard</h3>
                    <p>
                        Review active indicators, dynamic utilization percentages, asset allocations and filters by vehicle type in real-time.
                    </p>
                </div>

                <div className="feature-glass-card">
                    <div className="feature-icon-box">🚚</div>
                    <h3>Smart Dispatches</h3>
                    <p>
                        Configure trip routes, enforce maximum load capacities, and validate driver credentials to prevent dispatch failures.
                    </p>
                </div>

                <div className="feature-glass-card">
                    <div className="feature-icon-box">🔧</div>
                    <h3>Maintenance Sync</h3>
                    <p>
                        Place vehicles in active maintenance. Auto-update status to In Shop and auto-log expense records upon resolution.
                    </p>
                </div>

                <div className="feature-glass-card">
                    <div className="feature-icon-box">👤</div>
                    <h3>Driver Compliance</h3>
                    <p>
                        Monitor safety scores and receive instant warnings about license expirations to ensure regulatory compliance.
                    </p>
                </div>

                <div className="feature-glass-card">
                    <div className="feature-icon-box">💳</div>
                    <h3>Expense Tracker</h3>
                    <p>
                        Record fuel purchases, tolls, and maintenance costs to maintain a comprehensive financial ledger.
                    </p>
                </div>

                <div className="feature-glass-card">
                    <div className="feature-icon-box">📈</div>
                    <h3>Advanced Analytics</h3>
                    <p>
                        Calculate dynamic Return on Investment (ROI) and export complete CSV reports directly from your browser.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} TransitOps Logistics Systems Inc. All rights reserved.</p>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Developed using local MongoDB services, MERN architectures, and modular custom glassmorphism.
                </p>
            </footer>
        </div>
    );
};

export default Home;
