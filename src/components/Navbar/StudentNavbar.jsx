import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';

const StudentNavbar = () => {
    return (
        <>
            <div className="logo-section">
                <NavLink to="/student/dashboard" className="logo">CORE</NavLink>
            </div>
            <div className="menu-section">
                <ul className="menu-list">
                    <li><NavLink to="/student/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink></li>
                    <li><NavLink to="/student/challenges" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Challenges</NavLink></li>
                    <li><NavLink to="/browse-offers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Offers</NavLink></li>
                    <li><NavLink to="/student/buddies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Buddies</NavLink></li>
                </ul>
            </div>

            {/* Keeping a cleaner profile view for the pill shape */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <NavLink to="/notifications" style={{ color: 'white', display: 'flex' }}>
                    <Bell size={20} />
                </NavLink>
                <div className="cta-menu-button" style={{ padding: '8px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>JD</span>
                    <div style={{ width: '24px', height: '24px', background: '#3b82f6', borderRadius: '50%' }}></div>
                </div>
            </div>
        </>
    );
};

export default StudentNavbar;
