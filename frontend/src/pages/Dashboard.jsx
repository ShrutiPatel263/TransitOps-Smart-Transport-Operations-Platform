import React, { useState, useEffect } from 'react';

const Dashboard = ({ token }) => {
    const [kpis, setKpis] = useState({
        activeVehicles: 0,
        availableVehicles: 0,
        inShopVehicles: 0,
        retiredVehicles: 0,
        activeTrips: 0,
        pendingTrips: 0,
        driversOnDuty: 0,
        fleetUtilization: 0
    });

    const [filterType, setFilterType] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch Dashboard KPIs
    const fetchKPIs = async () => {
        try {
            setLoading(true);
            setError('');
            let url = '/api/reports/kpis';
            if (filterType) url += `?type=${encodeURIComponent(filterType)}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to load KPIs.');
            const data = await response.json();
            setKpis(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKPIs();
    }, [filterType]);

    return (
        <div>
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Operations Dashboard</h1>
                    <p>Real-time vehicle and worker dispatch metrics</p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter Type:</span>
                    <select
                        className="form-control"
                        style={{ width: '160px', padding: '0.5rem' }}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">All Vehicles</option>
                        <option value="Van">Vans</option>
                        <option value="Truck">Trucks</option>
                        <option value="Sedan">Sedans</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="alert-box alert-danger" style={{ marginTop: '1.5rem' }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading Operational KPIs...
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>

                    {/* KPI Cards Grid */}
                    <div className="kpi-grid">
                        <div className="glass-card kpi-card">
                            <div className="kpi-icon-wrapper color-success">🚚</div>
                            <div className="kpi-info">
                                <span className="kpi-label">Active Vehicles</span>
                                <span className="kpi-value">{kpis.activeVehicles}</span>
                            </div>
                        </div>

                        <div className="glass-card kpi-card">
                            <div className="kpi-icon-wrapper color-primary">✅</div>
                            <div className="kpi-info">
                                <span className="kpi-label">Available Vehicles</span>
                                <span className="kpi-value">{kpis.availableVehicles}</span>
                            </div>
                        </div>

                        <div className="glass-card kpi-card">
                            <div className="kpi-icon-wrapper color-warning">🔧</div>
                            <div className="kpi-info">
                                <span className="kpi-label">In Maintenance</span>
                                <span className="kpi-value">{kpis.inShopVehicles}</span>
                            </div>
                        </div>

                        <div className="glass-card kpi-card">
                            <div className="kpi-icon-wrapper color-info">👥</div>
                            <div className="kpi-info">
                                <span className="kpi-label">Drivers On Duty</span>
                                <span className="kpi-value">{kpis.driversOnDuty}</span>
                            </div>
                        </div>
                    </div>

                    <div className="kpi-grid">
                        <div className="glass-card kpi-card">
                            <div className="kpi-icon-wrapper color-primary">🗺️</div>
                            <div className="kpi-info">
                                <span className="kpi-label">Active Trips</span>
                                <span className="kpi-value">{kpis.activeTrips}</span>
                            </div>
                        </div>

                        <div className="glass-card kpi-card">
                            <div className="kpi-icon-wrapper color-warning">⏳</div>
                            <div className="kpi-info">
                                <span className="kpi-label">Pending Trips</span>
                                <span className="kpi-value">{kpis.pendingTrips}</span>
                            </div>
                        </div>

                        <div className="glass-card kpi-card">
                            <div className="kpi-icon-wrapper color-info">📊</div>
                            <div className="kpi-info">
                                <span className="kpi-label">Fleet Utilization</span>
                                <span className="kpi-value">{kpis.fleetUtilization}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Analytics */}
                    <div className="dashboard-layout">
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Fleet Utilization & Asset Allocation</h3>

                            <div className="custom-chart-container">
                                <div className="bar-row">
                                    <span className="bar-label">On Trip</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{ width: `${kpis.fleetUtilization}%`, backgroundColor: '#818cf8' }}
                                        ></div>
                                    </div>
                                    <span className="bar-value">{kpis.fleetUtilization}%</span>
                                </div>

                                <div className="bar-row">
                                    <span className="bar-label">Available</span>
                                    <div className="bar-track">
                                        {/* Calculate available ratio */}
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${kpis.activeVehicles + kpis.availableVehicles + kpis.inShopVehicles > 0
                                                    ? Math.round((kpis.availableVehicles / (kpis.activeVehicles + kpis.availableVehicles + kpis.inShopVehicles)) * 100)
                                                    : 0}%`,
                                                backgroundColor: '#34d399'
                                            }}
                                        ></div>
                                    </div>
                                    <span className="bar-value">
                                        {kpis.activeVehicles + kpis.availableVehicles + kpis.inShopVehicles > 0
                                            ? Math.round((kpis.availableVehicles / (kpis.activeVehicles + kpis.availableVehicles + kpis.inShopVehicles)) * 100)
                                            : 0}%
                                    </span>
                                </div>

                                <div className="bar-row">
                                    <span className="bar-label">In Maintenance</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${kpis.activeVehicles + kpis.availableVehicles + kpis.inShopVehicles > 0
                                                    ? Math.round((kpis.inShopVehicles / (kpis.activeVehicles + kpis.availableVehicles + kpis.inShopVehicles)) * 100)
                                                    : 0}%`,
                                                backgroundColor: '#fbbf24'
                                            }}
                                        ></div>
                                    </div>
                                    <span className="bar-value">
                                        {kpis.activeVehicles + kpis.availableVehicles + kpis.inShopVehicles > 0
                                            ? Math.round((kpis.inShopVehicles / (kpis.activeVehicles + kpis.availableVehicles + kpis.inShopVehicles)) * 100)
                                            : 0}%
                                    </span>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
                                Note: Utilization percentage counts vehicles currently running trips out of all actively managed fleet assets.
                            </p>
                        </div>

                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Active Trips Status</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                                    <span>Dispatched:</span>
                                    <span style={{ fontWeight: 'bold', color: '#818cf8' }}>{kpis.activeTrips}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                                    <span>Drafts (Waiting):</span>
                                    <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{kpis.pendingTrips}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                                    <span>Idle Drivers:</span>
                                    <span style={{ fontWeight: 'bold', color: '#34d399' }}>
                                        {Math.max(0, kpis.driversOnDuty - kpis.activeTrips)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Dashboard;
