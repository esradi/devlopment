import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, MapPin, Search, MessageSquare, 
    Settings, LayoutDashboard, Briefcase, Send, 
    Calendar, CheckCircle2, ChevronDown, Download,
    Github, Code, Link as LinkIcon, RefreshCcw, FileText, Clock,
    Folder, User, LogOut, Check, X, PenTool, Fingerprint
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import { companyService, offerService, conventionService } from '../../services/api';
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

    // Toast State
    const [toastMessage, setToastMessage] = useState(null);
    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Signature State
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signingMethod, setSigningMethod] = useState(null); // 'fingerprint' or 'manual'
    const [isSigning, setIsSigning] = useState(false);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
    };

    useEffect(() => {
        if (showSignatureModal && signingMethod === 'manual' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
        }
    }, [showSignatureModal, signingMethod]);

    const handleFingerprintSign = async () => {
        try {
            setIsSigning(true);
            showToast("Please use Manual Signature if Fingerprint hardware is not detected.");
            setSigningMethod('manual');
        } catch (err) {
            console.error("Fingerprint failed:", err);
            setSigningMethod('manual');
        } finally {
            setIsSigning(false);
        }
    };

    const handleSubmitManualSignature = async () => {
        if (!canvasRef.current) return;
        const signatureImage = canvasRef.current.toDataURL('image/png');
        
        try {
            setIsSigning(true);
            await conventionService.signCompany(application.convention_id, {
                manual: true,
                signature_image: signatureImage
            });
            setShowSignatureModal(false);
            // Refresh data
            const appData = await companyService.getApplicationDetails(applicationId);
            setApplication(appData);
            showToast("Convention signed successfully! ✅");
        } catch (err) {
            console.error("Signature submission failed:", err);
            showToast("Failed to submit signature. Please try again. ❌");
        } finally {
            setIsSigning(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const appData = await companyService.getApplicationDetails(applicationId);
                setApplication(appData);
                setStatus(appData.status);
                setOffer({
                    title: appData.offer_title,
                    id: appData.offer
                });
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
                            {application.status === 'accepted' && application.convention_status === 'pending_company_signature' && (
                                <button 
                                    className="ap-btn-gradient" 
                                    style={{ background: 'linear-gradient(135deg, #9e59ff 0%, #ff1b90 100%)' }}
                                    onClick={() => {
                                        setSigningMethod(null);
                                        setShowSignatureModal(true);
                                    }}
                                >
                                    <PenTool size={16}/> Sign Convention
                                </button>
                            )}
                            {application.status === 'accepted' && application.convention_id && application.convention_status !== 'pending_company_signature' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600', marginRight: '15px' }}>
                                    <Check size={18} /> Convention Signed
                                </div>
                            )}
                            <button className="ap-btn-gradient" onClick={() => setShowStatusDropdown(!showStatusDropdown)}><RefreshCcw size={16}/> Update Status</button>
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
            <AnimatePresence>
                {showSignatureModal && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 10000, padding: '20px'
                        }}
                    >
                        <motion.div 
                            className="signature-modal-card"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '24px', width: '100%', maxWidth: '500px',
                                padding: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}
                        >
                            <button 
                                onClick={() => setShowSignatureModal(false)}
                                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ 
                                    width: '64px', height: '64px', borderRadius: '20px', 
                                    background: 'rgba(158, 89, 255, 0.1)', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                                }}>
                                    <PenTool size={32} color="#9e59ff" />
                                </div>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '8px' }}>Sign Convention</h2>
                                <p style={{ color: '#8892b0' }}>Choose your preferred method to sign the document</p>
                            </div>

                            {!signingMethod ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <button 
                                        className="ap-btn-dark"
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '16px', 
                                            padding: '20px', borderRadius: '16px', textAlign: 'left',
                                            border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)',
                                            width: '100%', cursor: 'pointer'
                                        }}
                                        onClick={() => setSigningMethod('fingerprint')}
                                    >
                                        <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                                            <Fingerprint size={24} color="#10b981" />
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '600' }}>Biometric Authentication</div>
                                            <div style={{ color: '#8892b0', fontSize: '0.85rem' }}>Use your device fingerprint sensor</div>
                                        </div>
                                    </button>

                                    <button 
                                        className="ap-btn-dark"
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '16px', 
                                            padding: '20px', borderRadius: '16px', textAlign: 'left',
                                            border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)',
                                            width: '100%', cursor: 'pointer'
                                        }}
                                        onClick={() => setSigningMethod('manual')}
                                    >
                                        <div style={{ padding: '10px', background: 'rgba(158, 89, 255, 0.1)', borderRadius: '12px' }}>
                                            <PenTool size={24} color="#9e59ff" />
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '600' }}>Manual Signature</div>
                                            <div style={{ color: '#8892b0', fontSize: '0.85rem' }}>Draw your signature on screen</div>
                                        </div>
                                    </button>
                                </div>
                            ) : signingMethod === 'fingerprint' ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        style={{ marginBottom: '24px' }}
                                    >
                                        <Fingerprint size={64} color="#9e59ff" />
                                    </motion.div>
                                    <p style={{ color: '#fff', marginBottom: '24px' }}>Please touch your fingerprint sensor...</p>
                                    <button className="ap-btn-gradient" onClick={handleFingerprintSign} disabled={isSigning} style={{ width: '100%' }}>
                                        {isSigning ? 'Authenticating...' : 'Try Again'}
                                    </button>
                                    <button 
                                        className="btn-text" 
                                        style={{ display: 'block', margin: '16px auto', color: '#8892b0', background: 'none', border: 'none', cursor: 'pointer' }}
                                        onClick={() => setSigningMethod('manual')}
                                    >
                                        Switch to Manual Signature
                                    </button>
                                </div>
                            ) : (
                                <div className="manual-signature-container">
                                    <div style={{ position: 'relative', background: '#050505', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                        <canvas 
                                            ref={canvasRef}
                                            width={440}
                                            height={200}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                            style={{ cursor: 'crosshair', display: 'block', width: '100%' }}
                                        />
                                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', pointerEvents: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
                                            Sign here
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                        <button className="ap-btn-dark" style={{ flex: 1 }} onClick={clearCanvas}>Clear</button>
                                        <button className="ap-btn-gradient" style={{ flex: 2 }} onClick={handleSubmitManualSignature} disabled={isSigning}>
                                            {isSigning ? 'Signing...' : 'Confirm Signature'}
                                        </button>
                                    </div>
                                    <button 
                                        className="btn-text" 
                                        style={{ display: 'block', margin: '16px auto', color: '#8892b0', background: 'none', border: 'none', cursor: 'pointer' }}
                                        onClick={() => setSigningMethod(null)}
                                    >
                                        Back to methods
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed', bottom: '32px', right: '32px',
                            background: 'rgba(13, 17, 23, 0.9)', backdropFilter: 'blur(10px)',
                            color: '#fff', padding: '16px 24px', borderRadius: '16px',
                            border: '1px solid rgba(158, 89, 255, 0.3)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            fontWeight: '600', zIndex: 11000,
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}
                    >
                        <div style={{ 
                            width: '24px', height: '24px', borderRadius: '50%', 
                            background: toastMessage.includes('❌') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {toastMessage.includes('❌') ? <X size={14} color="#ef4444" /> : <Check size={14} color="#10b981" />}
                        </div>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompanyApplicationDetail;
