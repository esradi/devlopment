import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Briefcase,
    Send,
    Heart,
    MessageSquare,
    Settings,
    Search,
    Bell,
    LogOut,
    MapPin,
    Calendar,
    ExternalLink,
    ChevronRight,
    TrendingUp,
    User,
    Zap,
    Clock,
    AlertCircle,
    FileText,
    CheckCircle2,
    Info,
    CheckCircle,
    Loader2,
    Plus,
    Target,
    BarChart3
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { studentService, applicationService, offerService } from '../../services/api';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import StudentOffers from './StudentOffers';
import StudentApplications from './StudentApplications';
import StudentFavorites from './StudentFavorites';
import StudentMessages from './StudentMessages';
import StudentSettings from './StudentSettings';
import CompleteProfile from './CompleteProfile';
import StudentChallenges from './StudentChallenges';
import StudentAnalytics from './StudentAnalytics';
import './StudentDashboard.css';

const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'TBD' : date.toLocaleDateString();
};

const StudentDashboard = ({ setUserRole }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Sync activeTab with URL
    const getTabFromPath = (path) => {
        const parts = path.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart === 'student' || lastPart === 'dashboard') return 'dashboard';
        return lastPart;
    };

    const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));
    const [hoveredMatch, setHoveredMatch] = useState(null);
    const [matchBreakdown, setMatchBreakdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [recentApps, setRecentApps] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleMockApply = async (offer) => {
        try {
            await applicationService.apply(offer.id);
            showToast(`Successfully applied to ${offer.company_name || 'this offer'}!`);
            // Refresh applications array
            const apps = await applicationService.getMine();
            setRecentApps(apps || []);
        } catch (error) {
            showToast(`Failed to apply: ${error.message || 'Unknown error'}`);
        }
    };

    const handleToggleFavorite = async (offerId) => {
        try {
            const result = await offerService.toggleFavorite(offerId);
            setRecommendations(prev => prev.map(o => {
                if (o.id === offerId) {
                    return { ...o, is_favorite: result.is_favorite };
                }
                return o;
            }));
            showToast(result.is_favorite ? "Added to favorites" : "Removed from favorites");
        } catch (error) {
            showToast("Failed to toggle favorite");
        }
    };

    useEffect(() => {
        setActiveTab(getTabFromPath(location.pathname));
    }, [location.pathname]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileRes, dashboardRes, appsRes] = await Promise.all([
                    studentService.getProfile(),
                    studentService.getDashboard(),
                    applicationService.getMine()
                ]);

                // Combine into a usable userData state unifying the stats
                setUserData({
                    ...profileRes,
                    dashboardStats: dashboardRes?.stats || {},
                    recentActivity: dashboardRes?.recent_activity || [],
                    completeness: dashboardRes?.profile_completeness || 0
                });
                setRecentApps(appsRes || []);
                setRecommendations(dashboardRes?.recommended_offers || []);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                if (err.message.includes('401')) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchBreakdown = async (offerId) => {
        // Now using actual DB breakdown if possible
        // Actually, backend /student/recommendations/ already returns score_breakdown. Let's see if we can use that instead of fetching.
        const recommendation = recommendations.find(r => r.id === offerId);
        if (recommendation && recommendation.score_breakdown) {
            setMatchBreakdown(recommendation.score_breakdown);
        } else {
            setMatchBreakdown(null);
        }
    };

    const handleMatchHover = (offerId) => {
        setHoveredMatch(offerId);
        if (offerId) {
            fetchBreakdown(offerId);
        } else {
            setMatchBreakdown(null);
        }
    };

    const stats = [
        {
            label: 'Active Offers',
            value: (recommendations || []).length > 0 ? (recommendations || []).length : '...',
            change: '+12% new',
            positive: true,
            icon: <Briefcase size={20} color="#9e59ff" />
        },
        {
            label: 'Applications',
            value: userData?.dashboardStats?.total_applications || '0',
            change: `${userData?.dashboardStats?.pending_applications || '0'} pending`,
            positive: true,
            icon: <Send size={20} color="#db2777" />
        },
        {
            label: 'Offers Accepted',
            value: userData?.dashboardStats?.accepted_applications || '0',
            change: 'Accepted/Received',
            positive: true,
            icon: <Zap size={20} color="#9e59ff" />
        },
        {
            label: 'Verified Skills',
            value: userData?.dashboardStats?.verified_skills || '0',
            change: `of ${userData?.dashboardStats?.total_skills || '0'} total skills`,
            positive: true,
            icon: <CheckCircle2 size={20} color="#10b981" />
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUserRole('public');
        navigate('/login');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="dashboard-loading" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff' }}>
                <div className="custom-loader"></div>
                <p style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: '500', letterSpacing: '1px' }}>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="student-dashboard">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div
                        className="user-context"
                        style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                        onClick={() => navigate('/dashboard/student/complete-profile')}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <img src={userData?.profile?.profile_picture || `https://ui-avatars.com/api/?name=${userData?.first_name}+${userData?.last_name}&background=9e59ff&color=fff`} alt="Profile" className="user-avatar-mini" />
                        <div>
                            <h4>{userData?.first_name || 'Guest'} {userData?.last_name || ''}</h4>
                            <p>Student Portal / {userData?.completeness > 80 ? 'Active Applicant' : 'New Member'}</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard/student" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/dashboard/student/offers" className={`nav-item ${activeTab === 'offers' ? 'active' : ''}`}>
                        <Briefcase size={20} />
                        <span>My Offers</span>
                    </Link>
                    <Link to="/dashboard/student/applications" className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}>
                        <Send size={20} />
                        <span>My Applications</span>
                    </Link>
                    <Link to="/dashboard/student/favorites" className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}>
                        <Heart size={20} />
                        <span>Favorites</span>
                    </Link>
                    <Link to="/dashboard/student/challenges" className={`nav-item ${activeTab === 'challenges' ? 'active' : ''}`}>
                        <Target size={20} />
                        <span>Skill Challenges</span>
                    </Link>
                    <Link to="/dashboard/student/analytics" className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}>
                        <BarChart3 size={20} />
                        <span>Analytics</span>
                    </Link>
                    <Link to="/dashboard/student/messages" className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}>
                        <MessageSquare size={20} />
                        <span>Messages</span>
                    </Link>
                    <Link to="/dashboard/student/settings" className={`nav-item ${activeTab === 'settings' || activeTab === 'complete-profile' ? 'active' : ''}`}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button className="btn-post-resume" onClick={() => showToast("Resume uploaded successfully! (Mock)")}>
                        <Plus size={18} />
                        <span>Post Resume</span>
                    </button>
                    <button onClick={handleLogout} className="nav-item logout" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', paddingLeft: '1.5rem' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                    <Link to="#" className="nav-item" style={{ paddingLeft: '1.5rem' }} onClick={(e) => { e.preventDefault(); showToast("Opening Help Center..."); }}>
                        <Info size={20} />
                        <span>Help</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main" style={['offers', 'applications', 'favorites', 'messages', 'settings', 'complete-profile', 'challenges', 'analytics'].includes(activeTab) ? { padding: '110px 0 0 0' } : {}}>
                {activeTab === 'dashboard' ? (
                    <>
                        <header className="dashboard-header">
                            <div className="search-bar">
                                <Search className="search-icon" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search for internships, companies, roles..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') showToast(`Searching for "${e.target.value}"...`);
                                    }}
                                />
                            </div>
                        </header>

                        <section className="welcome-section">
                            <h1>Welcome back, {userData?.first_name || 'Student'}! 👋</h1>
                            <p>Find the perfect internship to launch your career. Explore our latest matching opportunities.</p>
                        </section>

                        {/* Stats Grid */}
                        <motion.div
                            className="stats-grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {stats.map((stat, index) => (
                                <motion.div key={index} className={`stat-card ${stat.label === 'MATCH SCORE' ? 'highlight' : ''}`} variants={itemVariants}>
                                    <div className="stat-header">
                                        <span>{stat.label}</span>
                                        {stat.icon}
                                    </div>
                                    <div className={`stat-value ${stat.label === 'MATCH SCORE' ? 'text-glow' : ''}`}>{stat.value}</div>
                                    <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                                        {stat.change}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="dashboard-content-layout">
                            {/* Recommendations */}
                            <section className="recommendations">
                                <div className="section-title">
                                    <h2>Recommended for you</h2>
                                    <Link to="#" className="view-all" onClick={(e) => { e.preventDefault(); navigate('/dashboard/student/offers'); }}>View all recommendations</Link>
                                </div>
                                <div className="offer-list">
                                    {(recommendations || []).map((offer) => (
                                        <motion.div key={offer.id} className="offer-card" whileHover={{ scale: 1.01 }}>
                                            <div className="company-logo">
                                                {offer.company_logo ? (
                                                    <img src={offer.company_logo} alt={offer.company_name} style={{ width: '30px' }} />
                                                ) : (
                                                    <div className="logo-placeholder" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                                        {offer.company_name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="offer-info">
                                                <div className="offer-tags">
                                                    {offer.offer_types?.map((type, i) => (
                                                        <span key={i} className={`tag ${i === 0 ? 'pfe' : 'intern'}`}>{type.name}</span>
                                                    ))}
                                                    {offer.durations?.map((d, i) => (
                                                        <span key={`d-${i}`} className="tag intern">{d.months} months</span>
                                                    ))}
                                                </div>
                                                <h3>{offer.title}</h3>
                                                <div className="offer-meta">
                                                    <span><MapPin size={14} style={{ marginRight: '4px' }} /> {offer.wilaya || 'Algeria'}</span>
                                                    <span><Calendar size={14} style={{ marginRight: '4px' }} /> Starts: {formatDate(offer.created_at)}</span>
                                                    <span><Clock size={14} style={{ marginRight: '4px' }} /> {offer.durations && offer.durations.length > 0 ? `${offer.durations[0].months} months` : 'TBD'}</span>
                                                </div>
                                                <div
                                                    className="offer-match"
                                                    onMouseEnter={() => handleMatchHover(offer.id)}
                                                    onMouseLeave={() => handleMatchHover(null)}
                                                >
                                                    <span style={{ fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        Match score <Info size={12} style={{ cursor: 'help', color: '#8892b0' }} />
                                                    </span>
                                                    <div className="match-bar">
                                                        <div className="match-fill" style={{ width: `${offer.match_score || 0}%` }}></div>
                                                    </div>
                                                    <span style={{ color: '#9e59ff', fontWeight: '700' }}>{offer.match_score || 0}%</span>

                                                    <AnimatePresence>
                                                        {hoveredMatch === offer.id && matchBreakdown && (
                                                            <motion.div
                                                                className="match-tooltip"
                                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                <h4>Match Breakdown</h4>
                                                                <ul>
                                                                    <li><CheckCircle2 size={12} className="text-green" /> Speciality <span>+{matchBreakdown.breakdown.speciality * matchBreakdown.weights.speciality}%</span></li>
                                                                    <li><CheckCircle2 size={12} className="text-green" /> Skills <span>+{matchBreakdown.breakdown.skills * matchBreakdown.weights.skills}%</span></li>
                                                                    <li><CheckCircle2 size={12} className="text-green" /> Challenges <span>+{matchBreakdown.breakdown.challenges * matchBreakdown.weights.challenges}%</span></li>
                                                                    <li><CheckCircle2 size={12} className="text-green" /> Location <span>+{matchBreakdown.breakdown.location * matchBreakdown.weights.location}%</span></li>
                                                                </ul>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                            <div className="offer-actions">
                                                <button className="btn-details" onClick={() => navigate(`/dashboard/student/offer/${offer.id}`)}>Details</button>
                                                <button className="btn-apply" disabled={recentApps.some(a => a.offer === offer.id)} onClick={() => handleMockApply(offer)}>
                                                    {recentApps.some(a => a.offer === offer.id) ? 'Applied' : 'Apply Now'}
                                                </button>
                                            </div>
                                            <Heart
                                                size={20}
                                                className="favorite-icon"
                                                onClick={() => handleToggleFavorite(offer.id)}
                                                style={{ position: 'absolute', right: '20px', top: '20px', color: offer.is_favorite ? '#ff1b90' : '#8892b0', cursor: 'pointer', transition: 'transform 0.2s', transform: offer.is_favorite ? 'scale(1.1)' : 'scale(1)' }}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* Right Panel */}
                            <aside className="right-panel">
                                <div className="profile-strength-card">
                                    <div className="strength-circle">
                                        <svg width="120" height="120">
                                            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                                            <circle
                                                cx="60" cy="60" r="54" fill="none" stroke="url(#gradient)" strokeWidth="12"
                                                strokeDasharray="339.29" strokeDashoffset={339.29 * (1 - (userData?.completeness || 0) / 100)}
                                                strokeLinecap="round"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#9e59ff" />
                                                    <stop offset="100%" stopColor="#ff1b90" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="percentage">{userData?.completeness || 0}%</div>
                                    </div>
                                    <h3>Profile Strength: {userData?.completeness > 70 ? 'Solid' : 'In Progress'}</h3>
                                    <p style={{ color: '#8892b0', fontSize: '14px', marginBottom: '24px' }}>
                                        {userData?.completeness > 70 ? 'You\'ve unlocked the "Rising Star" badge!' : 'Complete your profile to unlock more opportunities.'}
                                    </p>
                                    <button
                                        className="btn-secondary-dark"
                                        style={{ width: '100%', cursor: 'pointer' }}
                                        onClick={() => navigate('/dashboard/student/complete-profile')}
                                    >
                                        Complete Profile
                                    </button>
                                </div>

                                {/* P1: Visual Kanban Pipeline */}
                                <div className="recent-apps-card">
                                    <div className="section-title">
                                        <h2>Active Pipeline</h2>
                                        <Link to="/dashboard/student/applications" className="view-all">View all</Link>
                                    </div>
                                    <div className="pipeline-container">
                                        {(recentApps || []).slice(0, 4).map((app) => {
                                            const states = ['Applied', 'Review', 'Interview', 'Offer'];
                                            let currentIndex = 0;
                                            if (app.status === 'under review') currentIndex = 1;
                                            if (app.status === 'interview') currentIndex = 2;
                                            if (app.status === 'accepted') currentIndex = 3;

                                            return (
                                                <div key={app.id} className="pipeline-item">
                                                    <div className="pipeline-item-header">
                                                        <div className="pipeline-company-info">
                                                            <h4>{app.company_name}</h4>
                                                            <span className="pipeline-role">{app.offer_title}</span>
                                                        </div>
                                                        <span className="pipeline-date">{formatDate(app.created_at)}</span>
                                                    </div>
                                                    <div className="pipeline-steps">
                                                        {states.map((state, idx) => (
                                                            <div key={state} className={`pipeline-step ${idx <= currentIndex ? 'completed' : ''} ${idx === currentIndex ? 'current' : ''}`}>
                                                                <div className="step-dot">
                                                                    {idx <= currentIndex && <CheckCircle size={10} />}
                                                                </div>
                                                                <span className="step-label">{state}</span>
                                                                {idx < states.length - 1 && <div className="step-line"></div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </>
                ) : activeTab === 'offers' ? (
                    <StudentOffers
                        userData={userData}
                        recommendations={recommendations}
                        recentApps={recentApps}
                        handleMatchHover={handleMatchHover}
                        hoveredMatch={hoveredMatch}
                        matchBreakdown={matchBreakdown}
                        onApply={handleMockApply}
                        onToggleFavorite={handleToggleFavorite}
                        showToast={showToast}
                    />
                ) : activeTab === 'applications' ? (
                    <StudentApplications
                        recentApps={recentApps}
                        setRecentApps={setRecentApps}
                    />
                ) : activeTab === 'favorites' ? (
                    <StudentFavorites
                        recommendations={recommendations}
                        recentApps={recentApps}
                        onToggleFavorite={handleToggleFavorite}
                        onApply={handleMockApply}
                    />
                ) : activeTab === 'messages' ? (
                    <StudentMessages
                        userData={userData}
                    />
                ) : activeTab === 'challenges' ? (
                    <StudentChallenges
                        userData={userData}
                    />
                ) : activeTab === 'analytics' ? (
                    <StudentAnalytics
                        userData={userData}
                    />
                ) : activeTab === 'settings' ? (
                    <StudentSettings
                        userData={userData}
                    />
                ) : activeTab === 'complete-profile' ? (
                    <CompleteProfile
                        userData={userData}
                        onSave={() => navigate('/dashboard/student')}
                    />
                ) : (
                    <div className="placeholder-pane">
                        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h2>
                        <p style={{ color: '#8892b0' }}>Coming soon</p>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
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

export default StudentDashboard;
