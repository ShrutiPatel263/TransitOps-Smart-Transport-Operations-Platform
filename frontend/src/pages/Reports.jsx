import React, { useState, useEffect } from 'react';

const Reports = ({ token }) => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/reports/fleet', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to retrieve performance reports.');
            const data = await response.json();
            setReportData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleExportCSV = () => {
        if (reportData.length === 0) return;

        // Headers
        const headers = [
            'Registration Number',
            'Vehicle Model',
            'Vehicle Type',
            'Acquisition Cost ($)',
            'Odometer Reading (km)',
            'Total Distance Travelled (km)',
            'Fuel Efficiency (km/L)',
            'Fuel Costs ($)',
            'Maintenance Costs ($)',
            'Other Expenses ($)',
            'Total Operational Cost ($)',
            'Total Revenues ($)',
            'ROI (%)'
        ];

        // Rows
        const rows = reportData.map(v => [
            v.registrationNumber,
            v.model,
            v.type,
            v.acquisitionCost,
            v.odometer,
            v.totalDistance,
            v.fuelEfficiency,
            v.fuelCost,
            v.maintenanceCost,
            v.otherExpenses,
            v.totalOperationalCost,
            v.totalRevenue,
            (v.roi * 100).toFixed(2) + '%'
        ]);

        // CSV format assembly
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(value => `"${value}"`).join(','))
        ].join('\n');

        // Blob creation and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `TransitOps-FleetReport-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Reports & ROI Analytics</h1>
                    <p>Analyze vehicle fleet operational efficiency and return on acquisition investments</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleExportCSV}
                    disabled={reportData.length === 0}
                >
                    📥 Export CSV Report
                </button>
            </div>

            {error && (
                <div className="alert-box alert-danger" style={{ marginTop: '1.5rem' }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Aggregating performance reports...
                    </div>
                ) : reportData.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No vehicle report files compiled.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="custom-table" style={{ fontSize: '0.9rem' }}>
                            <thead>
                                <tr>
                                    <th>Vehicle Registration</th>
                                    <th>Model / Type</th>
                                    <th>Total Distance</th>
                                    <th>Efficiency (km/L)</th>
                                    <th>Total Ops Cost</th>
                                    <th>Total Revenue</th>
                                    <th>Acquisition Cost</th>
                                    <th>ROI Computation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((v) => {
                                    const roiPercent = (v.roi * 100).toFixed(2);
                                    const isPositive = v.roi >= 0;
                                    return (
                                        <tr key={v.vehicleId}>
                                            <td style={{ fontWeight: 'bold', color: '#fff' }}>{v.registrationNumber}</td>
                                            <td>
                                                <div>{v.model}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.type}</div>
                                            </td>
                                            <td>{v.totalDistance} km</td>
                                            <td>
                                                {v.fuelEfficiency > 0 ? `${v.fuelEfficiency} km/L` : '--'}
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Fuel cost: ${v.fuelCost.toLocaleString()}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: '600' }}>${v.totalOperationalCost.toLocaleString()}</span>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Inc. Maintenance: ${v.maintenanceCost.toLocaleString()}
                                                </div>
                                            </td>
                                            <td style={{ color: '#818cf8', fontWeight: 'bold' }}>
                                                ${v.totalRevenue.toLocaleString()}
                                            </td>
                                            <td>${v.acquisitionCost.toLocaleString()}</td>
                                            <td style={{ fontWeight: 'bold', color: isPositive ? '#10b981' : '#f43f5e' }}>
                                                <div>{roiPercent}%</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                                                    ROI Ratio: {v.roi.toFixed(4)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="glass-card" style={{ marginTop: '1.5rem', background: 'rgba(79, 70, 229, 0.03)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#a5b4fc' }}>📝 How ROI is Calculated</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Vehicle Return on Investment (ROI) is computed dynamically from the financial statements on the database:
                </p>
                <code style={{ display: 'block', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', margin: '0.75rem 0', fontFamily: 'monospace', fontSize: '0.85rem', color: '#22d3ee' }}>
                    ROI = (Revenue - (Maintenance + Fuel + Tolls + Other Expenses)) / Acquisition Cost
                </code>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Updates instantly as soon as trips are completed or maintenance bills & gas files are logged.
                </p>
            </div>
        </div>
    );
};

export default Reports;
