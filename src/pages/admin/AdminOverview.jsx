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
    BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import './AdminDashboard.css';

const AdminOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminService.getDashboard();
                setStats(res);
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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
                <div className="dashboard-header-text">
                    <h1>University Dashboard</h1>
                    <p>Welcome back, Admin. Here is the overview of your university's internship activity.</p>
                </div>

                {/* Stat Cards */}
                <motion.div 
                    className="admin-stats-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <motion.div className="admin-stat-card" whileHover={{ translateY: -5 }}>
                        <div className="stat-header">
                            <div className="stat-icon-wrapper purple-bg">
                                <Users size={18} color="#9e59ff" />
                            </div>
                            <span className="stat-badge green">Total User</span>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">TOTAL STUDENTS</span>
                            <h3>{stats?.users?.students || 0}</h3>
                        </div>
                    </motion.div>
                    
                    <motion.div className="admin-stat-card" whileHover={{ translateY: -5 }}>
                        <div className="stat-header">
                            <div className="stat-icon-wrapper pink-bg">
                                <Briefcase size={18} color="#ff1b90" />
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">ACTIVE OFFERS</span>
                            <h3>{stats?.offers?.active || 0}</h3>
                        </div>
                    </motion.div>
​
                    <motion.div className="admin-stat-card" whileHover={{ translateY: -5 }}>
                        <div className="stat-header">
                            <div className="stat-icon-wrapper orange-bg">
                                <ClipboardList size={18} color="#f59e0b" />
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">PENDING VALIDATIONS</span>
                            <h3>{stats?.validations?.pending || 0}</h3>
                        </div>
                    </motion.div>
​
                    <motion.div className="admin-stat-card" whileHover={{ translateY: -5 }}>
                        <div className="stat-header">
                            <div className="stat-icon-wrapper green-bg">
                                <CheckCircle size={18} color="#10b981" />
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">HIRED STUDENTS</span>
                            <h3>{stats?.applications?.accepted || 0} <span className="stat-subtext">total</span></h3>
                        </div>
                    </motion.div>
                </motion.div>

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
                        {[
                            { name: 'Sonatrach', offers: '24 Internship Offers', logo: 'S' },
                            { name: 'Ooredoo', offers: '18 Internship Offers', logo: 'O' },
                            { name: 'Mobilis', offers: '15 Internship Offers', logo: 'M' },
                            { name: 'Air Algérie', offers: '12 Internship Offers', logo: 'A' },
                        ].map((partner, idx) => (
                            <div className="partner-card" key={idx}>
                                <div className="partner-info">
                                    <div className="partner-logo">{partner.logo}</div>
                                    <div>
                                        <h4>{partner.name}</h4>
                                        <span>{partner.offers}</span>
                                    </div>
                                </div>
                                <button className="partner-arrow-btn">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Student Status Distribution */}
                <div className="dashboard-section distribution-section">
                    <h3>Student Status Distribution</h3>
                    <div className="distribution-bars">
                        <div className="dist-item">
                            <div className="dist-header">
                                <div className="dist-label"><span className="dot pink"></span>Searching</div>
                                <span className="dist-percent">40%</span>
                            </div>
                            <div className="dist-bar-bg">
                                <div className="dist-bar-fill pink-gradient" style={{width: '40%'}}></div>
                            </div>
                        </div>
                        
                        <div className="dist-item">
                            <div className="dist-header">
                                <div className="dist-label"><span className="dot purple"></span>In Internship</div>
                                <span className="dist-percent">35%</span>
                            </div>
                            <div className="dist-bar-bg">
                                <div className="dist-bar-fill purple-light" style={{width: '35%'}}></div>
                            </div>
                        </div>

                        <div className="dist-item">
                            <div className="dist-header">
                                <div className="dist-label"><span className="dot gray"></span>Completed</div>
                                <span className="dist-percent">25%</span>
                            </div>
                            <div className="dist-bar-bg">
                                <div className="dist-bar-fill gray-light" style={{width: '25%'}}></div>
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
                                <span>Internship Reports</span>
                            </div>
                            <ChevronRight size={16} className="action-arrow" />
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="right-panel-section widget-card">
                    <h3 className="widget-title">Recent Activity</h3>
                    <div className="activity-timeline">
                        <div className="timeline-item">
                            <div className="timeline-icon purple-ring"></div>
                            <div className="timeline-content">
                                <h5>Internship agreement signed</h5>
                                <p>Karim Boudali • CS Department</p>
                                <span className="time">2 HOURS AGO</span>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon pink-ring"></div>
                            <div className="timeline-content">
                                <h5>New partner company</h5>
                                <p>Sonelgaz joined the network</p>
                                <span className="time">5 HOURS AGO</span>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon green-ring"></div>
                            <div className="timeline-content">
                                <h5>Report Submitted</h5>
                                <p>Amine Zaghouani • Final Review</p>
                                <span className="time">YESTERDAY</span>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon gray-ring"></div>
                            <div className="timeline-content">
                                <h5>Profile Updated</h5>
                                <p>Sarra Benali • New Skills Added</p>
                                <span className="time">YESTERDAY</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminOverview;
