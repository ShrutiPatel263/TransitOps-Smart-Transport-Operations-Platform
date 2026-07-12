import React, { useState, useEffect } from 'react';

const Trips = ({ token }) => {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Trip Creation Form State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [cargoWeight, setCargoWeight] = useState('');
    const [distance, setDistance] = useState('');
    const [revenue, setRevenue] = useState('');
    const [dispatchImmediately, setDispatchImmediately] = useState(false);
    const [formError, setFormError] = useState('');

    // Complete Trip Form State
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [activeCompleteTrip, setActiveCompleteTrip] = useState(null);
    const [finalOdometer, setFinalOdometer] = useState('');
    const [fuelConsumed, setFuelConsumed] = useState('');
    const [fuelCost, setFuelCost] = useState('');
    const [completeFormError, setCompleteFormError] = useState('');

    const fetchTripsAndAssets = async () => {
        try {
            setLoading(true);
            setError('');

            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                fetch('/api/trips', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/vehicles', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/drivers', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!tripsRes.ok || !vehiclesRes.ok || !driversRes.ok) {
                throw new Error('Failed to retrieve system operations data.');
            }

            setTrips(await tripsRes.json());
            setVehicles(await vehiclesRes.json());
            setDrivers(await driversRes.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTripsAndAssets();
    }, []);

    // Filter out retired, in-shop, or already on-trip vehicles for selection
    const availableVehiclesForDispatch = vehicles.filter(v => v.status === 'Available');

    // Filter out suspended, off-duty, on-trip, or expired license drivers
    const availableDriversForDispatch = drivers.filter(d => {
        const expired = new Date(d.licenseExpiryDate) < new Date();
        return d.status === 'Available' && !expired;
    });

    const handleCreateTripSubmit = async (e) => {
        e.preventDefault();
        if (!source || !destination || !selectedVehicle || !selectedDriver || !cargoWeight || !distance || !revenue) {
            setFormError('Please fill in all mandatory fields.');
            return;
        }

        const vehicle = vehicles.find(v => v._id === selectedVehicle);
        if (Number(cargoWeight) > vehicle.maxCapacity) {
            setFormError(`Cargo Weight (${cargoWeight} kg) exceeds vehicle's maximum capacity (${vehicle.maxCapacity} kg).`);
            return;
        }

        try {
            setFormError('');
            const response = await fetch('/api/trips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    source,
                    destination,
                    vehicle: selectedVehicle,
                    driver: selectedDriver,
                    cargoWeight: Number(cargoWeight),
                    distance: Number(distance),
                    revenue: Number(revenue),
                    status: dispatchImmediately ? 'Dispatched' : 'Draft'
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Creating trip failed.');

            setShowCreateModal(false);

            // Reset form fields
            setSource('');
            setDestination('');
            setSelectedVehicle('');
            setSelectedDriver('');
            setCargoWeight('');
            setDistance('');
            setRevenue('');
            setDispatchImmediately(false);

            fetchTripsAndAssets();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleDispatchTrip = async (id) => {
        try {
            const response = await fetch(`/api/trips/${id}/dispatch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Dispatching trip failed.');
            fetchTripsAndAssets();
        } catch (err) {
            alert(err.message);
        }
    };

    const openCompleteModal = (trip) => {
        setActiveCompleteTrip(trip);
        setFinalOdometer(trip.vehicle ? trip.vehicle.odometer + trip.distance : '');
        setFuelConsumed('');
        setFuelCost('');
        setCompleteFormError('');
        setShowCompleteModal(true);
    };

    const handleCompleteTripSubmit = async (e) => {
        e.preventDefault();
        if (!finalOdometer) {
            setCompleteFormError('Final odometer is required.');
            return;
        }

        const currentVechOdo = activeCompleteTrip.vehicle ? activeCompleteTrip.vehicle.odometer : 0;
        if (Number(finalOdometer) < currentVechOdo) {
            setCompleteFormError(`Final Odometer (${finalOdometer} km) cannot be less than vehicle's current odometer (${currentVechOdo} km).`);
            return;
        }

        try {
            setCompleteFormError('');
            const response = await fetch(`/api/trips/${activeCompleteTrip._id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    finalOdometer: Number(finalOdometer),
                    fuelConsumed: fuelConsumed ? Number(fuelConsumed) : undefined,
                    fuelCost: fuelCost ? Number(fuelCost) : undefined
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Completing trip failed.');

            setShowCompleteModal(false);
            fetchTripsAndAssets();
        } catch (err) {
            setCompleteFormError(err.message);
        }
    };

    const handleCancelTrip = async (id) => {
        if (!window.confirm('Are you user you want to cancel this trip?')) return;
        try {
            const response = await fetch(`/api/trips/${id}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Cancelling trip failed.');
            fetchTripsAndAssets();
        } catch (err) {
            alert(err.message);
        }
    };

    // Organize trips by state
    const draftTrips = trips.filter(t => t.status === 'Draft');
    const dispatchedTrips = trips.filter(t => t.status === 'Dispatched');
    const completedTrips = trips.filter(t => t.status === 'Completed');
    const cancelledTrips = trips.filter(t => t.status === 'Cancelled');

    const renderTripCard = (t) => (
        <div key={t._id} className="trip-card">
            <div className="trip-routes">
                📍 {t.source} ➔ {t.destination}
            </div>
            <div className="trip-details">
                <div>🚚 Vehicle: {t.vehicle ? t.vehicle.registrationNumber : 'Unknown'} ({t.vehicle?.model})</div>
                <div>👤 Driver: {t.driver ? t.driver.name : 'Unknown'}</div>
                <div>📦 Cargo: {t.cargoWeight} kg   |   📏 {t.distance} km</div>
                <div style={{ color: '#818cf8', fontWeight: 'bold' }}>💰 Rev: ${t.revenue}</div>
                {t.status === 'Completed' && t.finalOdometer && (
                    <div style={{ color: '#10b981' }}>🏁 Completed: {t.finalOdometer} km</div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem', justifyContent: 'flex-end' }}>
                {t.status === 'Draft' && (
                    <button
                        className="btn btn-primary"
                        onClick={() => handleDispatchTrip(t._id)}
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                    >
                        🚀 Dispatch
                    </button>
                )}
                {t.status === 'Dispatched' && (
                    <button
                        className="btn btn-primary"
                        onClick={() => openCompleteModal(t)}
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#10b981' }}
                    >
                        🏁 Complete
                    </button>
                )}
                {(t.status === 'Draft' || t.status === 'Dispatched') && (
                    <button
                        className="btn btn-danger"
                        onClick={() => handleCancelTrip(t._id)}
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                    >
                        ❌ Cancel
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Trip Dispatch Board</h1>
                    <p>Organize dispatches and validate vehicle payload capacity constraints</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    ➕ Create Trip Dispatch
                </button>
            </div>

            {error && (
                <div className="alert-box alert-danger" style={{ marginTop: '1.5rem' }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading trip dispatch board...
                </div>
            ) : (
                <div className="trip-board">

                    {/* Draft Column */}
                    <div className="board-col">
                        <div className="col-header">
                            <span>📁 Drafts</span>
                            <span className="col-count">{draftTrips.length}</span>
                        </div>
                        {draftTrips.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No drafts.</div>
                        ) : draftTrips.map(renderTripCard)}
                    </div>

                    {/* Dispatched Column */}
                    <div className="board-col">
                        <div className="col-header">
                            <span>🚀 Dispatched / Active</span>
                            <span className="col-count" style={{ color: '#818cf8' }}>{dispatchedTrips.length}</span>
                        </div>
                        {dispatchedTrips.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No active trips.</div>
                        ) : dispatchedTrips.map(renderTripCard)}
                    </div>

                    {/* Completed Column */}
                    <div className="board-col">
                        <div className="col-header">
                            <span>✅ Completed</span>
                            <span className="col-count" style={{ color: '#34d399' }}>{completedTrips.length}</span>
                        </div>
                        {completedTrips.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No completed trips.</div>
                        ) : completedTrips.map(renderTripCard)}
                    </div>

                    {/* Cancelled Column */}
                    <div className="board-col">
                        <div className="col-header">
                            <span>❌ Cancelled</span>
                            <span className="col-count" style={{ color: '#f87171' }}>{cancelledTrips.length}</span>
                        </div>
                        {cancelledTrips.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No cancelled trips.</div>
                        ) : cancelledTrips.map(renderTripCard)}
                    </div>

                </div>
            )}

            {/* Creation Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create Trip Dispatch</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>

                        {formError && (
                            <div className="alert-box alert-danger">
                                <span>⚠️</span>
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateTripSubmit}>
                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>Source Location *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Warehouse A"
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Destination Location *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Distrib Center B"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Cargo Weight (kg) *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 450"
                                    value={cargoWeight}
                                    onChange={(e) => setCargoWeight(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Assign Vehicle *</label>
                                <select
                                    className="form-control"
                                    value={selectedVehicle}
                                    onChange={(e) => setSelectedVehicle(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Available Vehicle --</option>
                                    {availableVehiclesForDispatch.map(v => (
                                        <option key={v._id} value={v._id}>
                                            {v.registrationNumber} ({v.model} | Max: {v.maxCapacity}kg)
                                        </option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                    Only vehicles marked Available and not In Shop/On Trip/Retired appear.
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Assign Driver *</label>
                                <select
                                    className="form-control"
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Available Driver --</option>
                                    {availableDriversForDispatch.map(d => (
                                        <option key={d._id} value={d._id}>
                                            {d.name} (Safety: {d.safetyScore}% | DL: {d.licenseCategory})
                                        </option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                    Only drivers marked Available and having valid licenses appear.
                                </p>
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>Planned Distance (km) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g. 120"
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Projected Revenue ($) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g. 800"
                                        value={revenue}
                                        onChange={(e) => setRevenue(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ flexDirection: 'row', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="dispatchNow"
                                    checked={dispatchImmediately}
                                    onChange={(e) => setDispatchImmediately(e.target.checked)}
                                />
                                <label htmlFor="dispatchNow" style={{ cursor: 'pointer' }}>Dispatch Immediately (On Trip status)</label>
                            </div>

                            <div className="action-row">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Dispatch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Completion Dialog Modal */}
            {showCompleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Complete Trip Dispatch</h3>
                            <button className="modal-close" onClick={() => setShowCompleteModal(false)}>×</button>
                        </div>

                        {completeFormError && (
                            <div className="alert-box alert-danger">
                                <span>⚠️</span>
                                <span>{completeFormError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCompleteTripSubmit}>
                            <div className="form-group">
                                <label>Vehicle Current Odometer</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={`${activeCompleteTrip.vehicle ? activeCompleteTrip.vehicle.odometer : 0} km`}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Final Odometer (km) *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 12130"
                                    value={finalOdometer}
                                    onChange={(e) => setFinalOdometer(e.target.value)}
                                    required
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                    Must be greater than or equal to current odometer.
                                </p>
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>Fuel Consumed (Liters)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g. 12"
                                        value={fuelConsumed}
                                        onChange={(e) => setFuelConsumed(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fuel Cost ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        placeholder="e.g. 24.50"
                                        value={fuelCost}
                                        onChange={(e) => setFuelCost(e.target.value)}
                                    />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Filling fuel details automatically tracks a "Fuel" category expense for this vehicle.
                            </p>

                            <div className="action-row">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>
                                    Complete Trip
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Trips;
