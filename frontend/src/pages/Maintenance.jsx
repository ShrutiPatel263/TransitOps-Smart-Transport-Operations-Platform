import React, { useState, useEffect } from 'react';

const Maintenance = ({ token }) => {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Log Maintenance Modal State
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [logFormError, setLogFormError] = useState('');

    // Close Maintenance Modal State
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [activeCloseLog, setActiveCloseLog] = useState(null);
    const [cost, setCost] = useState('');
    const [endDate, setEndDate] = useState('');
    const [closeFormError, setCloseFormError] = useState('');

    const fetchLogsAndVehicles = async () => {
        try {
            setLoading(true);
            setError('');

            const [logsRes, vehiclesRes] = await Promise.all([
                fetch('/api/maintenance', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/vehicles', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!logsRes.ok || !vehiclesRes.ok) {
                throw new Error('Failed to retrieve maintenance data.');
            }

            setLogs(await logsRes.json());
            setVehicles(await vehiclesRes.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogsAndVehicles();
    }, []);

    const availableVehicles = vehicles.filter(v => v.status === 'Available');

    const handleCreateLogSubmit = async (e) => {
        e.preventDefault();
        if (!selectedVehicle || !description) {
            setLogFormError('Please select a vehicle and enter description.');
            return;
        }

        try {
            setLogFormError('');
            const response = await fetch('/api/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    vehicle: selectedVehicle,
                    description,
                    startDate: startDate ? new Date(startDate) : undefined
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Creating maintenance log failed.');

            setShowLogModal(false);
            setSelectedVehicle('');
            setDescription('');
            setStartDate('');

            fetchLogsAndVehicles();
        } catch (err) {
            setLogFormError(err.message);
        }
    };

    const openCloseModal = (log) => {
        setActiveCloseLog(log);
        setCost('');
        setEndDate('');
        setCloseFormError('');
        setShowCloseModal(true);
    };

    const handleCloseLogSubmit = async (e) => {
        e.preventDefault();
        if (!cost) {
            setCloseFormError('Total cost is required.');
            return;
        }

        try {
            setCloseFormError('');
            const response = await fetch(`/api/maintenance/${activeCloseLog._id}/close`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    cost: Number(cost),
                    endDate: endDate ? new Date(endDate) : undefined
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Closing maintenance log failed.');

            setShowCloseModal(false);
            fetchLogsAndVehicles();
        } catch (err) {
            setCloseFormError(err.message);
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Vehicle Maintenance Logs</h1>
                    <p>Put vehicles in maintenance shop and log service cost accounts</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowLogModal(true)}>
                    🔧 Log Maintenance Service
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
                        Loading maintenance reports...
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No maintenance records registered. Click "Log Maintenance Service" to start.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Vehicle Registration #</th>
                                    <th>Model</th>
                                    <th>Service Description</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Cost Log</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id}>
                                        <td style={{ fontWeight: 'bold', color: '#fff' }}>
                                            {log.vehicle ? log.vehicle.registrationNumber : 'Unknown'}
                                        </td>
                                        <td>{log.vehicle ? log.vehicle.model : 'Unknown'}</td>
                                        <td>{log.description}</td>
                                        <td>{new Date(log.startDate).toLocaleDateString()}</td>
                                        <td>{log.endDate ? new Date(log.endDate).toLocaleDateString() : '--'}</td>
                                        <td style={{ fontWeight: '600' }}>
                                            {log.status === 'Closed' ? `$${log.cost.toLocaleString()}` : '--'}
                                        </td>
                                        <td>
                                            <span className={`badge ${log.status === 'Active' ? 'badge-inshop' : 'badge-available'}`}>
                                                {log.status === 'Active' ? 'In Shop' : 'Resolved'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {log.status === 'Active' && (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => openCloseModal(log)}
                                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', backgroundColor: '#10b981' }}
                                                >
                                                    🔧 Resolve & Close
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Log Modal */}
            {showLogModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Log Maintenance Service</h3>
                            <button className="modal-close" onClick={() => setShowLogModal(false)}>×</button>
                        </div>

                        {logFormError && (
                            <div className="alert-box alert-danger">
                                <span>⚠️</span>
                                <span>{logFormError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateLogSubmit}>
                            <div className="form-group">
                                <label>Select Available Vehicle *</label>
                                <select
                                    className="form-control"
                                    value={selectedVehicle}
                                    onChange={(e) => setSelectedVehicle(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Vehicle --</option>
                                    {availableVehicles.map(v => (
                                        <option key={v._id} value={v._id}>
                                            {v.registrationNumber} ({v.model} | Current Odo: {v.odometer}km)
                                        </option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                    Vehicles currently on a trip or retired cannot be placed in maintenance.
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Service Description *</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="e.g. Schedule oil change, replace front brake pads"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Defaults to the current date if left blank.
                                </p>
                            </div>

                            <div className="action-row">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Put In Shop
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Close Modal */}
            {showCloseModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Resolve Maintenance Service</h3>
                            <button className="modal-close" onClick={() => setShowCloseModal(false)}>×</button>
                        </div>

                        {closeFormError && (
                            <div className="alert-box alert-danger">
                                <span>⚠️</span>
                                <span>{closeFormError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCloseLogSubmit}>
                            <div className="form-group">
                                <label>Service Description</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={activeCloseLog ? activeCloseLog.description : ''}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Repair Cost ($) *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 145"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    required
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Closing maintenance files creates a Maintenance expense record automatically.
                                </p>
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Defaults to the current date if left blank.
                                </p>
                            </div>

                            <div className="action-row">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>
                                    Resolve & Auto-log Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Maintenance;
