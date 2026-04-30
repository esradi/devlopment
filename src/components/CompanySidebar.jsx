import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Briefcase, 
    User, 
    Calendar, 
    MessageSquare, 
    Folder, 
    Settings,
    LogOut,
    CreditCard
} from 'lucide-react';
import './CompanySidebar.css';

const CompanySidebar = ({ activePath }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard/company' },
        { path: 'offers', label: 'My Offers', icon: Briefcase, route: '/dashboard/company/offers' },
        { path: 'candidates', label: 'Applications', icon: User, route: '/dashboard/company/offer/1/candidates' },
        { path: 'interviews', label: 'Interviews', icon: Calendar, route: '/dashboard/company/interviews' },
        { path: 'messages', label: 'Messages', icon: MessageSquare, route: '/dashboard/company/messages' },
        { path: 'profile', label: 'Company Profile', icon: Folder, route: '/dashboard/company/profile' },
        { path: 'billing', label: 'Billing', icon: CreditCard, route: '/dashboard/company/billing' },
        { path: 'settings', label: 'Settings', icon: Settings, route: '/dashboard/company/settings' }
    ];

    // Some pages might not be mapped perfectly 1:1, so we do a substring match approach or exact.
    // E.g., if activePath='documents', but it's not in the new sidebar mockup, maybe handle it or ignore it.
    // The mockup only had these 7 elements.

    return (
        <aside className="global-company-sidebar">
            <div className="sidebar-top-section">
                <nav className="sidebar-main-nav">
                    {navItems.map(item => (
                        <Link 
                            key={item.path} 
                            to={item.route} 
                            className={`nav-item ${activePath === item.path ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="sidebar-bottom-section">
                <div className="premium-upgrade-card">
                    <div className="premium-badge">PREMIUM</div>
                    <p>Access priority intern filtering and unlimited job posts.</p>
                    <button 
                        className="btn-upgrade-plan"
                        onClick={() => navigate('/dashboard/company/billing')}
                    >
                        UPGRADE PLAN
                    </button>
                </div>
                
                <div className="sidebar-bottom-links">
                    <Link to="/help" className="bottom-link-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <span>Help Center</span>
                    </Link>
                    <button onClick={handleLogout} className="bottom-link-item logout">
                        <LogOut size={18} style={{ transform: 'rotate(180deg)' }} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default CompanySidebar;
