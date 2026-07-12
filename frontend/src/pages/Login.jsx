import React, { useState, useEffect } from 'react';

const Login = ({ initialMode = 'login', onLoginSuccess, onBackToHome }) => {
    const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('Fleet Manager');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Sync mode with props if initialMode changes
    useEffect(() => {
        setMode(initialMode);
        setError('');
    }, [initialMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password || (mode === 'signup' && (!name || !role))) {
            setError('Please fill in all mandatory fields.');
            return;
        }

        try {
            setError('');
            setLoading(true);

            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const payload = mode === 'login'
                ? { email, password }
                : { name, email, password, role };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authenticating verification checks failed.');
            }

            onLoginSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Navigation back */}
                <button
                    onClick={onBackToHome}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        alignSelf: 'flex-start',
                        fontSize: '0.85rem',
                        marginBottom: '1rem',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                >
                    📁 Back to Home
                </button>

                {/* Tab switch control header */}
                <div className="auth-tabs">
                    <div
                        className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => { setMode('login'); setError(''); }}
                    >
                        Sign In
                    </div>
                    <div
                        className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                        onClick={() => { setMode('signup'); setError(''); }}
                    >
                        Sign Up (Register)
                    </div>
                </div>

                <div className="login-heading">
                    <h2>{mode === 'login' ? 'TransitOps Workspace' : 'Create TransitOps Account'}</h2>
                    <p>
                        {mode === 'login'
                            ? 'Enter credentials to open dispatcher tools'
                            : 'Register your operational role for platform access'
                        }
                    </p>
                </div>

                {error && (
                    <div className="alert-box alert-danger">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name *</label>
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                placeholder="e.g. Alex Jones"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="e.g. employee@transitops.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label htmlFor="role">Operational Role *</label>
                            <select
                                id="role"
                                className="form-control"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="Fleet Manager">Fleet Manager (Full Admin)</option>
                                <option value="Driver">Driver (Dispatcher)</option>
                                <option value="Safety Officer">Safety Officer (Compliance & Scores)</option>
                                <option value="Financial Analyst">Financial Analyst (Expenses & Reports)</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.85rem', marginTop: mode === 'login' ? '1rem' : '0.5rem' }}
                        disabled={loading}
                    >
                        {loading
                            ? (mode === 'login' ? 'Signing In...' : 'Registering Account...')
                            : (mode === 'login' ? 'Sign In' : 'Register & Enter Platform')
                        }
                    </button>
                </form>

                {mode === 'login' && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <p>Demo Admin Account:</p>
                        <p><strong>manager@transitops.com</strong> (Password: <strong>password123</strong>)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
