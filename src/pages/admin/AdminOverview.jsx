import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Briefcase, 
    ClipboardList, 
    CheckCircle,
    ArrowRight,
    CheckSquare,
    FileText,
    Zap,
    Loader2,
    ChevronRight,
    Award,
    BarChart2,
    Search,
    Filter,
    X,
    Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import './AdminDashboard.css';

const AdminOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [searchError, setSearchError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                console.log("Fetching admin dashboard stats...");
                const res = await adminService.getDashboard();
                console.log("Admin Dashboard Data:", res);
                
                // Store the entire response object so we have access to 
                // stats, recent_companies, and recent_activities
                setStats(res);
                
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.length >= 1) {
            setIsSearching(true);
            console.log("🚀 Sending search request for:", query);
            setSearchError(null);
            try {
                const results = await adminService.search(query);
                console.log("✅ Search Results received:", results);
                setSearchResults(results);
            } catch (err) {
                console.error("❌ Search failed error:", err);
                setSearchError(err.message || "Unknown search error");
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults(null);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
    };

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#9e59ff" />
            </div>
        );
    }

    return (
        <div className="admin-dashboard-grid">
            <div className="dashboard-main-col">
                <div className="dashboard-header-text" style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>University Dashboard</h1>
                            <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>Welcome back, Admin. Here is the overview of your university's internship activity.</p>
                        </div>
                        
                        <div className="admin-search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '450px', zIndex: 2000 }}>
                            <div className="search-input-container">
                                <Search size={18} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search students, companies, or users..." 
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay for click handling
                                />
                                {isSearching ? (
                                    <Loader2 size={18} className="animate-spin clear-icon" />
                                ) : searchQuery && (
                                    <X size={18} className="clear-icon" onClick={clearSearch} />
                                )}
                            </div>
                            
                            {(isFocused || searchQuery) && (
                                <div className="search-results-dropdown">
                                    {isSearching ? (
                                        <div className="search-no-results">Searching...</div>
                                    ) : (
                                        <>
                                            {searchResults?.users?.length > 0 && (
                                                <div className="search-category">
                                                    <span className="category-title">Users</span>
                                                    {searchResults.users.map(u => (
                                                        <div key={u.id} className="search-item" onClick={() => navigate(`/dashboard/admin/users/${u.id}`)}>
                                                            <Users size={14} />
                                                            <div className="item-info-stack">
                                                                <span className="item-primary-text">{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : u.email.split('@')[0]}</span>
                                                                <span className="item-secondary-text">{u.email} • {u.role}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {searchResults?.companies?.length > 0 && (
                                                <div className="search-category">
                                                    <span className="category-title">Companies</span>
                                                    {searchResults.companies.map(c => (
                                                        <div key={c.id} className="search-item" onClick={() => navigate(`/dashboard/admin/companies`)}>
                                                            <Building2 size={14} />
                                                            <div className="item-info-stack">
                                                                <span className="item-primary-text">{c.company_name}</span>
                                                                <span className="item-secondary-text">{c.email || c.industry}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {searchResults?.students?.length > 0 && (
                                                <div className="search-category">
                                                    <span className="category-title">Students</span>
                                                    {searchResults.students.map(s => (
                                                        <div key={s.id} className="search-item" onClick={() => navigate(`/dashboard/admin/students`)}>
                                                            <Users size={14} />
                                                            <div className="item-info-stack">
                                                                <span className="item-primary-text">{s.name}</span>
                                                                <span className="item-secondary-text">{s.email} • {s.spec}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {(!searchResults || (!searchResults.users?.length && !searchResults.companies?.length && !searchResults.students?.length)) && searchQuery.length >= 1 && (
                                                <div className="search-no-results">No results found for "{searchQuery}"</div>
                                            )}
                                            {searchQuery.length === 0 && (
                                                <div className="search-no-results">Start typing to search...</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <motion.div 
                    className="admin-stats-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <motion.div 
                        className="admin-stat-card clickable" 
                        whileHover={{ translateY: -5 }}
                        onClick={() => navigate('/dashboard/admin/students')}
                    >
                        <div className="stat-header">
                            <div className="stat-icon-wrapper purple-bg">
                                <Users size={18} color="#9e59ff" />
                            </div>
                            <span className="stat-badge green">Total User</span>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">TOTAL STUDENTS</span>
                            <h3>{stats?.stats?.users?.students ?? stats?.users?.students ?? 0}</h3>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="admin-stat-card clickable" 
                        whileHover={{ translateY: -5 }}
                        onClick={() => navigate('/dashboard/admin/validation')}
                    >
                        <div className="stat-header">
                            <div className="stat-icon-wrapper pink-bg">
                                <Briefcase size={18} color="#ff1b90" />
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">ACTIVE OFFERS</span>
                            <h3>{stats?.stats?.offers?.active ?? stats?.offers?.active ?? 0}</h3>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="admin-stat-card clickable" 
                        whileHover={{ translateY: -5 }}
                        onClick={() => navigate('/dashboard/admin/validation')}
                    >
                        <div className="stat-header">
                            <div className="stat-icon-wrapper orange-bg">
                                <ClipboardList size={18} color="#f59e0b" />
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">PENDING VALIDATIONS</span>
                            <h3>{stats?.stats?.validations?.pending ?? stats?.validations?.pending ?? 0}</h3>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="admin-stat-card clickable" 
                        whileHover={{ translateY: -5 }}
                        onClick={() => navigate('/dashboard/admin/internships')}
                    >
                        <div className="stat-header">
                            <div className="stat-icon-wrapper green-bg">
                                <CheckCircle size={18} color="#10b981" />
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">ACCEPTED INTERNS</span>
                            <h3>
                                {stats?.stats?.applications?.accepted ?? 0}
                                <span className="stat-subtext"> of {stats?.stats?.applications?.total ?? 0} apps</span>
                            </h3>
                        </div>
                    </motion.div>
                </motion.div>

                {error && (
                    <div className="connection-error-banner" style={{ 
                        background: 'rgba(255, 59, 48, 0.1)', 
                        border: '1px solid rgba(255, 59, 48, 0.2)', 
                        padding: '12px 20px', 
                        borderRadius: '12px',
                        color: '#ff3b30',
                        marginBottom: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px'
                    }}>
                        <span style={{ fontWeight: 700 }}>Connection Error:</span> {error}. Showing fallback data.
                    </div>
                )}

                {/* Top Partner Companies */}
                <div className="dashboard-section">
                    <div className="section-title-row">
                        <div>
                            <h3>Top Partner Companies</h3>
                            <p className="section-subtitle">Most active industry partners this academic year</p>
                        </div>
                        <a href="#" className="view-all-link">View All Partners</a>
                    </div>

                    <div className="partners-grid">
                        {stats?.recent_companies?.length > 0 ? (
                            stats.recent_companies.map((company, idx) => (
                                <div className="partner-card clickable" key={idx} onClick={() => navigate('/dashboard/admin/companies')}>
                                    <div className="partner-info">
                                        <div className="partner-logo">
                                            {company.logo ? (
                                                <img src={company.logo} alt="" style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
                                            ) : (
                                                company.company_name?.charAt(0) || 'C'
                                            )}
                                        </div>
                                        <div>
                                            <h4>{company.company_name}</h4>
                                            <span>{company.industry || 'Industry Partner'}</span>
                                        </div>
                                    </div>
                                    <button className="partner-arrow-btn">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <Briefcase size={24} style={{ marginBottom: '10px' }} />
                                <p>No partner companies registered yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Student Status Distribution */}
                <div className="dashboard-section distribution-section">
                    <h3>Student Status Distribution</h3>
                    <div className="distribution-bars">
                        <div className="dist-item clickable" onClick={() => navigate('/dashboard/admin/students')}>
                            <div className="dist-header">
                                <div className="dist-label"><span className="dot pink"></span>Searching</div>
                                <span className="dist-percent">{stats?.stats?.distribution?.searching ?? stats?.distribution?.searching ?? 0}</span>
                            </div>
                            <div className="dist-bar-bg">
                                <div className="dist-bar-fill pink-gradient" style={{width: `${( (stats?.stats?.distribution?.searching ?? stats?.distribution?.searching ?? 0) / ( (stats?.stats?.users?.students ?? stats?.users?.students ?? 1) || 1)) * 100}%`}}></div>
                            </div>
                        </div>
                        
                        <div className="dist-item clickable" onClick={() => navigate('/dashboard/admin/students')}>
                            <div className="dist-header">
                                <div className="dist-label"><span className="dot purple"></span>In Internship</div>
                                <span className="dist-percent">{stats?.stats?.distribution?.internship ?? stats?.distribution?.internship ?? 0}</span>
                            </div>
                            <div className="dist-bar-bg">
                                <div className="dist-bar-fill purple-light" style={{width: `${( (stats?.stats?.distribution?.internship ?? stats?.distribution?.internship ?? 0) / ( (stats?.stats?.users?.students ?? stats?.users?.students ?? 1) || 1)) * 100}%`}}></div>
                            </div>
                        </div>

                        <div className="dist-item clickable" onClick={() => navigate('/dashboard/admin/students')}>
                            <div className="dist-header">
                                <div className="dist-label"><span className="dot gray"></span>Completed</div>
                                <span className="dist-percent">{stats?.stats?.distribution?.completed ?? stats?.distribution?.completed ?? 0}</span>
                            </div>
                            <div className="dist-bar-bg">
                                <div className="dist-bar-fill gray-light" style={{width: `${( (stats?.stats?.distribution?.completed ?? stats?.distribution?.completed ?? 0) / ( (stats?.stats?.users?.students ?? stats?.users?.students ?? 1) || 1)) * 100}%`}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-right-col">
                {/* Quick Actions */}
                <div className="right-panel-section widget-card">
                    <h3 className="widget-title"><Zap size={18} color="#9e59ff" fill="#9e59ff" fillOpacity="0.2" /> Quick Actions</h3>
                    <div className="quick-action-buttons">
                        <button className="action-btn primary-action" onClick={() => navigate('/dashboard/admin/validation')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="action-icon-box">
                                    <CheckSquare size={18} />
                                </div>
                                <div className="action-text">
                                    <span>Validate Offers</span>
                                    {stats?.validations?.pending > 0 && <span className="new-badge">{stats.validations.pending} new</span>}
                                </div>
                            </div>
                            <ChevronRight size={16} className="action-arrow" />
                        </button>
                        
                        <button className="action-btn secondary-action skills" onClick={() => navigate('/dashboard/admin/skills')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="action-icon-box">
                                    <Award size={18} />
                                </div>
                                <span>Validate Skills</span>
                            </div>
                            <ChevronRight size={16} className="action-arrow" />
                        </button>

                        <button className="action-btn secondary-action reports" onClick={() => navigate('/dashboard/admin/reports')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="action-icon-box">
                                    <BarChart2 size={18} />
                                </div>
                                <span>Reports</span>
                            </div>
                            <ChevronRight size={16} className="action-arrow" />
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="right-panel-section widget-card">
                    <h3 className="widget-title">Recent Activity</h3>
                    <div className="activity-timeline">
                        {stats?.recent_activities?.length > 0 ? (
                            stats.recent_activities.map((activity, idx) => (
                                <div className="timeline-item" key={idx}>
                                    <div className={`timeline-icon ${['approved', 'verified', 'sign'].some(k => activity.action_type?.includes(k)) ? 'purple-ring' : 'pink-ring'}`}></div>
                                    <div className="timeline-content">
                                        <h5>{activity.action_type?.replace(/_/g, ' ').toUpperCase()}</h5>
                                        <p>{activity.admin_email?.split('@')[0] || 'Admin'} performed action on {activity.target_model}</p>
                                        <span className="time">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="timeline-item">
                                <div className="timeline-icon gray-ring"></div>
                                <div className="timeline-content">
                                    <h5>No recent activity</h5>
                                    <p>System is up to date.</p>
                                    <span className="time">JUST NOW</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
