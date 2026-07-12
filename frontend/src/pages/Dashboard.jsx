import React, { useState, useEffect } from 'react';

const Dashboard = ({ token, userRole }) => {
    const [kpis, setKpis] = useState({
        activeVehicles: 0,
        availableVehicles: 0,
        inShopVehicles: 0,
        retiredVehicles: 0,
        activeTrips: 0,
        pendingTrips: 0,
        driversOnDuty: 0,
        fleetUtilization: 0,
        totalDrivers: 0,
        availableDrivers: 0,
        driversOnTrip: 0,
        expiredLicenses: 0,
        suspendedDrivers: 0,
        averageSafetyScore: 0
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
            if (filterType && userRole !== 'Safety Officer') {
                url += `?type=${encodeURIComponent(filterType)}`;
            }

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
    }, [filterType, userRole]);

    return (
        <div>
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>{userRole === 'Safety Officer' ? 'Safety Dashboard' : userRole === 'Financial Analyst' ? 'Financial Dashboard' : 'Operations Dashboard'}</h1>
                    <p>{userRole === 'Safety Officer' ? 'Driver safety, compliance, and licensing metrics' : userRole === 'Financial Analyst' ? 'Fleet cash flows, vehicle ROI, and expense tracking metrics' : 'Real-time vehicle and worker dispatch metrics'}</p>
                </div>

                {/* Filters - only show for non-Safety Officer and non-Financial Analyst roles */}
                {userRole !== 'Safety Officer' && userRole !== 'Financial Analyst' && (
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
                )}
            </div>

            {error && (
                <div className="alert-box alert-danger" style={{ marginTop: '1.5rem' }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading {userRole === 'Safety Officer' ? 'Safety' : userRole === 'Financial Analyst' ? 'Financial' : 'Operational'} KPIs...
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>

                    {/* Safety Officer KPIs */}
                    {userRole === 'Safety Officer' && (
                        <div className="kpi-grid">
                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-info">👨</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Total Drivers</span>
                                    <span className="kpi-value">{kpis.totalDrivers}</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-success">✅</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Available Drivers</span>
                                    <span className="kpi-value">{kpis.availableDrivers}</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-primary">🚛</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Drivers On Trip</span>
                                    <span className="kpi-value">{kpis.driversOnTrip}</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-warning">⚠️</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Expired Licenses</span>
                                    <span className="kpi-value">{kpis.expiredLicenses}</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-danger">🚫</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Suspended Drivers</span>
                                    <span className="kpi-value">{kpis.suspendedDrivers}</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-success">⭐</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Avg Safety Score</span>
                                    <span className="kpi-value">{(kpis.averageSafetyScore || 0).toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial Analyst KPIs */}
                    {userRole === 'Financial Analyst' && (
                        <div className="kpi-grid">
                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-danger">⛽</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Total Fuel Cost</span>
                                    <span className="kpi-value">${(kpis.totalFuelCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-primary">💰</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Operational Cost</span>
                                    <span className="kpi-value">${(kpis.operationalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-warning">🔧</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Maintenance Cost</span>
                                    <span className="kpi-value">${(kpis.maintenanceCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-success">📈</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Vehicle ROI</span>
                                    <span className="kpi-value">{(kpis.vehicleRoi * 100 || 0).toFixed(2)}%</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-info">📉</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Fuel Efficiency</span>
                                    <span className="kpi-value">{(kpis.fuelEfficiency || 0).toFixed(2)} km/L</span>
                                </div>
                            </div>

                            <div className="glass-card kpi-card">
                                <div className="kpi-icon-wrapper color-success">💵</div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Total Expenses</span>
                                    <span className="kpi-value">${(kpis.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fleet Manager / Default KPIs */}
                    {userRole !== 'Safety Officer' && userRole !== 'Financial Analyst' && (
                        <>
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
                        </>
                    )}

                    {userRole === 'Financial Analyst' ? (
                        <div className="dashboard-layout">
                            <div className="glass-card">
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Expense Breakdown Distribution</h3>

                                <div className="custom-chart-container">
                                    <div className="bar-row">
                                        <span className="bar-label">Fuel Cost</span>
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${kpis.totalExpenses > 0 ? Math.round((kpis.totalFuelCost / kpis.totalExpenses) * 100) : 0}%`,
                                                    backgroundColor: '#f87171'
                                                }}
                                            ></div>
                                        </div>
                                        <span className="bar-value">
                                            {kpis.totalExpenses > 0 ? Math.round((kpis.totalFuelCost / kpis.totalExpenses) * 100) : 0}%
                                        </span>
                                    </div>

                                    <div className="bar-row">
                                        <span className="bar-label">Maintenance Cost</span>
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${kpis.totalExpenses > 0 ? Math.round((kpis.maintenanceCost / kpis.totalExpenses) * 100) : 0}%`,
                                                    backgroundColor: '#fbbf24'
                                                }}
                                            ></div>
                                        </div>
                                        <span className="bar-value">
                                            {kpis.totalExpenses > 0 ? Math.round((kpis.maintenanceCost / kpis.totalExpenses) * 100) : 0}%
                                        </span>
                                    </div>

                                    <div className="bar-row">
                                        <span className="bar-label">Other Operational Cost</span>
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${kpis.totalExpenses > 0 ? Math.round((kpis.operationalCost / kpis.totalExpenses) * 100) : 0}%`,
                                                    backgroundColor: '#818cf8'
                                                }}
                                            ></div>
                                        </div>
                                        <span className="bar-value">
                                            {kpis.totalExpenses > 0 ? Math.round((kpis.operationalCost / kpis.totalExpenses) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
                                    Note: Breakdown shows the proportion of each expense category relative to the total accumulated expenses.
                                </p>
                            </div>

                            <div className="glass-card">
                                <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Financial Health Summary</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                                        <span>Total Fleet Revenue:</span>
                                        <span style={{ fontWeight: 'bold', color: '#34d399' }}>
                                            ${(kpis.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                                        <span>Total Expenses:</span>
                                        <span style={{ fontWeight: 'bold', color: '#f87171' }}>
                                            ${(kpis.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                                        <span>Net Fleet Profits:</span>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: (kpis.totalRevenue - kpis.totalExpenses) >= 0 ? '#34d399' : '#f87171'
                                        }}>
                                            ${((kpis.totalRevenue || 0) - (kpis.totalExpenses || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
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
                    )}

                </div>
            )}
        </div>
    );
};

export default Dashboard;
