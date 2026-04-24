import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Briefcase, Send, MessageSquare, Settings, Calendar,
    Search, MapPin, ChevronRight, CheckCircle2, ChevronLeft,
    Eye, Users, Award, XCircle, Download, ArrowUpRight, Check,
    Folder, User, LogOut
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import { companyService, offerService } from '../../services/api';
import './CompanyCandidates.css';

const MatchScoreRing = ({ score }) => {
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';

    return (
        <div className="match-score-ring">
            <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle 
                    cx="18" cy="18" r={radius} fill="none" stroke={color} strokeWidth="3" 
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" transform="rotate(-90 18 18)" 
                />
            </svg>
            <span className="score-text" style={{ color }}>{score}%</span>
        </div>
    );
};

const StatusPill = ({ status }) => {
    const val = status?.toLowerCase() || 'applied';
    let bg = 'rgba(255,255,255,0.05)';
    let color = '#8892b0';

    if (val === 'in review' || val === 'under review') { bg = 'rgba(158, 89, 255, 0.15)'; color = '#b27aff'; }
    if (val === 'interview') { bg = 'rgba(158, 89, 255, 0.3)'; color = '#d4b3ff'; }
    if (val === 'accepted') { bg = 'rgba(16, 185, 129, 0.15)'; color = '#10b981'; }
    if (val === 'refused' || val === 'rejected') { bg = 'rgba(244, 63, 94, 0.15)'; color = '#f43f5e'; }
    if (val === 'offer') { bg = 'rgba(255, 27, 144, 0.15)'; color = '#ff1b90'; }

    return <span className="table-status-pill" style={{ background: bg, color: color }}>{val.toUpperCase()}</span>;
};

