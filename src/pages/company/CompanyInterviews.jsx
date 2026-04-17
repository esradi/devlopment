import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, Briefcase, Send, MessageSquare, Settings, Calendar,
    Search, ChevronDown, Video, MapPin, MoreVertical, Trash2, ArrowRight,
    Folder, User, LogOut
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyInterviews.css';

const CompanyInterviews = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Upcoming');

    return (
        <div className="company-interviews-dashboard">
            {/* LEFT SIDEBAR */}
            <CompanySidebar activePath="interviews" />

            {/* MAIN CONTENT */}
            <main className="interviews-main">
                <div className="interviews-header-container">
                    <div className="i-header-flex">
                        <div className="i-header-left">
                            <h1>Interviews</h1>
                            <p>Manage all upcoming and past interviews with candidates in one high-fidelity view.</p>
                        </div>
                        <div className="i-header-actions">
                            <div className="i-tabs">
                                {['Upcoming', 'Past', 'All'].map(tab => (
                                    <button 
                                        key={tab} 
                                        className={`i-tab ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <button 
                                className="i-btn-schedule"
                                onClick={() => navigate('/dashboard/company/interviews/schedule')}
                            >
                                <Calendar size={16} /> Schedule Interview
                            </button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="i-search-row">
                        <div className="i-search-box">
                            <Search size={18} color="#8892b0" />
                            <input type="text" placeholder="Search by candidate or offer..." />
                        </div>
                        <div className="i-dropdown">
                            Offer <ChevronDown size={14} />
                        </div>
                        <div className="i-dropdown">
                            Recruiter <ChevronDown size={14} />
                        </div>
                        <div className="i-dropdown">
                            Status <ChevronDown size={14} />
                        </div>
                    </div>

                    {/* Interviews List */}
                    <div className="i-list">
                        
                        {/* Card 1 */}
                        <div className="i-card">
                            <div className="i-time-info">
                                <span className="i-date-indicator"><div className="dot"></div> TODAY</span>
                                <span className="i-time-main">Tue, 15 Apr</span>
                                <span className="i-time-sub">14:30 • 45 min</span>
                                <span className="i-status-pill confirmed">CONFIRMED</span>
                                <div className="i-method-indicator">
                                    <Video size={14} /> Video call
                                </div>
                            </div>
                            <div className="i-candidate-info">
                                <img src="https://ui-avatars.com/api/?name=Amira+Benali&background=0d1117&color=ff1b90&size=100" alt="Amira" className="i-avatar" />
                                <div className="i-candidate-details">
                                    <h4>Amira Benali</h4>
                                    <p>Data Scientist Intern</p>
                                </div>
                            </div>
                            <div className="i-offer-info">
                                <h5>PFE Internship</h5>
                                <p>Algiers, DZ</p>
                            </div>
                            <div className="i-actions">
                                <button 
                                    className="btn-i-action primary"
                                    onClick={() => window.open('https://meet.google.com/xyz-abc-123', '_blank')}
                                >
                                    Join
                                </button>
                                <button className="btn-icon-only"><MoreVertical size={16} /></button>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="i-card">
                            <div className="i-time-info">
                                <span className="i-time-main">Wed, 16 Apr</span>
                                <span className="i-time-sub">09:00 • 60 min</span>
                                <span className="i-status-pill proposed">PROPOSED</span>
                                <div className="i-method-indicator">
                                    <MapPin size={14} /> On-site
                                </div>
                            </div>
                            <div className="i-candidate-info">
                                <img src="https://ui-avatars.com/api/?name=Ryad+Mansouri&background=4f46e5&color=fff&size=100" alt="Ryad" className="i-avatar" />
                                <div className="i-candidate-details">
                                    <h4>Ryad Mansouri</h4>
                                    <p>Full-stack Developer</p>
                                </div>
                            </div>
                            <div className="i-offer-info">
                                <h5>Summer Internship</h5>
                                <p>Remote, Algiers</p>
                            </div>
                            <div className="i-actions">
                                <button 
                                    className="btn-i-action"
                                    onClick={() => navigate('/dashboard/company/offer/1/application/2')}
                                >
                                    View
                                </button>
                                <button className="btn-icon-only"><MoreVertical size={16} /></button>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="i-card">
                            <div className="i-time-info">
                                <span className="i-time-main">Thu, 17 Apr</span>
                                <span className="i-time-sub">11:15 • 30 min</span>
                                <span className="i-status-pill cancelled">CANCELLED</span>
                                <div className="i-method-indicator">
                                    <Video size={14} /> Video call
                                </div>
                            </div>
                            <div className="i-candidate-info">
                                <img src="https://ui-avatars.com/api/?name=Karim+Lahlou&background=ea580c&color=fff&size=100" alt="Karim" className="i-avatar" />
                                <div className="i-candidate-details">
                                    <h4>Karim Lahlou</h4>
                                    <p>Product Designer</p>
                                </div>
                            </div>
                            <div className="i-offer-info">
                                <h5>Senior PFE</h5>
                                <p>Oran, DZ</p>
                            </div>
                            <div className="i-actions">
                                <button 
                                    className="btn-i-action"
                                    onClick={() => navigate('/dashboard/company/interviews/1/reschedule')}
                                >
                                    Reschedule
                                </button>
                                <button 
                                    className="btn-icon-only"
                                    onClick={() => window.confirm('Are you sure you want to cancel this interview?') && alert('Interview cancelled.')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="i-load-more">
                        <span>SHOWING 10 OF 24 INTERVIEWS</span>
                        <button className="i-load-btn">
                            <ChevronDown size={14} /> Load more interviews
                        </button>
                    </div>

                </div>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="i-right-panel">
                
                {/* Today's Schedule */}
                <div className="i-schedule-widget">
                    <div className="i-widget-header">
                        <h3>Today's schedule</h3>
                        <span className="i-live-badge">3 LIVE</span>
                    </div>

                    <div className="i-timeline">
                        {/* Active Event */}
                        <div className="i-timeline-event active">
                            <div className="i-timeline-time">14:30</div>
                            <div className="i-timeline-marker"></div>
                            <div className="i-timeline-card">
                                <div className="i-t-cand-row">
                                    <h5>Amira Benali</h5>
                                    <Video size={14} color="#8892b0" />
                                </div>
                                <div className="i-t-job">DATA SCIENTIST</div>
                                <button 
                                    className="btn-i-join-now"
                                    onClick={() => window.open('https://meet.google.com/xyz-abc-123', '_blank')}
                                >
                                    JOIN NOW
                                </button>
                            </div>
                        </div>

                        {/* Upcoming Event */}
                        <div className="i-timeline-event">
                            <div className="i-timeline-time">16:00</div>
                            <div className="i-timeline-marker"></div>
                            <div className="i-timeline-card">
                                <div className="i-t-cand-row">
                                    <h5>Sofiane B.</h5>
                                    <MapPin size={14} color="#8892b0" />
                                </div>
                                <div className="i-t-job">BACKEND ENGINEER</div>
                                <div className="i-t-time-left">Starts in 2h 15m</div>
                            </div>
                        </div>
                    </div>

                    <div className="i-view-calendar" onClick={() => navigate('/dashboard/company/interviews/calendar')}>
                        View full calendar <ArrowRight size={12} />
                    </div>
                </div>

                {/* Recruitment Flow */}
                <div className="i-flow-widget">
                    <h3>RECRUITMENT FLOW</h3>
                    
                    <div className="i-flow-row">
                        <div className="i-flow-labels">
                            <span>Interview Success</span>
                            <strong>82%</strong>
                        </div>
                        <div className="i-flow-bar-bg">
                            <div className="i-flow-bar-fill fill-purple" style={{width: '82%'}}></div>
                        </div>
                    </div>

                    <div className="i-flow-row">
                        <div className="i-flow-labels">
                            <span>Offer Acceptance</span>
                            <strong>64%</strong>
                        </div>
                        <div className="i-flow-bar-bg">
                            <div className="i-flow-bar-fill fill-pink" style={{width: '64%'}}></div>
                        </div>
                    </div>

                    <div className="i-flow-stats-row">
                        <div className="i-flow-stat-box">
                            <span>TOTAL</span>
                            <div className="val">128</div>
                        </div>
                        <div className="i-flow-stat-box">
                            <span>HIRED</span>
                            <div className="val pink">32</div>
                        </div>
                    </div>
                </div>

            </aside>
        </div>
    );
};

export default CompanyInterviews;
