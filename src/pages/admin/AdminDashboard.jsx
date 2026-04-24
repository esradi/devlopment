import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { 
    Search, 
    Bell, 
    Mail, 
    User
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminStudents from './AdminStudents';
import AdminCompanies from './AdminCompanies';
import AdminInternships from './AdminInternships';
import AdminValidation from './AdminValidation';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const location = useLocation();
    
    // Extract the active path segment after /dashboard/admin
    const pathParts = location.pathname.split('/');
    const activePath = pathParts.length > 3 ? pathParts[3] : 'dashboard';

    return (
        <div className="admin-dashboard-container">
            <AdminSidebar activePath={activePath} />
            
            <main className="admin-main-content">
                {/* Top header navigation */}
                <header className="admin-top-header">
                    <div className="search-bar">
                        <Search size={18} color="#9ca3af" />
                        <input type="text" placeholder="Search student, company or internship..." />
                    </div>
                    <div className="header-actions">
                        <div className="icon-btn position-relative">
                            <Bell size={20} color="#9ca3af" />
                            <span className="notification-dot"></span>
                        </div>
                        <div className="icon-btn">
                            <Mail size={20} color="#9ca3af" />
                        </div>
                        <div className="profile-dropdown">
                            <User size={20} color="#9ca3af" />
                            <span>My Profile</span>
                        </div>
                    </div>
                </header>

                {/* Main Content Router */}
                <div className="admin-page-content" style={{ flex: 1, overflowY: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<AdminOverview />} />
                        <Route path="/students" element={<AdminStudents />} />
                        <Route path="/companies" element={<AdminCompanies />} />
                        <Route path="/internships" element={<AdminInternships />} />
                        <Route path="/validation" element={<AdminValidation />} />
                        <Route path="/reports" element={<AdminReports />} />
                        <Route path="/settings" element={<AdminSettings />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
