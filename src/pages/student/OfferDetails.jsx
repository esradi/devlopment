import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService, studentService, offerService, applicationService } from '../../services/api';
import { motion } from 'framer-motion';
import {
    MapPin,
    Calendar,
    ChevronLeft,
    Send,
    Heart,
    FileText,
    Hourglass,
    Clock,
    Briefcase,
    CheckCircle2,
    DollarSign,
    Loader2
} from 'lucide-react';
import './OfferDetails.css';

const OfferDetails = ({ setUserRole }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coverLetter, setCoverLetter] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('offers');
    const [similarRoles, setSimilarRoles] = useState([]);
    const [application, setApplication] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const [details, me, recs, apps] = await Promise.all([
                    offerService.getDetails(id),
                    authService.getMe(),
                    studentService.getRecommendations(),
                    applicationService.getMine()
                ]);
                setOffer(details);
                setIsFavorite(details.is_favorite);
                setUserData(me);
                const recsArray = Array.isArray(recs) ? recs : recs?.results || recs?.data || [];
                setSimilarRoles(recsArray.filter(r => String(r.id) !== String(id)).slice(0, 3));
                const appsArray = Array.isArray(apps) ? apps : apps?.results || apps?.data || [];
                const existingApp = appsArray.find(a => String(a.offer) === String(id));
                if (existingApp) {
                    setApplication(existingApp);
                }
            } catch (err) {
                console.error("Failed to fetch offer details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleApply = async () => {
        setIsApplying(true);
        try {
            await applicationService.apply(id, coverLetter);
            // Refresh the application state locally
            const apps = await applicationService.getMine();
            const existingApp = apps.find(a => String(a.offer) === String(id));
            if (existingApp) setApplication(existingApp);
        } catch (error) {
            console.error("Failed to apply:", error);
        } finally {
            setIsApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading" style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff' }}>
                <Loader2 className="animate-spin" size={48} color="#9e59ff" />
                <p style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: '500', letterSpacing: '1px' }}>Loading offer details...</p>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="offer-details-container not-found">
                <h2>Offer Not Found</h2>
                <button onClick={() => navigate('/dashboard/student')} className="btn-secondary-dark">Return to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="student-dashboard offer-details-page">
            <main className="dashboard-main offer-main">
                <div className="back-nav">
                    <button onClick={() => navigate('/dashboard/student/offers')} className="back-btn">
                        <ChevronLeft size={20} />
                        Back to Offers
                    </button>
                </div>

                <motion.div
                    className="offer-header-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-content">
                        <div className="company-logo-large">
                            {offer.company_logo ? (
                                <img src={offer.company_logo} alt={offer.company_name} />
                            ) : (
                                <div className="logo-placeholder-large">
                                    {offer.company_name?.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="header-info">
                            <div className="company-tags">
                                <span className="company-name">{offer.company_name}</span>
                                <span className="separator">•</span>
                                {offer.offer_types?.map((type, i) => (
                                    <span key={i} className={`badge badge-type badge-${type.name.toLowerCase()}`}>{type.name}</span>
                                ))}
                                {offer.domains?.map((d, i) => (
                                    <span key={`d-${i}`} className="badge badge-domain">{d.name}</span>
                                ))}
                            </div>
                            <h1 className="offer-title">{offer.title}</h1>
                            <div className="offer-meta-main">
                                <span><MapPin size={16} /> {offer.wilaya}</span>
                                <span><DollarSign size={16} /> {offer.salary}</span>
                                <span><Calendar size={16} /> Posted on {new Date(offer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                {offer.updated_at && <span><Clock size={16} /> Updated {new Date(offer.updated_at).toLocaleDateString()}</span>}
                                {offer.contract_type && <span><Briefcase size={16} /> {offer.contract_type}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        {offer.match_score && (
                            <div className="match-score-circle">
                                <svg width="80" height="80" viewBox="0 0 80 80">
                                    <defs>
                                        <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#9e59ff" />
                                            <stop offset="100%" stopColor="#ff1b90" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                    <circle
                                        cx="40" cy="40" r="34" fill="none" stroke="url(#matchGradient)" strokeWidth="8"
                                        strokeDasharray="213.6" strokeDashoffset={213.6 * (1 - offer.match_score / 100)}
                                        strokeLinecap="round"
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                                    />
                                </svg>
                                <div className="score-text">
                                    <span className="number">{offer.match_score}%</span>
                                    <span className="label">MATCH</span>
                                </div>
                            </div>
                        )}
                        <div className="action-buttons-col">
                            {!application ? (
                                <button className="btn-primary btn-apply-header" onClick={() => {
                                    document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' });
                                }}>
                                    <Send size={18} /> Apply Now
                                </button>
                            ) : (
                                <button className="btn-primary btn-apply-header" disabled style={{ opacity: 0.8 }}>
                                    <CheckCircle2 size={18} /> Applied
                                </button>
                            )}
                            <button className={`btn-secondary-dark btn-save ${isFavorite ? 'saved' : ''}`} onClick={() => setIsFavorite(!isFavorite)}>
                                <Heart size={18} fill={isFavorite ? '#ff1b90' : 'none'} color={isFavorite ? '#ff1b90' : '#8892b0'} /> {isFavorite ? 'Saved' : 'Save Offer'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="offer-content-grid">
                    <div className="left-column">
                        <motion.section
                            className="offer-card-panel section-description"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="section-title"><FileText size={20} /> Job Description</h2>
                            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: offer.description || 'No description provided.' }} />
                        </motion.section>

                        {offer.requirements && Object.keys(offer.requirements).length > 0 && (
                            <motion.section
                                className="offer-card-panel section-requirements"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="section-title"><CheckCircle2 size={20} className="check-icon" /> Required Profile (Technical Requirements)</h2>
                                <div className="requirements-grid">
                                    {Object.entries(offer.requirements).map(([key, value], index) => (
                                        <div key={index} className="req-card">
                                            <div className="req-icon">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <div className="req-info">
                                                <h4>{key}</h4>
                                                <p>{value.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {!application ? (
                            <motion.section
                                id="apply-form"
                                className="offer-card-panel section-apply-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="section-title"><Send size={20} /> Apply Now</h2>
                                <div className="form-group">
                                    <label>Cover Letter</label>
                                    <textarea
                                        placeholder={`Why are you the perfect match for ${offer.company_name}?`}
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        rows={5}
                                    ></textarea>
                                </div>
                                <div className="apply-footer">
                                    <p className="auto-attach-notice">Your profile and portfolio will be automatically attached.</p>
                                    <button className="btn-primary" onClick={handleApply} disabled={isApplying}>
                                        {isApplying ? <Loader2 className="animate-spin" size={20} /> : 'Send Application'}
                                    </button>
                                </div>
                            </motion.section>
                        ) : (
                            <motion.section
                                className="offer-card-panel section-apply-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="section-title"><CheckCircle2 size={20} color="#10b981" /> Application Submitted</h2>
                                {application.status === 'accepted' ? (
                                    <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                                        <h3 style={{ color: '#10b981', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CheckCircle2 size={20} /> Congratulations! Your profile has been selected.
                                        </h3>
                                        <p style={{ color: '#fff', opacity: 0.9, margin: 0 }}>
                                            Your agreement is ready for signature. The company will contact you shortly regarding the next onboarding steps.
                                        </p>
                                    </div>
                                ) : application.status === 'rejected' ? (
                                    <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                                        <h3 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>Update on your application</h3>
                                        <p style={{ color: '#fff', opacity: 0.9, margin: 0 }}>
                                            {application.rejection_message || "Unfortunately, you were not selected for this position."}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                                        <p style={{ color: '#fff', opacity: 0.9, margin: 0 }}>
                                            You applied for this offer on {new Date(application.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. The employer is currently reviewing applications.
                                        </p>
                                    </div>
                                )}
                            </motion.section>
                        )}

                        {similarRoles.length > 0 && (
                            <motion.section 
                                className="section-similar"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3>Similar Tech Roles</h3>
                                <div className="similar-roles-grid">
                                    {similarRoles.map(role => (
                                        <div key={role.id} className="similar-role-card" onClick={() => navigate(`/dashboard/student/offer/${role.id}`)} style={{cursor: 'pointer'}}>
                                            <div className="role-top">
                                                <div className="role-logo">
                                                    {role.company_logo ? <img src={role.company_logo} alt="logo" style={{width: 24, height: 24, borderRadius: 4}}/> : role.company_name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="role-match">{role.match_score}% MATCH</span>
                                            </div>
                                            <h4>{role.title}</h4>
                                            <p className="role-company">{role.company_name} • {role.wilaya}</p>
                                            <div className="role-bottom">
                                                <span className="role-salary">{role.salary || 'Unpaid'}</span>
                                                <span className="role-time">{new Date(role.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>

                    <div className="right-column">
                        {offer.summary && (
                            <motion.section
                                className="offer-card-panel section-summary"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h3>Summary</h3>
                                <ul className="summary-list">
                                    <li><span className="lbl">Department</span> <span className="val">{offer.summary.department}</span></li>
                                    <li><span className="lbl">Level</span> <span className="val">{offer.summary.level}</span></li>
                                    <li><span className="lbl">Industry</span> <span className="val">{offer.summary.industry}</span></li>
                                    <li><span className="lbl">Work Model</span> <span className="val">{offer.summary.work_model}</span></li>
                                    {offer.summary.hiring_manager && (
                                        <li>
                                            <span className="lbl">Hiring Manager</span>
                                            <span className="val val-avatar">
                                                {offer.summary.hiring_manager_avatar && <img src={offer.summary.hiring_manager_avatar} alt="manager" />}
                                                {offer.summary.hiring_manager}
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </motion.section>
                        )}

                        {offer.skills && offer.skills.length > 0 && (
                            <motion.section
                                className="offer-card-panel section-skills"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3>Required Skills</h3>
                                <div className="skills-tags-full">
                                    {offer.skills.map((skill, index) => (
                                        <span key={index} className="skill-tag-pill">{skill.name}</span>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {!application ? (
                            <motion.section
                                className="offer-card-panel section-status"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="status-icon-wrapper">
                                    <Hourglass size={32} />
                                </div>
                                <h4>Status: Not Applied</h4>
                                <p>You haven't applied to this position yet.<br />Ready to jump in?</p>
                            </motion.section>
                        ) : (
                            <motion.section
                                className="offer-card-panel section-status"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{ padding: '24px' }}
                            >
                                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#fff' }}>Application Pipeline</h3>
                                <div className="app-pipeline" style={{ flexDirection: 'column', gap: '20px' }}>
                                    {['APPLIED', 'UNDER REVIEW', 'INTERVIEW', 'OFFER'].map((state, idx) => {
                                        let currentStepIndex = 0;
                                        if (application.status === 'under review') currentStepIndex = 1;
                                        if (application.status === 'interview') currentStepIndex = 2;
                                        if (application.status === 'accepted') currentStepIndex = 3;
                                        
                                        const isCompleted = idx <= currentStepIndex;
                                        const isCurrent = idx === currentStepIndex;
                                        
                                        return (
                                            <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div className="node-circle" style={{ 
                                                    width: '24px', height: '24px', borderRadius: '50%', 
                                                    border: `2px solid ${isCompleted ? '#9e59ff' : 'rgba(255,255,255,0.1)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                                }}>
                                                    {isCompleted && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#9e59ff' }}></div>}
                                                </div>
                                                <span style={{ 
                                                    fontSize: '0.9rem', 
                                                    fontWeight: isCurrent ? '700' : '500', 
                                                    color: isCurrent ? '#fff' : (isCompleted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)')
                                                }}>
                                                    {state}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OfferDetails;
