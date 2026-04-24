import React from 'react';
import { 
    Users, 
    Briefcase, 
    ClipboardList, 
    CheckCircle,
    ArrowRight,
    CheckSquare,
    FileText,
    Zap
} from 'lucide-react';
import './AdminDashboard.css';

const AdminOverview = () => {
    return (
        <div className="admin-dashboard-grid">
            <div className="dashboard-main-col">
                <div className="dashboard-header-text">
                    <h1>University Dashboard</h1>
                    <p>Welcome back, Admin. Here is the overview of your university's internship activity.</p>
                </div>

                {/* Stat Cards */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper purple-bg">
                                <Users size={18} color="#9e59ff" />
                            </div>
                            <span className="stat-badge green">+5% Year</span>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">TOTAL STUDENTS</span>
                            <h3>1,240</h3>
                        </div>
                    </div>
                    
                    <div className="admin-stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper pink-bg">
                                <Briefcase size={18} color="#ff1b90" />
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">ACTIVE OFFERS</span>
                            <h3>86</h3>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper orange-bg">
                                <ClipboardList size={18} color="#f59e0b" />
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">PENDING APPLICATIONS</span>
                            <h3>215</h3>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper green-bg">
                                <CheckCircle size={18} color="#10b981" />
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-label">VALIDATED</span>
                            <h3>42 <span className="stat-subtext">this semester</span></h3>
                        </div>
                    </div>
                </div>

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
                    <h3 className="widget-title"><Zap size={18} /> Quick Actions</h3>
                    <div className="quick-action-buttons">
                        <button className="action-btn primary-action">
                            <CheckSquare size={18} />
                            <div className="action-text">
                                <span>Validate Offers</span>
                                <span className="new-badge">12 new</span>
                            </div>
                        </button>
                        
                        <button className="action-btn secondary-action">
                            <CheckCircle size={18} />
                            <span>Validate Internships</span>
                        </button>

                        <button className="action-btn secondary-action">
                            <FileText size={18} color="#f59e0b" />
                            <span>Internship Reports</span>
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
