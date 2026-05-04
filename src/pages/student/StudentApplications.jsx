import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    XOctagon,
    Hourglass,
    Briefcase,
    Building2,
    Calendar,
    ArrowRight,
    MapPin,
    AlertCircle,
    Fingerprint,
    Download,
    FileText,
    ShieldCheck
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { conventionService } from '../../services/api';
import './StudentApplications.css';

const StudentApplications = ({ recentApps = [] }) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [modernAlert, setModernAlert] = useState(null);

    const showModal = (type, title, message, onConfirm = null) => {
        setModernAlert({ type, title, message, onConfirm });
    };

    const sortedApps = [...recentApps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const filteredApps = sortedApps.filter(app => {
        if (filter === 'all') return true;
        if (filter === 'pending') return app.status === 'pending';
        if (filter === 'under review') return app.status === 'under review';
        if (filter === 'accepted') return app.status === 'accepted';
        if (filter === 'rejected') return app.status === 'rejected';
        return true;
    });

    const getCount = (status) => {
        if (status === 'all') return recentApps.length;
        if (status === 'pending') return recentApps.filter(a => a.status === 'pending').length;
        if (status === 'under review') return recentApps.filter(a => a.status === 'under review').length;
        return recentApps.filter(a => a.status === status).length;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted': return <CheckCircle2 className="text-green" size={18} />;
            case 'rejected': return <XOctagon className="text-red" size={18} />;
            case 'under review': return <Hourglass className="text-blue" size={18} />;
            default: return <Briefcase className="text-yellow" size={18} />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="student-applications-page">
            <AnimatePresence>
                {modernAlert && (
                    <motion.div 
                        className="modern-alert-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="modern-alert-box"
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        >
                            <div className="modern-alert-header" style={{ 
                                '--icon-bg': modernAlert.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : (modernAlert.type === 'confirm' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)') 
                            }}>
                                <div className="modern-alert-icon" style={{ 
                                    color: modernAlert.type === 'success' ? '#10b981' : (modernAlert.type === 'confirm' ? '#8b5cf6' : '#ef4444') 
                                }}>
                                    {modernAlert.type === 'success' ? <CheckCircle2 size={28} /> : (modernAlert.type === 'confirm' ? <ShieldCheck size={28} /> : <AlertCircle size={28} />)}
                                </div>
                                <h3>{modernAlert.title}</h3>
                            </div>
                            <div className="modern-alert-body">
                                <p>{modernAlert.message}</p>
                            </div>
                            <div className="modern-alert-actions">
                                <button className="modern-btn-cancel" onClick={() => setModernAlert(null)}>
                                    {modernAlert.type === 'confirm' ? 'Cancel' : 'Close'}
                                </button>
                                {modernAlert.type === 'confirm' && (
                                    <button className="modern-btn-confirm" onClick={() => {
                                        const callback = modernAlert.onConfirm;
                                        setModernAlert(null);
                                        if (callback) callback();
                                    }}>
                                        Proceed Securely
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="apps-header">
                <h1>My Applications</h1>
                <p>Track the status of your {recentApps.length} applications.</p>
            </div>

            <div className="filters-container">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({getCount('all')})
                </button>
                <button
                    className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({getCount('pending')})
                </button>
                <button
                    className={`filter-tab ${filter === 'under review' ? 'active' : ''}`}
                    onClick={() => setFilter('under review')}
                >
                    Review ({getCount('under review')})
                </button>
                <button
                    className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`}
                    onClick={() => setFilter('accepted')}
                >
                    Accepted ({getCount('accepted')})
                </button>
                <button
                    className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setFilter('rejected')}
                >
                    Rejected ({getCount('rejected')})
                </button>
            </div>

            <motion.div
                className="apps-list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {filteredApps.length > 0 ? (
                    filteredApps.map((app) => (
                        <motion.div
                            key={app.id}
                            className="app-card"
                            variants={itemVariants}
                        >
                            <div className="app-card-main">
                                <div className="company-info">
                                    <div className="company-logo-placeholder">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="titles">
                                        <h3>{app.offer_title}</h3>
                                        <p>{app.company_name}</p>
                                    </div>
                                </div>
                                <div className="app-meta">
                                    <div className="meta-item">
                                        <Calendar size={14} />
                                        <span>Applied on: {new Date(app.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="app-card-actions">
                                <div className="app-status-actions">
                                    <div className={`status-badge ${app.status.replace(' ', '-')}`}>
                                        {getStatusIcon(app.status)}
                                        <span>{app.status.toUpperCase()}</span>
                                    </div>
                                    
                                    {app.status === 'accepted' && app.convention_id && (
                                        <div className="convention-track">
                                            <div className="track-labels">
                                                <div className={`track-dot ${app.convention_student_signed ? 'done' : 'pending'}`} title="Student Signature"></div>
                                                <div className={`track-dot ${app.convention_company_signed ? 'done' : 'pending'}`} title="Company Signature"></div>
                                                <div className={`track-dot ${app.convention_admin_signed ? 'done' : 'pending'}`} title="Admin Validation"></div>
                                            </div>
                                            {app.convention_student_signed ? (
                                                <span className="conv-msg success">Signed</span>
                                            ) : (
                                                <button className="btn-sign-now" onClick={() => navigate(`/dashboard/student/offer/${app.offer}`)}>
                                                    <Fingerprint size={14} /> Sign Now
                                                </button>
                                            )}
                                            {app.convention_pdf && (
                                                <a href={conventionService.download(app.convention_id)} className="btn-download-conv" title="Download PDF" target="_blank" rel="noopener noreferrer">
                                                    <Download size={14} />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button className="btn-view" onClick={() => navigate(`/dashboard/student/offer/${app.offer}`)}>
                                    Details <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="empty-state">
                        <AlertCircle size={48} />
                        <h3>No applications found</h3>
                        <p>Try searching for internships in the Offers tab.</p>
                        <button className="btn-primary" onClick={() => navigate('/dashboard/student/offers')}>
                            Browse Offers
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default StudentApplications;
