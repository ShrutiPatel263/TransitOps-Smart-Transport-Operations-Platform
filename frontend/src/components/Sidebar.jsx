import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
    // Navigation tabs config with permitted roles
    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: '📊', roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] },
        { id: 'vehicles', name: 'Vehicles', icon: '🚚', roles: ['Fleet Manager'] },
        { id: 'drivers', name: 'Drivers', icon: '👤', roles: ['Fleet Manager', 'Safety Officer'] },
        { id: 'trips', name: 'Trip Dispatch', icon: '🗺️', roles: ['Fleet Manager', 'Driver'] },
        { id: 'maintenance', name: 'Maintenance', icon: '🔧', roles: ['Fleet Manager'] },
        { id: 'expenses', name: 'Fuel & Expenses', icon: '💳', roles: ['Fleet Manager', 'Financial Analyst'] },
        { id: 'reports', name: 'Reports & ROI', icon: '📈', roles: ['Fleet Manager', 'Financial Analyst'] },
    ];

    // Filter items by user role
    const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <span>TransitOps</span>
            </div>
            <ul className="sidebar-menu">
                {allowedItems.map((item) => (
                    <li key={item.id}>
                        <a
                            className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                        </a>
                    </li>
                ))}
            </ul>
            <div className="sidebar-user">
                <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{user.role}</span>
                </div>
                <button className="btn btn-secondary" onClick={onLogout} style={{ width: '100%' }}>
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
