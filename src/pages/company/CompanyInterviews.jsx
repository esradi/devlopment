import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, Briefcase, Send, MessageSquare, Settings, Calendar,
    Search, ChevronDown, Video, MapPin, MoreVertical, Trash2, ArrowRight,
    Folder, User, LogOut
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import { interviewService } from '../../services/api';
import './CompanyInterviews.css';

const CompanyInterviews = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const data = await interviewService.getAll();
                setInterviews(data);
            } catch (err) {
                console.error("Failed to fetch interviews:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    const filteredInterviews = interviews.filter(i => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Upcoming') return i.status !== 'completed' && i.status !== 'cancelled';
        if (activeTab === 'Past') return i.status === 'completed';
        return true;
    });

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
                        {loading ? (
                            <div className="i-loading"><div className="custom-loader" /></div>
                        ) : filteredInterviews.length === 0 ? (
                            <div className="i-empty">
                                <Calendar size={48} />
                                <p>No {activeTab.toLowerCase()} interviews found.</p>
                            </div>
                        ) : filteredInterviews.map(interview => (
                            <div className="i-card" key={interview.id}>
                                <div className="i-time-info">
                                    <span className="i-time-main">{new Date(interview.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                    <span className="i-time-sub">{interview.time.substring(0, 5)} • {interview.duration} min</span>
                                    <span className={`i-status-pill ${interview.status}`}>{interview.status.toUpperCase()}</span>
                                    <div className="i-method-indicator">
                                        {interview.method === 'video' ? <Video size={14} /> : <MapPin size={14} />} 
                                        {interview.method === 'video' ? ' Video call' : ' On-site'}
                                    </div>
                                </div>
                                <div className="i-candidate-info">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(interview.student_name)}&background=random&color=fff&size=100`} alt={interview.student_name} className="i-avatar" />
                                    <div className="i-candidate-details">
                                        <h4>{interview.student_name}</h4>
                                        <p>{interview.offer_title}</p>
                                    </div>
                                </div>
                                <div className="i-offer-info">
                                    <h5>{interview.offer_title}</h5>
                                    <p>{interview.location || 'Remote'}</p>
                                </div>
                                <div className="i-actions">
                                    {interview.join_url && (
                                        <button 
                                            className="btn-i-action primary"
                                            onClick={() => window.open(interview.join_url, '_blank')}
                                        >
                                            Join
                                        </button>
                                    )}
                                    <button 
                                        className="btn-i-action"
                                        onClick={() => navigate(`/dashboard/company/offer/0/application/${interview.application}`)}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
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
                        <span className="i-live-badge">{interviews.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).length} TODAY</span>
                    </div>

                    <div className="i-timeline">
                        {interviews.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).length > 0 ? (
                            interviews.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).map(i => (
                                <div className="i-timeline-event active" key={i.id}>
                                    <div className="i-timeline-time">{i.time.substring(0, 5)}</div>
                                    <div className="i-timeline-marker"></div>
                                    <div className="i-timeline-card">
                                        <div className="i-t-cand-row">
                                            <h5>{i.student_name}</h5>
                                            <Video size={14} color="#8892b0" />
                                        </div>
                                        <div className="i-t-job">{i.offer_title}</div>
                                        {i.join_url && (
                                            <button 
                                                className="btn-i-join-now"
                                                onClick={() => window.open(i.join_url, '_blank')}
                                            >
                                                JOIN NOW
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="i-timeline-empty">No interviews today.</div>
                        )}
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
                            <span>Interview Completion</span>
                            <strong>{interviews.length > 0 ? Math.round((interviews.filter(i => i.status === 'completed').length / interviews.length) * 100) : 0}%</strong>
                        </div>
                        <div className="i-flow-bar-bg">
                            <div className="i-flow-bar-fill fill-purple" style={{width: `${interviews.length > 0 ? (interviews.filter(i => i.status === 'completed').length / interviews.length) * 100 : 0}%`}}></div>
                        </div>
                    </div>

                    <div className="i-flow-stats-row">
                        <div className="i-flow-stat-box">
                            <span>TOTAL</span>
                            <div className="val">{interviews.length}</div>
                        </div>
                        <div className="i-flow-stat-box">
                            <span>SCHEDULED</span>
                            <div className="val pink">{interviews.filter(i => i.status === 'scheduled').length}</div>
                        </div>
                    </div>
                </div>

            </aside>
        </div>
    );
};

export default CompanyInterviews;