const CompanyCandidates = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [offerDetails, setOfferDetails] = useState(null);
    const [pipelineCounts, setPipelineCounts] = useState({
        applied: 0,
        inReview: 0,
        interview: 0,
        offer: 0,
        refused: 0,
        accepted: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                let apps = [];
                if (offerId) {
                    const offerData = await offerService.getDetails(offerId);
                    setOfferDetails(offerData);
                    
                    const data = await companyService.getOfferApplicants(offerId);
                    apps = data?.results || data || [];
                } else {
                    const data = await companyService.getApplications();
                    apps = data?.results || data || [];
                }
                
                setApplicants(apps);

                // Calculate Pipeline Counts
                const counts = {
                    applied: apps.filter(a => ['applied', 'pending'].includes(a.status?.toLowerCase())).length,
                    inReview: apps.filter(a => ['in review', 'under review', 'viewed'].includes(a.status?.toLowerCase())).length,
                    interview: apps.filter(a => a.status?.toLowerCase() === 'interview').length,
                    offer: apps.filter(a => a.status?.toLowerCase() === 'offer').length,
                    refused: apps.filter(a => ['refused', 'rejected'].includes(a.status?.toLowerCase())).length,
                    accepted: apps.filter(a => a.status?.toLowerCase() === 'accepted').length,
                };
                setPipelineCounts(counts);

            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [offerId]);

    const getDaysAgo = (dateStr) => {
        if (!dateStr) return 'Recently';
        const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days > 365) return '1 year ago';
        if (days > 30) return `${Math.floor(days/30)} months ago`;
        if (days > 7) return `${Math.floor(days/7)} weeks ago`;
        return `${days} days ago`;
    };
    
    // Filtering
    let filteredApplicants = applicants;
    if (activeFilter === 'Applied') {
        filteredApplicants = filteredApplicants.filter(a => ['applied', 'pending'].includes(a.status?.toLowerCase()));
    } else if (activeFilter === 'In Review') {
        filteredApplicants = filteredApplicants.filter(a => ['in review', 'under review'].includes(a.status?.toLowerCase()));
    }
    if (searchTerm) {
        filteredApplicants = filteredApplicants.filter(a => 
            (a.student?.first_name + ' ' + a.student?.last_name).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (loading) {
        return <div className="candidates-loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0C10' }}><div className="custom-loader" /></div>;
    }

    return (
        <div className="company-candidates-dashboard">
            {/* LEFT SIDEBAR */}
            <CompanySidebar activePath="candidates" />

            {/* MAIN CONTENT */}
            <main className="candidates-main">
                <div className="candidates-header-container">
                    <div className="breadcrumbs">
                        <Link to="/dashboard/company/offers">MY OFFERS</Link>
                        <ChevronRight size={14} />
                        <span style={{ textTransform: 'uppercase' }}>{offerDetails?.title || 'GENERAL'}</span>
                        <ChevronRight size={14} />
                        <span className="current">APPLICATIONS</span>
                    </div>
                    
                    <div className="header-flex">
                        <div>
                            <h1>Applications – {offerDetails?.title || 'All Opportunities'}</h1>
                            <p>Review all candidates for this position.</p>
                        </div>
                        <div className="header-actions">
                            <span className="status-badge-active"><div className="dot"></div> {offerDetails?.status?.toUpperCase() || 'ACTIVE'}</span>
                            <button 
                                className="btn-view-offer"
                                onClick={() => navigate(`/dashboard/company/offer/${offerId || 1}/edit`)}
                            >
                                View Offer Details
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="stats-bar">
                        <div className="stat-block bordered">
                            <span className="stat-label">POSITION</span>
                            <h3>{offerDetails?.title || 'All Positions'}</h3>
                            <div className="stat-pills">
                                <span className="pill-type">{offerDetails?.offer_types?.map(t => t.name).join(', ') || 'Various'}</span>
                                <span className="pill-location"><MapPin size={12}/> {offerDetails?.wilaya || 'Algeria'}</span>
                            </div>
                        </div>
                        <div className="stat-block bordered center">
                            <div className="stat-value">{applicants.length}</div>
                            <span className="stat-label">TOTAL CANDIDATES</span>
                        </div>
                        <div className="stat-block bordered center">
                            <div className="stat-value text-green">
                                {applicants.length > 0 ? (applicants.reduce((acc, a) => acc + (a.match_score || 0), 0) / applicants.length).toFixed(0) : 0}%
                            </div>
                            <span className="stat-label">AVG MATCH SCORE</span>
                        </div>
                        <div className="stat-block center">
                            <div className="stat-value text-pink flex-center">
                                {applicants.filter(a => new Date(a.created_at) > new Date(Date.now() - 7 * 86400000)).length} <ArrowUpRight size={20} style={{marginLeft: '4px'}}/>
                            </div>
                            <span className="stat-label">NEW THIS WEEK</span>
                        </div>
                    </div>

                    {/* Filter Row */}
                    <div className="filter-row">
                        <div className="filter-tabs">
                            {['All', 'Applied', 'In Review'].map(tab => (
                                <button 
                                    key={tab} 
                                    className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        <div className="filter-controls">
                            <div className="search-box">
                                <Search size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search candidates..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="btn-select">Match score</button>
                            <button className="btn-select">University</button>
                        </div>
                    </div>

                    {/* Candidates Table */}
                    <div className="table-container">
                        <table className="candidates-table">
                            <thead>
                                <tr>
                                    <th>CANDIDATE</th>
                                    <th>UNIVERSITY</th>
                                    <th>SKILLS</th>
                                    <th>MATCH SCORE</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplicants.map(app => (
                                    <motion.tr 
                                        key={app.id} 
                                        onClick={() => navigate(`/dashboard/company/offer/${offerId || 1}/application/${app.id}`)}
                                        style={{ cursor: 'pointer' }}
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                    >
                                        <td>
                                            <div className="candidate-cell">
                                                <img 
                                                    src={app.student?.profile_picture || `https://ui-avatars.com/api/?name=${app.student?.first_name}+${app.student?.last_name}&background=9e59ff&color=fff`} 
                                                    alt="avatar" 
                                                    className="avatar-img"
                                                />
                                                <div className="candidate-name-info">
                                                    <span className="name">{app.student?.first_name} {app.student?.last_name}</span>
                                                    <span className="applied-time">Applied {getDaysAgo(app.created_at)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="university-text">{app.student?.university || 'University'}</span>
                                        </td>
                                        <td>
                                            <div className="skills-flex">
                                                {(app.skills || []).slice(0, 2).map((skill, idx) => (
                                                    <span key={idx} className="skill-pill">{skill?.name || skill}</span>
                                                ))}
                                                {(app.skills?.length > 2) && <span className="skill-pill extra">+{app.skills.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <MatchScoreRing score={app.match_score || Math.floor(Math.random() * 40) + 60} />
                                        </td>
                                        <td>
                                            <StatusPill status={app.status} />
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-view-app"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/company/offer/${offerId || 1}/application/${app.id}`);
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="table-footer">
                            <span className="showing-text">Showing {filteredApplicants.length} of {applicants.length} candidates</span>
                            <div className="pagination">
                                <button className="btn-page">Previous</button>
                                <button className="btn-page active">Next Page</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* RIGHT SIDEBAR - Offer Pipeline */}
            <aside className="pipeline-sidebar">
                <div className="pipeline-card">
                    <h3>Offer Pipeline</h3>
                    <div className="pipeline-steps">
                        
                        <div className="p-step">
                            <div className="step-icon-bg"><Download size={14} /></div>
                            <span className="step-label">Applied</span>
                            <span className="step-count">{pipelineCounts.applied}</span>
                        </div>
                        
                        <div className="p-step">
                            <div className="step-icon-bg purple"><Eye size={14} /></div>
                            <span className="step-label">In Review</span>
                            <span className="step-count">{pipelineCounts.inReview}</span>
                        </div>
                        
                        <div className="p-step">
                            <div className="step-icon-bg purple-light"><Users size={14} /></div>
                            <span className="step-label">Interview</span>
                            <span className="step-count">{pipelineCounts.interview}</span>
                        </div>
                        
                        <div className="p-step">
                            <div className="step-icon-bg green-light"><Award size={14} /></div>
                            <span className="step-label">Offer</span>
                            <span className="step-count">{pipelineCounts.offer}</span>
                        </div>
                        
                        <div className="p-step">
                            <div className="step-icon-bg red"><XCircle size={14} /></div>
                            <span className="step-label">Refused</span>
                            <span className="step-count">{pipelineCounts.refused}</span>
                        </div>
                        
                        <div className="p-step accepted-final">
                            <div className="step-icon-bg green-solid"><Check size={14} strokeWidth={3} /></div>
                            <span className="step-label text-white">Accepted</span>
                            <span className="step-count text-white">{pipelineCounts.accepted}</span>
                        </div>

                    </div>
                </div>

                <div className="boost-card">
                    <p>Need to hire faster?</p>
                    <button className="btn-boost">Boost this Offer</button>
                </div>
            </aside>
        </div>
    );
};

export default CompanyCandidates;
