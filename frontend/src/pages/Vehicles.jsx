import React, { useState, useEffect } from 'react';

const Vehicles = ({ token }) => {
    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Registration / Edit Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('Create'); // Create or Edit
    const [targetId, setTargetId] = useState('');
    const [regNum, setRegNum] = useState('');
    const [model, setModel] = useState('');
    const [type, setType] = useState('Van');
    const [maxCapacity, setMaxCapacity] = useState('');
    const [odometer, setOdometer] = useState('');
    const [acquisitionCost, setAcquisitionCost] = useState('');
    const [status, setStatus] = useState('Available');
    const [formError, setFormError] = useState('');

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            setError('');
            let url = '/api/vehicles';
            const params = [];
            if (search) params.push(`search=${encodeURIComponent(search)}`);
            if (filterStatus) params.push(`status=${encodeURIComponent(filterStatus)}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to retrieve vehicle list.');
            const data = await response.json();
            setVehicles(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, [search, filterStatus]);

    const openCreateModal = () => {
        setModalMode('Create');
        setRegNum('');
        setModel('');
        setType('Van');
        setMaxCapacity('');
        setOdometer('');
        setAcquisitionCost('');
        setStatus('Available');
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (vehicle) => {
        setModalMode('Edit');
        setTargetId(vehicle._id);
        setRegNum(vehicle.registrationNumber);
        setModel(vehicle.model);
        setType(vehicle.type);
        setMaxCapacity(vehicle.maxCapacity);
        setOdometer(vehicle.odometer);
        setAcquisitionCost(vehicle.acquisitionCost);
        setStatus(vehicle.status);
        setFormError('');
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Mode-specific validation — only check editable/required fields per mode
        if (modalMode === 'Create') {
            if (!regNum.trim() || !model.trim() || Number(maxCapacity) <= 0 || Number(acquisitionCost) <= 0 || odometer === '') {
                setFormError('Please fill in all mandatory fields with valid values.');
                return;
            }
        } else {
            // In Edit mode, registrationNumber and odometer are disabled — don't validate them
            if (!model.trim() || Number(maxCapacity) <= 0 || Number(acquisitionCost) <= 0) {
                setFormError('Please fill in all mandatory fields with valid values.');
                return;
            }
        }

        try {
            setFormError('');

            // Build mode-specific payload:
            // Edit mode only sends editable fields — NOT the disabled registrationNumber or odometer
            // This prevents accidental overwrite and avoids NaN/validation errors from disabled inputs
            const payload = modalMode === 'Create'
                ? {
                    registrationNumber: regNum.trim(),
                    model: model.trim(),
                    type,
                    maxCapacity: Number(maxCapacity),
                    odometer: Number(odometer),
                    acquisitionCost: Number(acquisitionCost)
                }
                : {
                    model: model.trim(),
                    type,
                    maxCapacity: Number(maxCapacity),
                    acquisitionCost: Number(acquisitionCost),
                    status
                };

            const url = modalMode === 'Create' ? '/api/vehicles' : `/api/vehicles/${targetId}`;
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
                throw new Error(data.message || 'Saving vehicle profile failed.');
            }

            setShowModal(false);
            fetchVehicles();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you user you want to remove this vehicle from the registry?')) return;
        try {
            const response = await fetch(`/api/vehicles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Could not delete vehicle.');
            fetchVehicles();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Vehicle Registry</h1>
                    <p>Register and configure transport vehicle fleet</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    ➕ Register Vehicle
                </button>
            </div>

            {error && (
                <div className="alert-box alert-danger" style={{ marginTop: '1.5rem' }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Filter and Search controls */}
            <div className="glass-card flex-between" style={{ marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flexGrow: 1, maxWidth: '350px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Registration # or Model..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status:</span>
                    <select
                        className="form-control"
                        style={{ width: '150px' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="In Shop">In Shop</option>
                        <option value="Retired">Retired</option>
                    </select>
                </div>
            </div>

            {/* Grid / Table Listing */}
            <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Fetching fleet registry...
                    </div>
                ) : vehicles.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No vehicles registered. Click "Register Vehicle" to add.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Registration #</th>
                                    <th>Model / Name</th>
                                    <th>Type</th>
                                    <th>Max Capacity</th>
                                    <th>Odometer</th>
                                    <th>Acquisition Cost</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map((v) => (
                                    <tr key={v._id}>
                                        <td style={{ fontWeight: 'bold', color: '#fff' }}>{v.registrationNumber}</td>
                                        <td>{v.model}</td>
                                        <td>{v.type}</td>
                                        <td>{v.maxCapacity} kg</td>
                                        <td>{v.odometer} km</td>
                                        <td>${v.acquisitionCost.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge badge-${v.status.toLowerCase().replace(' ', '')}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => openEditModal(v)}
                                                style={{ padding: '0.4rem 0.75rem', marginRight: '0.5rem', fontSize: '0.8rem' }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDelete(v._id)}
                                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'Create' ? 'Register New Vehicle' : 'Modify Vehicle Registry'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        {formError && (
                            <div className="alert-box alert-danger">
                                <span>⚠️</span>
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} noValidate>
                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>Registration Number *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. VAN-05"
                                        value={regNum}
                                        onChange={(e) => setRegNum(e.target.value)}
                                        required
                                        disabled={modalMode === 'Edit'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Model *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Ford Transit"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>Vehicle Type</label>
                                    <select
                                        className="form-control"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="Van">Van</option>
                                        <option value="Truck">Truck</option>
                                        <option value="Sedan">Sedan</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Max Load Capacity (kg) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g. 500"
                                        value={maxCapacity}
                                        onChange={(e) => setMaxCapacity(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>Odometer (km) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g. 12000"
                                        value={odometer}
                                        onChange={(e) => setOdometer(e.target.value)}
                                        required
                                        disabled={modalMode === 'Edit'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Acquisition Cost ($) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g. 25000"
                                        value={acquisitionCost}
                                        onChange={(e) => setAcquisitionCost(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {modalMode === 'Edit' && (
                                <div className="form-group">
                                    <label>Operational Status</label>
                                    <select
                                        className="form-control"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="On Trip">On Trip</option>
                                        <option value="In Shop">In Shop</option>
                                        <option value="Retired">Retired</option>
                                    </select>
                                </div>
                            )}

                            <div className="action-row">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modalMode === 'Create' ? 'Register Vehicle' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
