import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';

const AdminNavbar = () => {
    return (
        <>
            <div className="logo-section">
                <NavLink to="/admin/dashboard" className="logo">
                    CORE <span style={{ fontSize: '0.6rem', marginLeft: '5px', color: '#f59e0b' }}>ADM</span>
                </NavLink>
            </div>
            <div className="menu-section">
                <ul className="menu-list">
                    <li><NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink></li>
                    <li><NavLink to="/admin/validation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Validation</NavLink></li>
                    <li><NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Users</NavLink></li>
                    <li><NavLink to="/admin/stats" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Stats</NavLink></li>
                </ul>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <NavLink to="/notifications" style={{ color: 'white', display: 'flex' }}>
                    <Bell size={20} />
                </NavLink>
                <div className="cta-menu-button" style={{ padding: '8px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>Admin</span>
                    <div style={{ width: '24px', height: '24px', background: '#f59e0b', borderRadius: '50%' }}></div>
                </div>
            </div>
        </>
    );
};

export default AdminNavbar;
