import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import './index.css';


function App() {
    const [token, setToken] = useState(localStorage.getItem('transitops_token') || null);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loadingApp, setLoadingApp] = useState(true);

    // Unauthenticated view routing: 'home', 'login', or 'signup'
    const [view, setView] = useState('home');
    const [theme, setTheme] = useState(localStorage.getItem('transitops_theme') || 'dark');

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light-mode');
        } else {
            root.classList.remove('light-mode');
        }
        localStorage.setItem('transitops_theme', theme);
    }, [theme]);

    // Validate session token / fetch profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            if (!token) {
                setLoadingApp(false);
                return;
            }
            try {
                const response = await fetch('/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);

                    // Set initial tab based on role
                    if (userData.role === 'Driver') {
                        setActiveTab('trips-manage');
                    } else if (userData.role === 'Safety Officer') {
                        setActiveTab('drivers-manage');
                    } else if (userData.role === 'Financial Analyst') {
                        setActiveTab('expenses');
                    } else {
                        setActiveTab('dashboard');
                    }
                } else {
                    // Token expired or invalid
                    handleLogout();
                }
            } catch (err) {
                console.error('App launch authentication check error:', err);
            } finally {
                setLoadingApp(false);
            }
        };

        loadProfile();
    }, [token]);

    const handleLoginSuccess = ({ user, token }) => {
        localStorage.setItem('transitops_token', token);
        setToken(token);
        setUser(user);

        if (user.role === 'Driver') {
            setActiveTab('trips-manage');
        } else if (user.role === 'Safety Officer') {
            setActiveTab('drivers-manage');
        } else if (user.role === 'Financial Analyst') {
            setActiveTab('expenses');
        } else {
            setActiveTab('dashboard');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('transitops_token');
        setToken(null);
        setUser(null);
        setView('home');
    };

    if (loadingApp) {
        return (
            <div className="login-container">
                <div style={{ color: '#fff', fontSize: '1.2rem', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                    Bootstrapping TransitOps Cloud Client...
                </div>
            </div>
        );
    }

    // If not authenticated, render Home or Login/Signup based on current view state
    if (!token || !user) {
        if (view === 'login') {
            return (
                <Login
                    initialMode="login"
                    onLoginSuccess={handleLoginSuccess}
                    onBackToHome={() => setView('home')}
                />
            );
        }
        if (view === 'signup') {
            return (
                <Login
                    initialMode="signup"
                    onLoginSuccess={handleLoginSuccess}
                    onBackToHome={() => setView('home')}
                />
            );
        }
        return (
            <Home
                onNavigate={(target) => setView(target)}
                theme={theme}
                onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
        );
    }

    // Render correct page client-side based on activeTab state for authenticated users
    const renderContent = () => {
        const fleetManagerAllowedTabs = ['dashboard', 'vehicles', 'maintenance', 'reports'];
        if (user.role === 'Fleet Manager' && !fleetManagerAllowedTabs.includes(activeTab)) {
            return <Dashboard token={token} userRole={user.role} />;
        }

        switch (activeTab) {
            case 'dashboard':
                return <Dashboard token={token} userRole={user.role} />;
            case 'vehicles':
                return <Vehicles token={token} />;
            case 'drivers-manage':
                return <Drivers token={token} userRole={user.role} initialView="manage" />;
            case 'drivers-license':
                return <Drivers token={token} userRole={user.role} initialView="license" />;
            case 'drivers-safety':
                return <Drivers token={token} userRole={user.role} initialView="safety" />;
            case 'drivers':
                return <Drivers token={token} userRole={user.role} />;
            case 'trips-manage':
                return <Trips token={token} initialView="manage" />;
            case 'trips-dispatch':
                return <Trips token={token} initialView="dispatch" />;
            case 'trips-active':
                return <Trips token={token} initialView="active" />;
            case 'trips-history':
                return <Trips token={token} initialView="history" />;
            case 'maintenance':
                return <Maintenance token={token} />;
            case 'expenses':
                return <Expenses token={token} />;
            case 'reports':
                return <Reports token={token} />;
            default:
                return <Dashboard token={token} userRole={user.role} />;
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                onLogout={handleLogout}
            />

            {/* Main Panel Viewport */}
            <main className="main-content-panel">
                <header className="navbar-top">
                    <div className="navbar-search">
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 Smart Transport Operations System</span>
                    </div>
                    <div className="navbar-user-tag">
                        <span className="dot dot-success animate-pulse"></span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                            Logged in as {user.name} ({user.role})
                        </span>
                    </div>
                </header>

                <div className="tab-viewport animate-fade-in">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

export default App;
