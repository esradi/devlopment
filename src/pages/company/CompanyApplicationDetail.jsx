import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronRight, MapPin, Search, MessageSquare,
    Settings, LayoutDashboard, Briefcase, Send,
    Calendar, CheckCircle2, ChevronDown, Download,
    Github, Code, Link as LinkIcon, RefreshCcw, FileText, Clock,
    Folder, User, LogOut, Check, X
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { companyService, offerService } from '../../services/api';
import './CompanyApplicationDetail.css';

const MatchScoreRing = ({ score }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = '#ff1b90'; // Use pink for the new design

    return (
        <div className="ap-match-score-ring">
            <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle
                    cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round" transform="rotate(-90 40 40)"
                />
            </svg>
            <div className="ap-score-inner">
                <span className="ap-score-val">{score}%</span>
                <span className="ap-score-label">MATCH</span>
            </div>
        </div>
    );
};

const CompanyApplicationDetail = () => {
    const { offerId, applicationId } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const appData = await companyService.getApplicationDetails(applicationId); // line 65
                setApplication(appData);
                setStatus(appData.status);
                setOffer({
                    title: appData.offer_title,
                    id: appData.offer
                });
                // if (offerId || appData.offer) {
                //     const offerData = await offerService.getDetails(offerId || appData.offer);
                //     setOffer(offerData);
                // }
            } catch (err) {
                console.error("Failed to fetch application details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [applicationId, offerId]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await companyService.updateApplicationStatus(applicationId, newStatus);
            setStatus(newStatus);
            setShowStatusDropdown(false);
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    if (loading) {
        return <div className="loading-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0C10' }}><div className="custom-loader" /></div>;
    }

    if (!application) {
        return <div className="error-container">Application not found.</div>;
    }

    return (
        <div className="company-app-detail-layout">

            {/* MAIN CONTENT PORTION */}
            <main className="ap-main-wrapper">
                <div className="ap-main-scroll">

                    {/* BREADCRUMBS */}
                    <div className="ap-breadcrumbs">
                        <span className="link" onClick={() => navigate('/dashboard/company/offers')}>MY OFFERS</span>
                        <ChevronRight size={14} />
                        <span className="link" onClick={() => navigate(`/dashboard/company/offer/${offerId || 1}/candidates`)}>{application.offer_title || 'OFFER'}</span>
                        <ChevronRight size={14} />
                        <span className="link" onClick={() => navigate(`/dashboard/company/offer/${offerId || 1}/candidates`)}>APPLICATIONS</span>
                        <ChevronRight size={14} />
                        <span className="current">{application.student?.first_name} {application.student?.last_name}</span>
                    </div>

                    {/* TOP HEADER CARD */}
                    <div className="ap-header-card">
                        <div className="ap-header-left">
                            <div className="ap-avatar-wrapper">
                                <img src={application.student?.profile_picture || `https://ui-avatars.com/api/?name=${application.student?.first_name}+${application.student?.last_name}&background=0d1117&color=ff1b90&size=120`} alt="Avatar" className="ap-avatar" />
                                <div className="ap-match-badge">{application.match_score}% MATCH</div>
                            </div>
                            <div className="ap-header-info">
                                <h1>{application.student?.first_name} {application.student?.last_name}</h1>
                                <p>Applied to <strong>{application.offer_title || application.offer_title}</strong> - {new Date(application.created_at).toLocaleDateString()}</p>
                                <div className="ap-status-row">
                                    <span className={`ap-status-pill ${status?.toLowerCase().replace(' ', '-')}`}>{status?.toUpperCase()}</span>
                                    <div className="ap-avatars-overlap">
                                        <img src="https://ui-avatars.com/api/?name=J+D&background=4f46e5&color=fff&size=24" alt="JD" />
                                        <img src="https://ui-avatars.com/api/?name=S+K&background=ea580c&color=fff&size=24" alt="SK" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ap-header-actions">
                            <button className="ap-btn-gradient"><RefreshCcw size={16} /> Update Status</button>
                            <button className="ap-btn-outline" onClick={() => navigate('/dashboard/company/interviews')}><Calendar size={16} /> Schedule Interview</button>
                        </div>
                    </div>

                    {/* TWO COLS GRID */}
                    <div className="ap-content-grid">

                        {/* LEFT COLUMN */}
                        <div className="ap-col-left">

                            {/* Candidate Overview */}
                            <div className="ap-card">
                                <div className="ap-card-header-flex">
                                    <div className="ap-section-title"><div className="ap-title-bar"></div> Candidate Overview</div>
                                    <div className="ap-card-actions">
                                        <button className="ap-btn-dark"><FileText size={14} /> View CV</button>
                                        <button className="ap-btn-dark"><Github size={14} /> GitHub</button>
                                    </div>
                                </div>
                                <div className="ap-info-grid">
                                    <div className="ap-info-item">
                                        <label>EMAIL ADDRESS</label>
                                        <span>{application.student?.email}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>PHONE NUMBER</label>
                                        <span>{application.student?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>LOCATION</label>
                                        <span><MapPin size={14} style={{ display: 'inline', color: '#ff1b90', verticalAlign: 'text-bottom', marginRight: '4px' }} />{application.student?.location || 'Algeria'}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>UNIVERSITY</label>
                                        <span>{application.student?.university || 'University'}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>ACADEMIC PROGRAM</label>
                                        <span>{application.student?.major || 'Student'}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>CURRENT GPA</label>
                                        <span>{application.student?.gpa || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Skills & Match */}
                            <div className="ap-card">
                                <div className="ap-section-title"><div className="ap-title-bar"></div> Skills & Match</div>
                                <div className="ap-skills-layout">
                                    <MatchScoreRing score={application.match_score} />

                                    <div className="ap-skills-lists">
                                        <div className="ap-skill-row">
                                            {application.student?.skills?.slice(0, 5).map((skill, idx) => (
                                                <div key={idx} className="ap-skill-pill">{skill.name || skill} <div className="ap-dots"><span className="ap-dot lit"></span><span className="ap-dot lit"></span><span className="ap-dot lit"></span></div></div>
                                            ))}
                                        </div>
                                        <div className="ap-match-breakdown">
                                            <span>SKILL MATCH <strong>{application.match_score}%</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Application Details */}
                            <div className="ap-card">
                                <div className="ap-section-title"><div className="ap-title-bar"></div> Application Details</div>
                                <div className="ap-grey-box ap-flex-between">
                                    <div className="ap-info-item">
                                        <label>OFFER TITLE</label>
                                        <span>{application.offer_title || application.offer_title}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>TYPE</label>
                                        <span>{offer?.offer_types?.[0]?.name || 'Internship'}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>DATE APPLIED</label>
                                        <span>{new Date(application.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>STATUS</label>
                                        <span className="ap-status-text pink">{status?.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="ap-mt-24">
                                    <label className="ap-section-label">COVER LETTER</label>
                                    <div className="ap-quote-box">
                                        {application.cover_letter || "No cover letter provided."}
                                    </div>
                                </div>
                            </div>

                            {/* Internal Notes */}
                            <div className="ap-card">
                                <div className="ap-section-title"><div className="ap-title-bar"></div> Internal Notes</div>

                                <div className="ap-notes-list">
                                    <div className="ap-note-item">
                                        <div className="ap-note-avatar">JD</div>
                                        <div className="ap-note-content">
                                            <div className="ap-note-meta">
                                                <strong>Jerome Dupont</strong>
                                                <span>Yesterday, 4:15 PM</span>
                                            </div>
                                            <p>CV looks very promising. Strong academic background in Algiers. Let's fast-track the coding challenge.</p>
                                        </div>
                                    </div>

                                    <div className="ap-note-item">
                                        <div className="ap-note-avatar bg-pink">SK</div>
                                        <div className="ap-note-content">
                                            <div className="ap-note-meta">
                                                <strong>Sarah Karim</strong>
                                                <span>Today, 9:30 AM</span>
                                            </div>
                                            <p>Agreed. I've sent the initial assessment link. Waiting for completion.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="ap-note-input-area">
                                    <input type="text" placeholder="Add a note for the team..." />
                                    <button className="ap-btn-send"><Send size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="ap-col-right">

                            {/* Status & Actions */}
                            <div className="ap-card">
                                <label className="ap-section-label">STATUS & ACTIONS</label>
                                <div className="ap-dropdown-box mt-10" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                                    <span>{status?.toUpperCase()}</span>
                                    <ChevronDown size={16} color="#8892b0" />
                                </div>
                                {showStatusDropdown && (
                                    <div className="ap-status-dropdown-menu">
                                        <div className="ap-dropdown-item" onClick={() => handleStatusUpdate('viewed')}>Mark as Viewed</div>
                                        <div className="ap-dropdown-item" onClick={() => handleStatusUpdate('under review')}>Mark as Under Review</div>
                                        <div className="ap-dropdown-item" onClick={() => handleStatusUpdate('interview')}>Schedule Interview</div>
                                        <div className="ap-dropdown-item text-green" onClick={() => handleStatusUpdate('accepted')}>Accept Candidate</div>
                                        <div className="ap-dropdown-item text-red" onClick={() => handleStatusUpdate('rejected')}>Refuse Candidate</div>
                                    </div>
                                )}
                                <button
                                    className="ap-btn-full purple mt-16"
                                    onClick={() => navigate('/dashboard/company/interviews/schedule', {
                                        state: {
                                            studentId: application.student?.id || application.student,
                                            studentName: `${application.student?.first_name} ${application.student?.last_name}`,
                                            offerId: application.offer?.id || application.offer,
                                            offerTitle: application.application.offer_title || application.offer_title,
                                            applicationId: application.id
                                        }
                                    })}
                                >
                                    <Calendar size={16} /> Schedule Interview
                                </button>
                                <button className="ap-btn-full outline mt-12" onClick={() => handleStatusUpdate('rejected')}>Reject Candidate</button>
                            </div>

                            {/* Interview */}
                            <div className="ap-card ap-interview-card">
                                <label className="ap-section-label">INTERVIEW</label>
                                <div className="ap-interview-empty">
                                    <div className="ap-icon-circle"><Calendar size={20} /></div>
                                    <p>No interview scheduled yet</p>
                                    <button className="ap-btn-text">+ PROPOSE DATES</button>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="ap-card">
                                <label className="ap-section-label mb-16">TIMELINE</label>
                                <div className="ap-timeline">
                                    <div className="ap-timeline-item complete">
                                        <div className="ap-t-icon"><CheckCircle2 size={16} /></div>
                                        <div className="ap-t-content">
                                            <strong>Application Received</strong>
                                            <span>Oct 24, 2023 • 10:20 AM</span>
                                        </div>
                                    </div>
                                    <div className="ap-timeline-item complete">
                                        <div className="ap-t-icon"><CheckCircle2 size={16} /></div>
                                        <div className="ap-t-content">
                                            <strong>Under Review</strong>
                                            <span>Oct 25, 2023 • 02:15 PM</span>
                                        </div>
                                    </div>
                                    <div className="ap-timeline-item current">
                                        <div className="ap-t-icon"><div className="ap-t-dot"></div></div>
                                        <div className="ap-t-content">
                                            <strong>Technical Assessment</strong>
                                            <span className="ap-t-status pink">CURRENT STEP</span>
                                        </div>
                                    </div>
                                    <div className="ap-timeline-item pending">
                                        <div className="ap-t-icon"><div className="ap-t-dot"></div></div>
                                        <div className="ap-t-content">
                                            <strong>Interview</strong>
                                            <span>Pending</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Offer Summary */}
                            <div className="ap-card">
                                <label className="ap-section-label mb-16">OFFER SUMMARY</label>
                                <div className="ap-offer-summary-box">
                                    <strong>{application.offer_title || application.offer_title}</strong>
                                    <div className="ap-offer-meta-small">
                                        <span><Briefcase size={12} /> {offer?.offer_types?.[0]?.name || 'Internship'}</span>
                                        <span><Clock size={12} /> {offer?.durations?.[0]?.months || 'N/A'} Months</span>
                                    </div>
                                </div>
                                <div className="ap-offer-info-row mt-16">
                                    <div>
                                        <label className="ap-tiny-label">LOCATION</label>
                                        <div className="ap-tiny-val">{offer?.wilaya || 'Various'}</div>
                                    </div>
                                    <div>
                                        <label className="ap-tiny-label">STATUS</label>
                                        <div className="ap-tiny-val purple">ACTIVE</div>
                                    </div>
                                </div>
                                <div className="ap-link-row mt-16" onClick={() => navigate(`/dashboard/company/offer/${offer?.id || application.offer}/candidates`)}>
                                    <span>View full offer</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CompanyApplicationDetail;
