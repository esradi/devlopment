import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    CheckSquare, 
    BarChart2, 
    Settings,
    Handshake,
    Award,
    Search,
    X
} from 'lucide-react';
import logo from '../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import './AdminSidebar.css';

const AdminSidebar = ({ activePath, userData, isOpen, onClose }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const navItems = [
        { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard/admin' },
        { path: 'students', label: 'Students', icon: Users, route: '/dashboard/admin/students' },
        { path: 'companies', label: 'Companies/Partners', icon: Handshake, route: '/dashboard/admin/companies' },
        { path: 'internships', label: 'Internships', icon: Briefcase, route: '/dashboard/admin/internships' },
        { path: 'validation', label: 'Validation', icon: CheckSquare, route: '/dashboard/admin/validation' },
        { path: 'skills', label: 'Skill Verification', icon: Award, route: '/dashboard/admin/skills' },
        { path: 'reports', label: 'Reports', icon: BarChart2, route: '/dashboard/admin/reports' },
        { path: 'settings', label: 'Settings', icon: Settings, route: '/dashboard/admin/settings' }
    ];

    const adminName = userData ? `${userData.first_name} ${userData.last_name}`.trim() || userData.email.split('@')[0] : 'Admin User';
    const adminEmail = userData ? userData.email : 'admin@stage.io';
    const adminAvatar = userData?.profile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=9e59ff&color=fff`;

    return (
        <>
            {/* Sidebar Overlay - click to close */}
            <div 
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} 
                onClick={onClose}
            ></div>

            <aside className={`global-admin-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-close-trigger" onClick={onClose}>
                    <X size={20} />
                </div>

                <div className="sidebar-top-section">
                    <nav className="sidebar-main-nav">
                        {navItems.map(item => (
                            <Link 
                                key={item.path} 
                                to={item.route} 
                                className={`nav-item ${activePath === item.path || (activePath === '' && item.path === 'dashboard') ? 'active' : ''}`}
                                onClick={onClose} // Auto close on nav
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="sidebar-bottom-section">
                    <Link to="/dashboard/admin/settings" style={{ textDecoration: 'none', color: 'inherit' }} onClick={onClose}>
                        <div className="admin-profile-card">
                            <div className="admin-avatar">
                                <img src={adminAvatar} alt="Admin" />
                            </div>
                            <div className="admin-info">
                                <h4>{adminName}</h4>
                                <span>{adminEmail}</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
