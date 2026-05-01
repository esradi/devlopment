import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    CheckSquare, 
    BarChart2, 
    Settings,
    Handshake,
    Award
} from 'lucide-react';
import logo from '../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import './AdminSidebar.css';

const AdminSidebar = ({ activePath }) => {
    const navigate = useNavigate();

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

    return (
        <aside className="global-admin-sidebar">
            <div className="sidebar-top-section">
                <div className="admin-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                </div>
                
                <nav className="sidebar-main-nav">
                    {navItems.map(item => (
                        <Link 
                            key={item.path} 
                            to={item.route} 
                            className={`nav-item ${activePath === item.path || (activePath === '' && item.path === 'dashboard') ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="sidebar-bottom-section">
                <div className="admin-profile-card">
                    <div className="admin-avatar">
                        <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                    </div>
                    <div className="admin-info">
                        <h4>Admin Dean</h4>
                        <span>admin@univ.edu</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
