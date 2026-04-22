import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronRight, MapPin, Search, MessageSquare, 
    Settings, LayoutDashboard, Briefcase, Send, 
    Calendar, CheckCircle2, ChevronDown, Download,
    Github, Code, Link as LinkIcon, RefreshCcw, FileText, Clock,
    Folder, User, LogOut
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
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
    
    // Static state based on Figma design for demonstration
    const [status, setStatus] = useState('In Review');

    return (
        <div className="company-app-detail-layout">
            {/* LEFT SIDEBAR (Reuse standard dashboard sidebar) */}
            <CompanySidebar activePath="candidates" />

            {/* MAIN CONTENT PORTION */}
            <main className="ap-main-wrapper">
                <div className="ap-main-scroll">
                    
                    {/* BREADCRUMBS */}
                    <div className="ap-breadcrumbs">
                        <span className="link" onClick={() => navigate('/dashboard/company/offers')}>MY OFFERS</span>
                        <ChevronRight size={14} />
                        <span className="link" onClick={() => navigate(`/dashboard/company/offer/${offerId || 1}/candidates`)}>DATA SCIENTIST INTERN</span>
                        <ChevronRight size={14} />
                        <span className="link" onClick={() => navigate(`/dashboard/company/offer/${offerId || 1}/candidates`)}>APPLICATIONS</span>
                        <ChevronRight size={14} />
                        <span className="current">AMIRA BENALI</span>
                    </div>

                    {/* TOP HEADER CARD */}
                    <div className="ap-header-card">
                        <div className="ap-header-left">
                            <div className="ap-avatar-wrapper">
                                <img src="https://ui-avatars.com/api/?name=Amira+Benali&background=0d1117&color=ff1b90&size=120" alt="Amira Benali" className="ap-avatar" />
                                <div className="ap-match-badge">87% MATCH</div>
                            </div>
                            <div className="ap-header-info">
                                <h1>Amira Benali</h1>
                                <p>Applied to <strong>Data Scientist Intern</strong> - 2 days ago</p>
                                <div className="ap-status-row">
                                    <span className="ap-status-pill in-review">IN REVIEW</span>
                                    <div className="ap-avatars-overlap">
                                        <img src="https://ui-avatars.com/api/?name=J+D&background=4f46e5&color=fff&size=24" alt="JD" />
                                        <img src="https://ui-avatars.com/api/?name=S+K&background=ea580c&color=fff&size=24" alt="SK" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ap-header-actions">
                            <button className="ap-btn-gradient"><RefreshCcw size={16}/> Update Status</button>
                            <button className="ap-btn-outline" onClick={() => navigate('/dashboard/company/interviews')}><Calendar size={16}/> Schedule Interview</button>
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
                                        <button className="ap-btn-dark"><FileText size={14}/> View CV</button>
                                        <button className="ap-btn-dark"><Github size={14}/> GitHub</button>
                                    </div>
                                </div>
                                <div className="ap-info-grid">
                                    <div className="ap-info-item">
                                        <label>EMAIL ADDRESS</label>
                                        <span>amira.benali@esi.dz</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>PHONE NUMBER</label>
                                        <span>+213 (0) 550 12 34 56</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>LOCATION</label>
                                        <span><MapPin size={14} style={{display:'inline', color:'#ff1b90', verticalAlign:'text-bottom', marginRight:'4px'}}/>Algiers, Algeria</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>UNIVERSITY</label>
                                        <span>ESI Alger (Ecole Supérieure d'Informatique)</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>ACADEMIC PROGRAM</label>
                                        <span>L3 Informatique (Data Science focus)</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>CURRENT GPA</label>
                                        <span>16.42 / 20.00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Skills & Match */}
                            <div className="ap-card">
                                <div className="ap-section-title"><div className="ap-title-bar"></div> Skills & Match</div>
                                <div className="ap-skills-layout">
                                    <MatchScoreRing score={87} />
                                    
                                    <div className="ap-skills-lists">
                                        <div className="ap-skill-row">
                                            <div className="ap-skill-pill">React <div className="ap-dots"><span className="ap-dot lit"></span><span className="ap-dot lit"></span><span className="ap-dot"></span></div></div>
                                            <div className="ap-skill-pill">Python <div className="ap-dots"><span className="ap-dot lit"></span><span className="ap-dot lit"></span><span className="ap-dot lit"></span></div></div>
                                            <div className="ap-skill-pill">Figma <div className="ap-dots"><span className="ap-dot lit"></span><span className="ap-dot lit"></span><span className="ap-dot lit"></span></div></div>
                                        </div>
                                        <div className="ap-skill-row">
                                            <div className="ap-skill-pill">SQL <div className="ap-dots"><span className="ap-dot lit"></span><span className="ap-dot lit"></span><span className="ap-dot"></span></div></div>
                                            <div className="ap-skill-pill">Pandas <div className="ap-dots"><span className="ap-dot lit"></span><span className="ap-dot lit"></span><span className="ap-dot lit"></span></div></div>
                                        </div>
                                        <div className="ap-match-breakdown">
                                            <span>SKILL MATCH <strong>80%</strong></span>
                                            <span className="ap-divider">•</span>
                                            <span className="ap-red-text">CHALLENGE SCORE <strong>92%</strong></span>
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
                                        <span>Data Scientist Intern</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>TYPE</label>
                                        <span>PFE / Graduation</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>DATE APPLIED</label>
                                        <span>Oct 24, 2023</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <label>STATUS</label>
                                        <span className="ap-status-text pink">IN REVIEW</span>
                                    </div>
                                </div>
                                <div className="ap-mt-24">
                                    <label className="ap-section-label">MOTIVATION MESSAGE</label>
                                    <div className="ap-quote-box">
                                        "Having spent the last two years exploring machine learning through personal projects and academic rigor at ESI, I am eager to apply my Python and data modeling skills to real-world challenges at Stag.io. I follow your platform's growth closely and admire the way you've bridged the gap for Algerian students. I believe my background in statistical analysis and my passion for UX-driven data products make me a strong candidate for this internship."
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
                                <div className="ap-dropdown-box mt-10">
                                    <span>In Review</span>
                                    <ChevronDown size={16} color="#8892b0"/>
                                </div>
                                <button className="ap-btn-full purple mt-16" onClick={() => navigate('/dashboard/company/interviews')}><Calendar size={16}/> Schedule Interview</button>
                                <button className="ap-btn-full outline mt-12">Reject with reason</button>
                            </div>

                            {/* Interview */}
                            <div className="ap-card ap-interview-card">
                                <label className="ap-section-label">INTERVIEW</label>
                                <div className="ap-interview-empty">
                                    <div className="ap-icon-circle"><Calendar size={20}/></div>
                                    <p>No interview scheduled yet</p>
                                    <button className="ap-btn-text">+ PROPOSE DATES</button>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="ap-card">
                                <label className="ap-section-label mb-16">TIMELINE</label>
                                <div className="ap-timeline">
                                    <div className="ap-timeline-item complete">
                                        <div className="ap-t-icon"><CheckCircle2 size={16}/></div>
                                        <div className="ap-t-content">
                                            <strong>Application Received</strong>
                                            <span>Oct 24, 2023 • 10:20 AM</span>
                                        </div>
                                    </div>
                                    <div className="ap-timeline-item complete">
                                        <div className="ap-t-icon"><CheckCircle2 size={16}/></div>
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
                                    <strong>Data Scientist Intern</strong>
                                    <div className="ap-offer-meta-small">
                                        <span><Briefcase size={12}/> PFE</span>
                                        <span><Clock size={12}/> 6 Months</span>
                                    </div>
                                </div>
                                <div className="ap-offer-info-row mt-16">
                                    <div>
                                        <label className="ap-tiny-label">LOCATION</label>
                                        <div className="ap-tiny-val">Algiers / Remote</div>
                                    </div>
                                    <div>
                                        <label className="ap-tiny-label">STATUS</label>
                                        <div className="ap-tiny-val purple">ACTIVE</div>
                                    </div>
                                </div>
                                <div className="ap-link-row mt-16">
                                    <span>View full offer</span>
                                    <ChevronRight size={14}/>
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
