import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Briefcase,
    Settings,
    LogOut,
    Plus,
    Users,
    TrendingUp,
    FileText,
    CheckCircle2,
    MessageSquare,
    User,
    ChevronRight,
    Search,
    Bell,
    X,
    Check,
    ArrowUpRight,
    Building2,
    Shield,
    Calendar,
    Folder,
    Menu
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { companyService, authService } from '../../services/api';
import CompanyOffers from './CompanyOffers';
import CompanyCandidates from './CompanyCandidates';
import CreateOffer from './CreateOffer';
import CompanySidebar from '../../components/CompanySidebar';
import CompanyNavbar from '../../components/Navbar/CompanyNavbar';
import NotificationBell from '../../components/NotificationBell';
import './CompanyDashboard.css';

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

const CompanyDashboard = ({ setUserRole }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getTabFromPath = (path) => {
        const parts = path.split('/');
        if (path.includes('/offer/create')) return 'create-offer';
        if (path.includes('/candidates')) return 'candidates';
        if (parts[parts.length - 1] === 'company' || parts[parts.length - 1] === 'dashboard') return 'dashboard';
        return parts[parts.length - 1];
    };

    const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    // ★ RESPONSIVE: drives the mobile sidebar drawer (open/close)
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [recentApplications, setRecentApplications] = useState([]);
    const [topOffers, setTopOffers] = useState([]);
    const [weeklyApplicationsData, setWeeklyApplicationsData] = useState([]);

    // ★ RESPONSIVE: auto-close drawer on route change so it doesn't stay open after nav
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    useEffect(() => {
        setActiveTab(getTabFromPath(location.pathname));
    }, [location.pathname]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const meRes = await authService.getMe();
                console.log("meRes:", meRes);
                setUserData({ ...meRes });

                // Fetch dashboard stats and all related data
                const dashRes = await companyService.getDashboard();
                console.log("dashRes:", dashRes);
                // setDashboardStats(dashRes.stats || dashRes);
                setDashboardStats(dashRes);

                // Extract and set recent applications from dashboard
                if (dashRes.recent_applications) {
                    setRecentApplications(dashRes.recent_applications);
                    generateWeeklyData(dashRes.recent_applications);
                }

                if (dashRes.recent_offers) {
                    setTopOffers(dashRes.recent_offers);
                }

                // Generate weekly data from applications
                if (dashRes.recent_applications) {
                    generateWeeklyData(dashRes.recent_applications);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard:", err);
                showToast("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Function to generate weekly application data
    const generateWeeklyData = (applications) => {
        const today = new Date();
        const weekData = {};
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Initialize week with 0 counts
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - i));
            const dayKey = daysOfWeek[date.getDay()];
            weekData[dayKey] = 0;
        }

        // Count applications for each day
        applications.forEach(app => {
            const appDate = new Date(app.created_at);
            const dayDiff = Math.floor((today - appDate) / (1000 * 60 * 60 * 24));

            if (dayDiff >= 0 && dayDiff < 7) {
                const dayKey = daysOfWeek[appDate.getDay()];
                weekData[dayKey]++;
            }
        });

        // Convert to array format for chart
        const chartData = daysOfWeek.map(day => ({
            day,
            h: Math.min(weekData[day] * 10, 80) // Scale height (max 80px)
        }));

        setWeeklyApplicationsData(chartData);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUserRole('public');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="company-dashboard" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100vw',
                height: '100vh',
                backgroundColor: '#080a0c',
                color: '#fff',
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0
            }}>
                <div className="custom-loader" style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid rgba(158, 89, 255, 0.1)',
                    borderTop: '4px solid #9e59ff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <h3 style={{ marginTop: '24px', color: '#fff', fontSize: '18px', fontWeight: '600' }}>Loading Dashboard...</h3>
                <p style={{ marginTop: '8px', color: '#8b92a5', fontSize: '14px' }}>Connecting to secure server at localhost:8000</p>
            </div>
        );
    }

    return (
        <div className="company-dashboard">
            {/* ★ RESPONSIVE: hamburger button — CSS hides it on desktop, shows it ≤900px */}
            <button
                className="company-sidebar-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
            >
                <Menu size={22} />
            </button>

            {/* ★ RESPONSIVE: dimming backdrop, click anywhere to close drawer */}
            {sidebarOpen && (
                <div
                    className="company-sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ★ RESPONSIVE: wrapper that turns the static sidebar into a slide-in drawer.
                The `.open` class is what the CSS animates via translateX */}
            <div className={`company-sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
                <CompanySidebar activePath={activeTab} />
            </div>

            {/* 2. Main Content Area */}
            <div className="company-main">
                <main className={`main-content-scroll ${activeTab !== 'dashboard' ? 'full-width-scroll' : ''}`}>
                    {activeTab === 'dashboard' ? (
                        <>
                            {/* Summary Header */}
                            <header className="dashboard-summary-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="welcome-section">
                                    <h2>Welcome back, {userData?.profile?.company_name || 'Partner'}! 👋</h2>
                                    <p>You have <strong>{dashboardStats?.stats?.total_applications || 0} total applications</strong> today.</p>
                                </div>
                            </header>

                            {/* Stat Cards */}
                            <motion.div
                                className="stats-row"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <motion.div className="stat-pille" whileHover={{ translateY: -5 }}>
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(158, 89, 255, 0.15)', color: '#9e59ff' }}>
                                            <Briefcase size={24} />
                                        </div>
                                        <span className="trend-badge">+{dashboardStats?.active_offers || 0}</span>
                                    </div>
                                    <span className="stat-label">Active Offers</span>
                                    <span className="stat-value">{dashboardStats?.stats?.active_offers || 0}</span>
                                </motion.div>
                                <div className="stat-pille">
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(255, 27, 144, 0.15)', color: '#ff1b90' }}>
                                            <Users size={24} />
                                        </div>
                                        <span className="trend-badge" style={{ color: '#ff1b90', background: 'rgba(255, 27, 144, 0.1)' }}>Total</span>
                                    </div>
                                    <span className="stat-label">Total Applications</span>
                                    <span className="stat-value">{dashboardStats?.stats?.total_applications || 0}</span>
                                </div>
                                <div className="stat-pille">
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                            <FileText size={24} />
                                        </div>
                                        <span className="trend-badge" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>Pending</span>
                                    </div>
                                    <span className="stat-label">Pending Review</span>
                                    <span className="stat-value">{dashboardStats?.stats?.pending_review || 0}</span>
                                </div>
                                <div className="stat-pille">
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className="trend-badge" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>Hired</span>
                                    </div>
                                    <span className="stat-label">Accepted</span>
                                    <span className="stat-value">{dashboardStats?.stats?.accepted_applications || 0}</span>
                                </div>
                            </motion.div>

                            {/*Applications This Week*/}
                            <section className="applications-chart-section">
                                <div className="section-header">
                                    <h3>Applications This Week</h3>
                                </div>
                                <div className="applications-chart">

                                    <div className="chart-placeholder-box" style={{ alignItems: 'flex-end', padding: '20px 24px 0 24px' }}>
                                        {(weeklyApplicationsData.length > 0 ? weeklyApplicationsData : [
                                            { day: 'Sun', h: 30 },
                                            { day: 'Mon', h: 45 },
                                            { day: 'Tue', h: 25 },
                                            { day: 'Wed', h: 60 },
                                            { day: 'Thu', h: 80 },
                                            { day: 'Fri', h: 50 },
                                            { day: 'Sat', h: 40 },
                                        ]).map((item, i) => (
                                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                <div style={{
                                                    width: '100%',
                                                    maxWidth: '40px',
                                                    height: `${item.h * 1.2}px`,   // ← fixed pixel height, scales to 96px max
                                                    background: i === 4 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                                    borderRadius: '6px 6px 0 0',
                                                    transition: 'background 0.3s',
                                                }} />
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingBottom: '12px' }}>
                                                    {item.day}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Recent Offers */}
                            <section className="recent-offers-section">
                                <div className="section-header">
                                    <h3>Recent Offers</h3>
                                    <Link to="/dashboard/company/offers" className="view-all-link">
                                        View all <ChevronRight size={16} />
                                    </Link>
                                </div>
                                <div className="offers-list-vertical">
                                    {topOffers && topOffers.length > 0 ? (
                                        topOffers.map((offer, idx) => (
                                            <div key={idx} className="offer-wide-card">
                                                <div className="offer-main-info">
                                                    <div className="offer-title-row">
                                                        <h4>{offer.title}</h4>
                                                        <span className={`status-badge ${offer.status === 'active' ? 'active' : 'closed'}`}>
                                                            {offer.status}
                                                        </span>
                                                    </div>
                                                    <div className="offer-tags">
                                                        {/* Add relevant tags if available in backend */}
                                                    </div>
                                                    <div className="offer-stats-row">
                                                        <span><Users size={12} /> {offer.applications_count} candidates</span>
                                                        <span><TrendingUp size={12} /> {Math.round(offer.acceptance_rate)}% acceptance</span>
                                                    </div>
                                                </div>
                                                <div className="offer-actions">
                                                    <button className="btn-secondary-outline" onClick={() => navigate(`/dashboard/company/offer/${offer.id}/candidates`)}>View Candidates</button>
                                                    <button className="btn-secondary-outline" onClick={() => navigate(`/dashboard/company/offer/${offer.id}/edit`)}>Edit</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No offers yet. <Link to="/dashboard/company/offer/create">Create one</Link>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Recent Applications */}
                            <section className="recent-applications-section">
                                <div className="section-header">
                                    <h3>Recent Applications</h3>
                                    <Link to="/dashboard/company/candidates" className="view-all-link">
                                        View all <ChevronRight size={16} />
                                    </Link>
                                </div>
                                <div className="modern-table-card">
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>Candidate</th>
                                                <th>Offer</th>
                                                <th>Match Score</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentApplications && recentApplications.length > 0 ? (
                                                recentApplications.slice(0, 5).map((app, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            <div className="candidate-cell">
                                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #333, #555)', backgroundImage: app.student_photo ? `url(${app.student_photo})` : '', backgroundSize: 'cover' }}></div>
                                                                <div className="candidate-name-wrap">
                                                                    <h5>{app.student_name}</h5>
                                                                    <p>Applied {formatTime(app.created_at)}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{app.offer_title}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '50%',
                                                                    background: `conic-gradient(var(--accent-primary) 0% ${app.match_score}%, rgba(255,255,255,0.1) ${app.match_score}% 100%)`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '11px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {Math.round(app.match_score)}%
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-text ${app.status.toLowerCase()}`}>{app.status}</span>
                                                        </td>
                                                        <td>
                                                            <div className="action-circles">
                                                                <button
                                                                    className="btn-view-app"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/dashboard/company/application/${app.id}`);
                                                                    }}
                                                                >
                                                                    View
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                        No applications yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : activeTab === 'offers' ? (
                        <CompanyOffers userData={userData} />
                    ) : activeTab === 'create-offer' ? (
                        <CreateOffer userData={userData} onSuccess={() => navigate('/dashboard/company/offers')} />
                    ) : (
                        <div className="placeholder-pane" style={{ padding: '80px', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Section Coming Soon</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>We are working hard to bring you more company features.</p>
                        </div>
                    )}

                </main>
            </div>

            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="toast-notification"
                        style={{
                            position: 'fixed',
                            bottom: '24px',
                            right: '24px',
                            background: '#10b981',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                            fontWeight: '600',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <CheckCircle2 size={20} />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompanyDashboard;