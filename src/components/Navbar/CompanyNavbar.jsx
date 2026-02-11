import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';

const CompanyNavbar = () => {
    return (
        <>
            <div className="logo-section">
                <NavLink to="/company/dashboard" className="logo">CORE</NavLink>
            </div>
            <div className="menu-section">
                <ul className="menu-list">
                    <li><NavLink to="/company/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink></li>
                    <li><NavLink to="/company/offers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Offers</NavLink></li>
                    <li><NavLink to="/company/candidates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Candidates</NavLink></li>
                    <li><NavLink to="/company/interviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Interviews</NavLink></li>
                </ul>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <NavLink to="/notifications" style={{ color: 'white', display: 'flex' }}>
                    <Bell size={20} />
                </NavLink>
                <div className="cta-menu-button" style={{ padding: '8px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>Tech</span>
                    <div style={{ width: '24px', height: '24px', background: '#10b981', borderRadius: '50%' }}></div>
                </div>
            </div>
        </>
    );
};

export default CompanyNavbar;
