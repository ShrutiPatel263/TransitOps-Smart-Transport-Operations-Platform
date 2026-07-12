import React, { useState, useEffect } from 'react';

const Drivers = ({ token, userRole }) => {
    const [drivers, setDrivers] = useState([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('Create');
    const [targetId, setTargetId] = useState('');
    const [name, setName] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [licenseCategory, setLicenseCategory] = useState('');
    const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [safetyScore, setSafetyScore] = useState(100);
    const [status, setStatus] = useState('Available');
    const [formError, setFormError] = useState('');

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            setError('');
            let url = '/api/drivers';
            const params = [];
            if (search) params.push(`search=${encodeURIComponent(search)}`);
            if (filterStatus) params.push(`status=${encodeURIComponent(filterStatus)}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Could not retrieve driver list.');
            const data = await response.json();
            setDrivers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, [search, filterStatus]);

    const openCreateModal = () => {
        setModalMode('Create');
        setName('');
        setLicenseNumber('');
        setLicenseCategory('');
        setLicenseExpiryDate('');
        setContactNumber('');
        setSafetyScore(100);
        setStatus('Available');
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (driver) => {
        setModalMode('Edit');
        setTargetId(driver._id);
        setName(driver.name);
        setLicenseNumber(driver.licenseNumber);
        setLicenseCategory(driver.licenseCategory);
        setLicenseExpiryDate(driver.licenseExpiryDate.split('T')[0]);
        setContactNumber(driver.contactNumber);
        setSafetyScore(driver.safetyScore);
        setStatus(driver.status);
        setFormError('');
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
            setFormError('Please fill in all mandatory fields.');
            return;
        }

        try {
            setFormError('');
            const payload = {
                name,
                licenseNumber,
                licenseCategory,
                licenseExpiryDate,
                contactNumber,
                safetyScore: Number(safetyScore),
                status
            };

            const url = modalMode === 'Create' ? '/api/drivers' : `/api/drivers/${targetId}`;
            const method = modalMode === 'Create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Saving driver profile failed.');
            }

            setShowModal(false);
            fetchDrivers();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you user you want to delete this driver profile?')) return;
        try {
            const response = await fetch(`/api/drivers/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Could not delete driver.');
            fetchDrivers();
        } catch (err) {
            alert(err.message);
        }
    };

    // Compile expired licenses and low score drivers
    const complianceIssues = drivers.filter(d => {
        const expired = new Date(d.licenseExpiryDate) < new Date();
        const lowScore = d.safetyScore < 80;
        const suspended = d.status === 'Suspended';
        return expired || lowScore || suspended;
    });

    return (
        <div>
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Driver Management</h1>
                    <p>Configure driver compliance registry and monitoring safety scores</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    ➕ Add Driver Profile
                </button>
            </div>

            {error && (
                <div className="alert-box alert-danger" style={{ marginTop: '1.5rem' }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="dashboard-layout" style={{ marginTop: '1.5rem' }}>

                {/* Main List */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flexGrow: 1, maxWidth: '280px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by Name or License..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
                            <select
                                className="form-control"
                                style={{ width: '130px', padding: '0.4rem' }}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="On Trip">On Trip</option>
                                <option value="Off Duty">Off Duty</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Loading driver records...
                        </div>
                    ) : drivers.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No drivers found.
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Driver Name</th>
                                        <th>License / Class</th>
                                        <th>Expiry Date</th>
                                        <th>Contact</th>
                                        <th>Safety Score</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drivers.map((d) => {
                                        const expired = new Date(d.licenseExpiryDate) < new Date();
                                        return (
                                            <tr key={d._id} style={expired ? { background: 'rgba(239, 68, 68, 0.02)' } : {}}>
                                                <td style={{ fontWeight: 'bold', color: '#fff' }}>{d.name}</td>
                                                <td>
                                                    <div>{d.licenseNumber}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.licenseCategory}</div>
                                                </td>
                                                <td style={expired ? { color: 'var(--danger)', fontWeight: 'bold' } : {}}>
                                                    {new Date(d.licenseExpiryDate).toLocaleDateString()}
                                                    {expired && ' (Expired)'}
                                                </td>
                                                <td>{d.contactNumber}</td>
                                                <td style={{ width: '150px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div className="bar-track" style={{ height: '8px', width: '80px', margin: 0 }}>
                                                            <div
                                                                className="bar-fill"
                                                                style={{
                                                                    width: `${d.safetyScore}%`,
                                                                    backgroundColor: d.safetyScore >= 90 ? '#10b981' : d.safetyScore >= 80 ? '#fbbf24' : '#ef4444'
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{d.safetyScore}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${d.status.toLowerCase().replace(' ', '')}`}>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => openEditModal(d)}
                                                        style={{ padding: '0.4rem 0.75rem', marginRight: '0.5rem', fontSize: '0.8rem' }}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    {userRole === 'Fleet Manager' && (
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleDelete(d._id)}
                                                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Compliance Alerts Panel */}
                <div className="glass-card" style={{ height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem', color: '#fca5a5' }}>⚠️ Safety & License compliance</h3>
                    {complianceIssues.length === 0 ? (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '0.5rem' }}>
                            ✅ All drivers are currently compliant and active.
                        </div>
                    ) : (
                        <div className="compliance-list">
                            {complianceIssues.map((d) => {
                                const expired = new Date(d.licenseExpiryDate) < new Date();
                                return (
                                    <div key={d._id} className="compliance-item">
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{d.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {expired ? `License expired: ${new Date(d.licenseExpiryDate).toLocaleDateString()}` : `Score: ${d.safetyScore}`}
                                            </div>
                                        </div>
                                        <span
                                            className="badge badge-suspended"
                                            style={{ fontSize: '0.7rem' }}
                                        >
                                            {d.status === 'Suspended' ? 'Suspended' : expired ? 'Expired' : 'Safety Warning'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'Create' ? 'Create Driver Profile' : 'Modify Driver Profile'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        {formError && (
                            <div className="alert-box alert-danger">
                                <span>⚠️</span>
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Alex Smith"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>License Number *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. DL-12345"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category / Class *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Class A or Heavy Truck"
                                        value={licenseCategory}
                                        onChange={(e) => setLicenseCategory(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>License Expiry Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={licenseExpiryDate}
                                        onChange={(e) => setLicenseExpiryDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Number *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. +1-555-0100"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>Safety Compliance Score (0-100)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        max="100"
                                        value={safetyScore}
                                        onChange={(e) => setSafetyScore(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        className="form-control"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="On Trip">On Trip</option>
                                        <option value="Off Duty">Off Duty</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="action-row">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modalMode === 'Create' ? 'Create Profile' : 'Save Profiles'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drivers;
