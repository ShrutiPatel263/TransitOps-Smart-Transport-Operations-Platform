import React, { useState, useEffect } from 'react';

const Expenses = ({ token }) => {
    const [expenses, setExpenses] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Log Expense Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [category, setCategory] = useState('Fuel');
    const [cost, setCost] = useState('');
    const [liters, setLiters] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [formError, setFormError] = useState('');

    const fetchExpensesAndVehicles = async () => {
        try {
            setLoading(true);
            setError('');

            const [expsRes, vehiclesRes] = await Promise.all([
                fetch('/api/expenses', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/vehicles', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!expsRes.ok || !vehiclesRes.ok) {
                throw new Error('Failed to retrieve expense data.');
            }

            setExpenses(await expsRes.json());
            setVehicles(await vehiclesRes.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpensesAndVehicles();
    }, []);

    const activeVehicles = vehicles.filter(v => v.status !== 'Retired');

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!selectedVehicle || !category || !cost) {
            setFormError('Please select a vehicle, category, and enter the total cost.');
            return;
        }

        if (category === 'Fuel' && (!liters || Number(liters) <= 0)) {
            setFormError('Fuel logging requires entering the number of liters consumed.');
            return;
        }

        try {
            setFormError('');
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    vehicle: selectedVehicle,
                    category,
                    cost: Number(cost),
                    liters: category === 'Fuel' ? Number(liters) : undefined,
                    date: date ? new Date(date) : undefined,
                    description
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Creating expense ledger failed.');

            setShowModal(false);
            setSelectedVehicle('');
            setCategory('Fuel');
            setCost('');
            setLiters('');
            setDate('');
            setDescription('');

            fetchExpensesAndVehicles();
        } catch (err) {
            setFormError(err.message);
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Fuel & Expense Ledger</h1>
                    <p>Record vehicle fuel purchase, tolls, insurance, and other operations cash flows</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Record Operational Expense
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
                        Loading expense ledger...
                    </div>
                ) : expenses.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No expenses logged. Click "Record Operational Expense" to add.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Vehicle Registration #</th>
                                    <th>Model</th>
                                    <th>Category</th>
                                    <th>Cost Logged</th>
                                    <th>Fuel Liters</th>
                                    <th>Log Date</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((exp) => (
                                    <tr key={exp._id}>
                                        <td style={{ fontWeight: 'bold', color: '#fff' }}>
                                            {exp.vehicle ? exp.vehicle.registrationNumber : 'Unknown'}
                                        </td>
                                        <td>{exp.vehicle ? exp.vehicle.model : 'Unknown'}</td>
                                        <td>
                                            <span className={`badge ${exp.category === 'Fuel' ? 'badge-ontrip' :
                                                    exp.category === 'Maintenance' ? 'badge-inshop' :
                                                        exp.category === 'Toll' ? 'badge-available' : 'badge-offduty'
                                                }`}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>${exp.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td>{exp.category === 'Fuel' && exp.liters ? `${exp.liters} L` : '--'}</td>
                                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                                        <td>{exp.description || '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Record Operational Expense</h3>
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
                                <label>Select Fleet Vehicle *</label>
                                <select
                                    className="form-control"
                                    value={selectedVehicle}
                                    onChange={(e) => setSelectedVehicle(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Vehicle --</option>
                                    {activeVehicles.map(v => (
                                        <option key={v._id} value={v._id}>
                                            {v.registrationNumber} ({v.model} | Current Odo: {v.odometer}km)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label>Expense Category *</label>
                                    <select
                                        className="form-control"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                    >
                                        <option value="Fuel">Fuel (Gasoline/Diesel)</option>
                                        <option value="Toll">Road Tolls</option>
                                        <option value="Maintenance">Maintenance Service</option>
                                        <option value="Insurance">Asset Insurance</option>
                                        <option value="Other">Other Fees</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Total Cost ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        placeholder="e.g. 52.40"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {category === 'Fuel' && (
                                <div className="form-group">
                                    <label>Fuel Liters *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-control"
                                        placeholder="e.g. 30"
                                        value={liters}
                                        onChange={(e) => setLiters(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Log Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Defaults to the current date if left blank.
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Description / Note</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Fuel refill at Shell station"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="action-row">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Log Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Expenses;
