import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { 
    Search, 
    Bell, 
    Mail, 
    User,
    Menu,
    X
} from 'lucide-react';
import { authService } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminStudents from './AdminStudents';
import AdminCompanies from './AdminCompanies';
import AdminInternships from './AdminInternships';
import AdminValidation from './AdminValidation';
import AdminSkills from './AdminSkills';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import AdminMessages from './AdminMessages';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    
    // Extract the active path segment after /dashboard/admin
    const pathParts = location.pathname.split('/');
    const activePath = pathParts.length > 3 ? pathParts[3] : 'dashboard';

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const profile = await authService.getMe();
                setUserData(profile);
            } catch (err) {
                console.error("Failed to fetch admin profile:", err);
            }
        };
        fetchAdminProfile();
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const adminName = userData ? `${userData.first_name} ${userData.last_name}`.trim() || userData.email.split('@')[0] : 'Admin';

    return (
        <div className={`admin-dashboard-container ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-hidden'}`}>
            <AdminSidebar 
                activePath={activePath} 
                userData={userData} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
            
            <main className="admin-main-content">
                <button 
                    className="sidebar-toggle-trigger" 
                    onClick={toggleSidebar}
                    title={isSidebarOpen ? "Close Sidebar" : "Open Menu"}
                >
                    <Menu size={24} />
                    {!isSidebarOpen && <span className="menu-label">Menu</span>}
                </button>

                {/* Main Content Router */}
                <div className={`admin-page-content ${isSidebarOpen ? 'content-shifted' : ''}`}>
                    <Routes>
                        <Route path="/" element={<AdminOverview />} />
                        <Route path="/students" element={<AdminStudents />} />
                        <Route path="/companies" element={<AdminCompanies />} />
                        <Route path="/internships" element={<AdminInternships />} />
                        <Route path="/validation" element={<AdminValidation />} />
                        <Route path="/skills" element={<AdminSkills />} />
                        <Route path="/reports" element={<AdminReports />} />
                        <Route path="/settings" element={<AdminSettings userData={userData} />} />
                        <Route path="/messages" element={<AdminMessages userData={userData} />} />
                    </Routes>
                </div>
            </main>
        </div>

    );
};

export default AdminDashboard;
