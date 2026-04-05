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
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StudentApplications.css';

const StudentApplications = ({ recentApps = [] }) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

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
                            whileHover={{ scale: 1.01 }}
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
                                    <div className={`status-badge ${app.status.replace(' ', '-')}`}>
                                        {getStatusIcon(app.status)}
                                        <span>{app.status.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="app-card-actions">
                                <button className="btn-view" onClick={() => navigate(`/dashboard/student/offer/${app.offer}`)}>
                                    View Offer Details <ArrowRight size={14} />
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
