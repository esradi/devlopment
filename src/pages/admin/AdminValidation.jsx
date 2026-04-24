import React, { useState } from 'react';
import { 
    Eye, 
    Check, 
    X, 
    RotateCcw, /* for history */
    Info,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    ChevronDown,
    Plus,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminValidation.css';

const AdminValidation = () => {
    const [activeTab, setActiveTab] = useState('Offers');
    const [statusFilter, setStatusFilter] = useState('All');

    const validationData = [
        {
            id: 'v1',
            offerTitle: 'Senior Frontend Intern',
            duration: '6 Months',
            type: 'Full-time',
            companyName: 'Nexus Lab',
            companyInitial: 'N',
            companyLogoColor: '#3b82f6',
            verifiedPartner: true,
            location: 'San Francisco, CA',
            programs: ['Computer Science'],
            status: 'Pending',
        },
        {
            id: 'v2',
            offerTitle: 'Product Design Fellow',
            duration: '3 Months',
            type: 'Part-time',
            companyName: 'Aura Creative',
            companyInitial: 'A',
            companyLogoColor: '#ec4899',
            verifiedPartner: false,
            location: 'Remote',
            programs: ['Digital Design'],
            status: 'Approved',
        },
        {
            id: 'v3',
            offerTitle: 'Data Analyst Intern',
            duration: '6 Months',
            type: 'Full-time',
            companyName: 'Quant Systems',
            companyInitial: 'Q',
            companyLogoColor: '#f59e0b',
            verifiedPartner: false,
            location: 'New York, NY',
            programs: ['Mathematics'],
            status: 'Rejected',
        }
    ];

    const getStatusElement = (status) => {
        let colorClass = '';
        if (status === 'Pending') colorClass = 'status-dot-yellow';
        if (status === 'Approved') colorClass = 'status-dot-green';
        if (status === 'Rejected') colorClass = 'status-dot-red';

        return (
            <div className="validation-status-view">
                <span className={`status-dot ${colorClass}`}></span>
                <span className={`status-text ${colorClass.replace('-dot-', '-text-')}`}>{status}</span>
            </div>
        );
    };

    const getActionButtons = (status) => {
        if (status === 'Pending') {
            return (
                <div className="validation-actions">
                    <button className="val-icon-btn view-btn" title="View Details"><Eye size={16} /></button>
                    <button className="val-icon-btn approve-btn" title="Approve"><Check size={16} /></button>
                    <button className="val-icon-btn reject-btn" title="Reject"><X size={16} /></button>
                </div>
            );
        } else if (status === 'Approved') {
            return (
                <div className="validation-actions">
                    <button className="val-icon-btn history-btn" title="View History"><RotateCcw size={16} /></button>
                </div>
            );
        } else {
            return (
                <div className="validation-actions">
                    <button className="val-icon-btn info-btn" title="View Reason"><Info size={16} /></button>
                </div>
            );
        }
    };

    return (
        <div className="admin-validation-page">
            {/* Header Section */}
            <div className="validation-header">
                <div className="header-titles">
                    <h1>Validation <span className="highlight-text">Center</span></h1>
                    <p>Review and approve internship offers before publishing them to students.</p>
                </div>
                <div className="header-toggle">
                    <button 
                        className={`toggle-btn ${activeTab === 'Offers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Offers')}
                    >
                        Offers
                    </button>
                    <button 
                        className={`toggle-btn ${activeTab === 'Companies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Companies')}
                    >
                        Companies
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="validation-metrics">
                <motion.div className="val-metric-card" whileHover={{ y: -4 }}>
                    <div className="val-metric-header">
                        <span>OFFERS PENDING</span>
                    </div>
                    <div className="val-metric-body">
                        <h2>12</h2>
                        <span className="val-pill urgent"><AlertCircle size={12}/> Urgent</span>
                    </div>
                </motion.div>

                <motion.div className="val-metric-card" whileHover={{ y: -4 }}>
                    <div className="val-metric-header">
                        <span>APPROVED THIS WEEK</span>
                    </div>
                    <div className="val-metric-body">
                        <h2>18</h2>
                        <span className="val-pill positive"><TrendingUp size={12}/> +12%</span>
                    </div>
                </motion.div>

                <motion.div className="val-metric-card" whileHover={{ y: -4 }}>
                    <div className="val-metric-header">
                        <span>REJECTED THIS WEEK</span>
                    </div>
                    <div className="val-metric-body">
                        <h2>03</h2>
                        <span className="val-metric-caption">Avg. 1.2/day</span>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Layout */}
            <div className="validation-main-layout">
                
                {/* Left Side: Data Table */}
                <div className="validation-table-section">
                    
                    {/* Filters */}
                    <div className="validation-toolbar">
                        <div className="val-segmented-controls">
                            {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                                <button 
                                    key={status} 
                                    className={`val-segment ${statusFilter === status ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <div className="val-dropdowns">
                            <button className="val-dropdown-btn">All Companies <ChevronDown size={14}/></button>
                            <button className="val-dropdown-btn">Department <ChevronDown size={14}/></button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="val-table-wrapper">
                        <table className="val-table">
                            <thead>
                                <tr>
                                    <th>OFFER DETAIL</th>
                                    <th>COMPANY</th>
                                    <th>LOCATION</th>
                                    <th>PROGRAM</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {validationData.map((row) => (
                                        <motion.tr 
                                            key={row.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <td>
                                                <div className="offer-detail-cell">
                                                    <strong>{row.offerTitle}</strong>
                                                    <span>{row.duration} • {row.type}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="val-company-cell">
                                                    <div className="val-company-logo" style={{backgroundColor: row.companyLogoColor}}>
                                                        {row.companyInitial}
                                                    </div>
                                                    <div className="val-company-info">
                                                        <strong>{row.companyName}</strong>
                                                        {row.verifiedPartner && <span className="verified-tag"><Check size={8}/> VERIFIED PARTNER</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="val-location-cell">
                                                    {row.location.split(',').map((part, i) => (
                                                        <span key={i}>{part.trim()}{i===0?',':''}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="val-programs-cell">
                                                    {row.programs.map((prog, index) => (
                                                        <span key={index} className="program-tag">{prog}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                {getStatusElement(row.status)}
                                            </td>
                                            <td>
                                                {getActionButtons(row.status)}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        
                        <div className="val-table-footer">
                            <span className="showing-text">Showing 3 of 12 pending offers</span>
                            <div className="val-pagination">
                                <button className="val-page-btn text-btn">Previous</button>
                                <button className="val-page-btn num-btn active">1</button>
                                <button className="val-page-btn num-btn">2</button>
                                <button className="val-page-btn text-btn">Next</button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Side: Widgets Sidebar */}
                <div className="validation-sidebar">
                    
                    {/* Guidelines Card */}
                    <div className="val-widget-card guidelines-card">
                        <div className="val-widget-header pb-4">
                            <div className="guidelines-icon-wrapper">
                                <CheckCircle2 size={18} color="#c4b5fd" />
                            </div>
                            <div>
                                <h3>Approval<br/>Guidelines</h3>
                                <span>VALIDATION STANDARDS</span>
                            </div>
                        </div>
                        
                        <div className="guidelines-list">
                            <div className="guideline-item">
                                <CheckCircle2 className="g-icon" size={14} color="#10b981" />
                                <div className="g-content">
                                    <h4>Academic Alignment</h4>
                                    <p>The role must directly match the learning outcomes of the student's program.</p>
                                </div>
                            </div>
                            <div className="guideline-item">
                                <CheckCircle2 className="g-icon" size={14} color="#10b981" />
                                <div className="g-content">
                                    <h4>Mentorship Quality</h4>
                                    <p>Company must provide a designated supervisor with 3+ years of experience.</p>
                                </div>
                            </div>
                            <div className="guideline-item">
                                <CheckCircle2 className="g-icon" size={14} color="#10b981" />
                                <div className="g-content">
                                    <h4>Remuneration Disclosure</h4>
                                    <p>Pay or stipend details must be explicitly stated in the formal offer.</p>
                                </div>
                            </div>
                        </div>

                        <div className="guideline-quote">
                            "Ensuring high-quality professional experiences is our primary mission for student success."
                        </div>
                    </div>

                    {/* Recent Activity Card */}
                    <div className="val-widget-card activity-card">
                        <div className="activity-header">
                            <Activity size={16} /> <h3>Recent Activity</h3>
                        </div>
                        
                        <div className="activity-timeline">
                            <div className="val-timeline-item">
                                <div className="val-ti-dot pink"></div>
                                <div className="val-ti-content">
                                    <h4>Offer Validated</h4>
                                    <p>Nexus Lab - Frontend Eng</p>
                                    <span>2 HOURS AGO</span>
                                </div>
                            </div>
                            <div className="val-timeline-item">
                                <div className="val-ti-dot orange"></div>
                                <div className="val-ti-content">
                                    <h4>Offer Rejected</h4>
                                    <p>Global Tech - Admin Assistant</p>
                                    <span>5 HOURS AGO</span>
                                </div>
                            </div>
                            <div className="val-timeline-item">
                                <div className="val-ti-dot pink-light"></div>
                                <div className="val-ti-content">
                                    <h4>New Submission</h4>
                                    <p>Aura Creative - Designer</p>
                                    <span>YESTERDAY</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <motion.button 
                className="val-fab"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Plus size={24} />
            </motion.button>
        </div>
    );
};

export default AdminValidation;
