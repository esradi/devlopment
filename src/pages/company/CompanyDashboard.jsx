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
    Folder
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { companyService } from '../../services/api';
import CompanyOffers from './CompanyOffers';
import CompanyCandidates from './CompanyCandidates';
import CreateOffer from './CreateOffer';
import CompanySidebar from '../../components/CompanySidebar';
import NotificationBell from '../../components/NotificationBell';
import './CompanyDashboard.css';

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
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    useEffect(() => {
        setActiveTab(getTabFromPath(location.pathname));
    }, [location.pathname]);

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await companyService.getDashboard();
                setUserData(res || {});
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.message || String(err));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    if (error) {
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
                textAlign: 'center',
                padding: '40px',
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0
            }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔌</div>
                <h2 style={{ color: '#ff1b90', marginBottom: '16px', fontSize: '28px' }}>Connectivity Issue</h2>
                <p style={{ color: '#8b92a5', marginBottom: '12px', maxWidth: '450px', lineHeight: '1.6' }}>
                    We encountered an issue connecting to the server.
                </p>
                <div style={{ 
                    background: 'rgba(255,27,144,0.1)', 
                    padding: '12px 20px', 
                    borderRadius: '8px', 
                    color: '#ff1b90', 
                    fontSize: '13px', 
                    fontFamily: 'monospace',
                    marginBottom: '32px',
                    border: '1px solid rgba(255,27,144,0.2)'
                }}>
                    Error Code: {error}
                </div>
                <p style={{ color: '#8b92a5', marginBottom: '32px', fontSize: '14px' }}>
                    Ensure backend is running at <strong>http://localhost:8000</strong>
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '14px 32px',
                            background: 'linear-gradient(90deg, #9e59ff, #ff1b90)',
                            border: 'none',
                            borderRadius: '30px',
                            color: '#fff',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(255, 27, 144, 0.3)'
                        }}
                    >
                        Retry Connection
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            padding: '14px 32px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '30px',
                            color: '#fff',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const dashboardStats = userData?.stats || {};

    return (
        <div className="company-dashboard">
            {/* 1. Sidebar (Navbar) */}
            <CompanySidebar activePath={activeTab} />

            {/* 2. Main Content Area */}
            <div className="company-main">
                <main className={`main-content-scroll ${activeTab !== 'dashboard' ? 'full-width-scroll' : ''}`}>
                    {activeTab === 'dashboard' ? (
                        <>
                            {/* Summary Header */}
                            <header className="dashboard-summary-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="welcome-section">
                                    <h2>Welcome back, {userData?.company_name || 'Partner'}! 👋</h2>
                                    <p>You have <strong>{dashboardStats.new_applications_today || 0} new applications</strong> today.</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <NotificationBell />
                                    <button className="post-offer-btn" onClick={() => navigate('/dashboard/company/offer/create')}>
                                        <Plus size={20} />
                                        <span>Post an Offer</span>
                                    </button>
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
                                        <span className="trend-badge">Active</span>
                                    </div>
                                    <span className="stat-label">Active Offers</span>
                                    <span className="stat-value">{dashboardStats.active_offers || 0}</span>
                                </motion.div>
                                <motion.div className="stat-pille" whileHover={{ translateY: -5 }}>
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(255, 27, 144, 0.15)', color: '#ff1b90' }}>
                                            <Users size={24} />
                                        </div>
                                        <span className="trend-badge" style={{ color: '#ff1b90', background: 'rgba(255, 27, 144, 0.1)' }}>Total</span>
                                    </div>
                                    <span className="stat-label">Total Applications</span>
                                    <span className="stat-value">{dashboardStats.total_applications || 0}</span>
                                </motion.div>
                                <motion.div className="stat-pille" whileHover={{ translateY: -5 }}>
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                            <FileText size={24} />
                                        </div>
                                        <span className="trend-badge" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>Pending</span>
                                    </div>
                                    <span className="stat-label">Pending Review</span>
                                    <span className="stat-value">{dashboardStats.pending_review || 0}</span>
                                </motion.div>
                                <motion.div className="stat-pille highlight-success" whileHover={{ translateY: -5 }}>
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className="trend-badge" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>Hired</span>
                                    </div>
                                    <span className="stat-label">Accepted</span>
                                    <span className="stat-value">{dashboardStats.accepted_applications || 0}</span>
                                </motion.div>
                            </motion.div>

                            {/* Recent Offers */}
                            <section className="recent-offers-section">
                                <div className="section-header">
                                    <h3>Recent Offers</h3>
                                    <Link to="/dashboard/company/offers" className="view-all-link">
                                        View all <ChevronRight size={16} />
                                    </Link>
                                </div>
                                <div className="offers-list-vertical">
                                    {userData?.recent_offers?.length > 0 ? (
                                        userData.recent_offers.map((offer) => (
                                            <div key={offer.id} className="offer-wide-card">
                                                <div className="offer-main-info">
                                                    <div className="offer-title-row">
                                                        <h4>{offer.title}</h4>
                                                        <span className={`status-badge ${offer.status?.toLowerCase()}`}>{offer.status}</span>
                                                    </div>
                                                    <div className="offer-tags">
                                                        {offer.offer_types?.map((t, idx) => <span key={idx} className="tag-pill">{t.name}</span>)}
                                                        {offer.durations?.map((d, idx) => <span key={idx} className="tag-pill">{d.months} Months</span>)}
                                                    </div>
                                                    <div className="offer-stats-row">
                                                        <span><Users size={12} /> {offer.applicants_count || 0} candidates</span>
                                                        <span><TrendingUp size={12} /> Posted {new Date(offer.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="offer-actions">
                                                    <button className="btn-secondary-outline" onClick={() => navigate(`/dashboard/company/offer/${offer.id}/candidates`)}>View Candidates</button>
                                                    <button className="btn-secondary-outline" onClick={() => navigate(`/dashboard/company/offer/${offer.id}/edit`)}>Edit</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state-small">No recent offers.</div>
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
                                            {userData?.recent_applications?.length > 0 ? (
                                                userData.recent_applications.map((app) => (
                                                    <tr key={app.id}>
                                                        <td>
                                                            <div className="candidate-cell">
                                                                <img 
                                                                    src={app.student?.profile_picture || `https://ui-avatars.com/api/?name=${app.student?.first_name}+${app.student?.last_name}&background=9e59ff&color=fff`} 
                                                                    alt="avatar" 
                                                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                                />
                                                                <div className="candidate-name-wrap">
                                                                    <h5>{app.student?.first_name} {app.student?.last_name}</h5>
                                                                    <p>{app.student?.university || 'University'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{app.offer_title}</td>
                                                        <td>
                                                            <span className="match-score text-pink" style={{ fontWeight: 'bold' }}>{app.match_score}%</span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-text ${app.status?.toLowerCase()}`}>{app.status}</span>
                                                        </td>
                                                        <td>
                                                            <div className="action-circles">
                                                                <button 
                                                                    className="btn-view-app" 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/dashboard/company/offer/${app.offer}/application/${app.id}`);
                                                                    }}
                                                                >
                                                                    View
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No recent applications.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : activeTab === 'offers' ? (
                        <CompanyOffers userData={userData} />
                    ) : activeTab === 'candidates' ? (
                        <CompanyCandidates userData={userData} />
                    ) : activeTab === 'create-offer' ? (
                        <CreateOffer userData={userData} onSuccess={() => navigate('/dashboard/company/offers')} />
                    ) : (
                        <div className="placeholder-pane" style={{ padding: '80px', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Section Coming Soon</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>We are working hard to bring you more company features.</p>
                        </div>
                    )}
                </main>

                {/* 3. Right Sidebar Panel */}
                {activeTab === 'dashboard' && (
                    <aside className="company-right-panel">
                        <div className="profile-preview-card">
                            <div className="company-large-icon">
                                {userData?.company_name ? userData.company_name[0] : 'S'}
                            </div>
                            <h3>{userData?.company_name || 'Sonatrach'} <Shield size={18} color="#10b981" fill="#10b981" /></h3>
                            <p>{userData?.industry || 'Energy & Oil'} • {userData?.location || 'Algiers'}</p>
                            
                            <div className="strength-wrap">
                                <div className="completion-header">
                                    <span style={{ color: 'var(--text-secondary)' }}>Profile Strength</span>
                                    <span style={{ color: 'var(--accent-primary)' }}>75%</span>
                                </div>
                                <div className="progress-bar-container">
                                    <div className="progress-bar-fill" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <button 
                                className="btn-full-outline"
                                onClick={() => navigate('/dashboard/company/complete-profile')}
                            >
                                Complete Profile
                            </button>
                        </div>

                        <div className="quick-actions-section">
                            <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Quick Actions</h4>
                            <div className="quick-actions-grid">
                                <div className="action-pille" onClick={() => navigate('/dashboard/company/offer/create')}>
                                    <Plus size={20} color={'var(--accent-secondary)'} />
                                    <span>New Offer</span>
                                </div>
                                <div className="action-pille" onClick={() => setActiveTab('offers')}>
                                    <Briefcase size={20} color={'var(--accent-primary)'} />
                                    <span>My Offers</span>
                                </div>
                                <div className="action-pille" onClick={() => navigate('/dashboard/company/messages')}>
                                    <MessageSquare size={20} color="#00f2fe" />
                                    <span>Messages</span>
                                </div>
                                <div className="action-pille" onClick={() => navigate('/dashboard/company/offer/1/candidates')}>
                                    <Users size={20} color={'var(--success)'} />
                                    <span>Applications</span>
                                </div>
                            </div>
                        </div>

                        <div className="applications-chart">
                            <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Applications This Week</h4>
                            <div className="chart-placeholder-box">
                                {/* Simplified Bar Chart visualization */}
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '100px' }}>
                                    {[30, 45, 25, 60, 80, 50, 40].map((h, i) => (
                                        <div key={i} style={{ 
                                            width: '12px', 
                                            height: `${h}%`, 
                                            background: i === 4 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                            borderRadius: '4px 4px 0 0'
                                        }}></div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
                                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                            </div>
                        </div>

                        <div className="activity-section">
                            <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Recent Activity</h4>
                            <div className="activity-feed">
                                <div className="activity-item">
                                    <div className="activity-dot" style={{ background: 'var(--accent-primary)' }}></div>
                                    <div className="activity-meta">
                                        <h5>New application received</h5>
                                        <p>Amira Benali applied for Data Scientist</p>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>2 minutes ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-dot" style={{ background: 'var(--success)' }}></div>
                                    <div className="activity-meta">
                                        <h5>Candidate Accepted</h5>
                                        <p>Sara Ould Ali accepted the interview invite</p>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>3 hours ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
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
