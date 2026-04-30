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
import { companyService } from '../../services/api';
import CompanyOffers from './CompanyOffers';
import CompanyCandidates from './CompanyCandidates';
import CreateOffer from './CreateOffer';
import CompanySidebar from '../../components/CompanySidebar';
import CompanyNavbar from '../../components/Navbar/CompanyNavbar';
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
    // ★ RESPONSIVE: drives the mobile sidebar drawer (open/close)
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                let res = {};
                try {
                    res = await companyService.getDashboard();
                } catch(e) {
                    console.warn("Using mock data for layout");
                    res = {
                        first_name: 'Sonatrach',
                        company_name: 'Sonatrach',
                        industry: 'Energy & Oil',
                        location: 'Algiers'
                    };
                }
                setUserData(res || {});
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
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
            <div className="company-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw' }}>
                <div className="custom-loader"></div>
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
                            <header className="dashboard-summary-header">
                                <div className="welcome-section">
                                    <h2>Welcome back, {userData?.company_name || 'Partner'}! 👋</h2>
                                    <p>You have <strong>3 new applications</strong> today.</p>
                                </div>
                                <button className="post-offer-btn" onClick={() => navigate('/dashboard/company/offer/create')}>
                                    <Plus size={20} />
                                    <span>Post an Offer</span>
                                </button>
                            </header>

                            {/* Stat Cards */}
                            <div className="stats-row">
                                <div className="stat-pille">
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(158, 89, 255, 0.15)', color: '#9e59ff' }}>
                                            <Briefcase size={24} />
                                        </div>
                                        <span className="trend-badge">+1 this week</span>
                                    </div>
                                    <span className="stat-label">Active Offers</span>
                                    <span className="stat-value">4</span>
                                </div>
                                <div className="stat-pille">
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(255, 27, 144, 0.15)', color: '#ff1b90' }}>
                                            <Users size={24} />
                                        </div>
                                        <span className="trend-badge" style={{ color: '#ff1b90', background: 'rgba(255, 27, 144, 0.1)' }}>Across all offers</span>
                                    </div>
                                    <span className="stat-label">Total Applications</span>
                                    <span className="stat-value">23</span>
                                </div>
                                <div className="stat-pille">
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                            <FileText size={24} />
                                        </div>
                                        <span className="trend-badge" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>To process</span>
                                    </div>
                                    <span className="stat-label">Pending Review</span>
                                    <span className="stat-value">12</span>
                                </div>
                                <div className="stat-pille">
                                    <div className="stat-icon-row">
                                        <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className="trend-badge" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>This month</span>
                                    </div>
                                    <span className="stat-label">Accepted</span>
                                    <span className="stat-value">5</span>
                                </div>
                            </div>

                         {/*Applications This Week*/}
                             <section className="applications-chart-section">
                                <div className="section-header">
                                    <h3>Applications This Week</h3>
                                </div>
                                <div className="applications-chart">
                              
                                   <div className="chart-placeholder-box" style={{ alignItems: 'flex-end', padding: '20px 24px 0 24px' }}>
                                   {[
                                     { day: 'Sun', h: 30 },
                                     { day: 'Mon', h: 45 },
                                     { day: 'Tue', h: 25 },
                                     { day: 'Wed', h: 60 },
                                     { day: 'Thu', h: 80 },
                                     { day: 'Fri', h: 50 },
                                     { day: 'Sat', h: 40 },
                                    ].map((item, i) => (
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
                                    <div className="offer-wide-card">
                                        <div className="offer-main-info">
                                            <div className="offer-title-row">
                                                <h4>Data Scientist Intern</h4>
                                                <span className="status-badge active">Active</span>
                                            </div>
                                            <div className="offer-tags">
                                                <span className="tag-pill">PFE</span>
                                                <span className="tag-pill">4 Months</span>
                                                <span className="tag-pill">Python, SQL</span>
                                            </div>
                                            <div className="offer-stats-row">
                                                <span><Users size={12} /> 12 candidates</span>
                                                <span><TrendingUp size={12} /> Posted 2d ago</span>
                                            </div>
                                        </div>
                                        <div className="offer-actions">
                                            <button className="btn-secondary-outline" onClick={() => navigate('/dashboard/company/offer/1/candidates')}>View Candidates</button>
                                            <button className="btn-secondary-outline" onClick={() => navigate('/dashboard/company/offer/1/edit')}>Edit</button>
                                        </div>
                                    </div>

                                    <div className="offer-wide-card">
                                        <div className="offer-main-info">
                                            <div className="offer-title-row">
                                                <h4>Full Stack Dev (MERN)</h4>
                                                <span className="status-badge closed">Closed</span>
                                            </div>
                                            <div className="offer-tags">
                                                <span className="tag-pill">PFE</span>
                                                <span className="tag-pill">6 Months</span>
                                                <span className="tag-pill">React, Node.js</span>
                                            </div>
                                            <div className="offer-stats-row">
                                                <span><Users size={12} /> 45 candidates</span>
                                                <span><TrendingUp size={12} /> Expired 1w ago</span>
                                            </div>
                                        </div>
                                        <div className="offer-actions">
                                            <button className="btn-secondary-outline" onClick={() => navigate('/dashboard/company/offer/2/candidates')}>View Talent</button>
                                            <button className="btn-secondary-outline" onClick={() => navigate('/dashboard/company/offer/2/edit')}>Edit</button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Recent Applications */}
                            <section className="recent-applications-section">
                                <div className="section-header">
                                    <h3>Recent Applications</h3>
                                    <Link to="/dashboard/company/offer/1/candidates" className="view-all-link">
                                        View all <ChevronRight size={16} />
                                    </Link>
                                </div>
                                <div className="modern-table-card">
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>Candidate</th>
                                                <th>University</th>
                                                <th>Skills</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { name: 'Amira Benali', univ: 'ESI Alger', skills: ['React', 'Tailwind'], status: 'Pending', time: '2h ago' },
                                                { name: 'Yacine Meziane', univ: 'USTHB Alger', skills: ['Python', 'Django'], status: 'Pending', time: '5h ago' },
                                                { name: 'Sara Ould Ali', univ: 'University of Tlemcen', skills: ['UI/UX', 'Figma'], status: 'Accepted', time: 'Yesterday' }
                                            ].map((cand, i) => (
                                                <tr key={i}>
                                                    <td>
                                                        <div className="candidate-cell">
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #333, #555)' }}></div>
                                                            <div className="candidate-name-wrap">
                                                                <h5>{cand.name}</h5>
                                                                <p>Applied {cand.time}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{cand.univ}</td>
                                                    <td>
                                                        <div className="skill-list">
                                                            {cand.skills.map((s, j) => <span key={j} className="skill-tag">{s}</span>)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-text ${cand.status.toLowerCase()}`}>{cand.status}</span>
                                                    </td>
                                                    <td>
                                                        <div className="action-circles">
                                                            <button 
                                                                className="btn-view-app" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/dashboard/company/offer/1/application/${i + 1}`);
                                                                }}
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
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