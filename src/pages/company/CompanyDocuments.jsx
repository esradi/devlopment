import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Briefcase, Send, MessageSquare, Settings, Calendar,
    Folder, Sparkles, Filter, ChevronDown, Download, Edit3, CloudDownload,
    LogOut, User, FileText, TrendingUp, Search, Bell, HelpCircle, Menu, X,
    Fingerprint, AlertCircle, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import { conventionService, referenceService, companyService } from '../../services/api';
import './CompanyDocuments.css';
import '../company/CompanyDashboard.css';

const StatusPill = ({ status }) => {
    const s = status.toLowerCase().replace(/_/g, '-');
    const label = status.replace(/_/g, ' ');
    return (
        <div className={`doc-status-pill ${s}`}>
            <div className="dot"></div>
            {label}
        </div>
    );
};

const CompanyDocuments = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Conventions');
    const [conventions, setConventions] = useState([]);
    const [references, setReferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [interns, setInterns] = useState([]);
    const [genType, setGenType] = useState('Convention');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [offerFilter, setOfferFilter] = useState('All');
    const [modernAlert, setModernAlert] = useState(null);

    const showModal = (type, title, message, onConfirm = null) => {
        setModernAlert({ type, title, message, onConfirm });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [convData, refData, statsData, internData] = await Promise.all([
                    conventionService.getConventions(),
                    referenceService.getReferences(),
                    companyService.getConventionStats(),
                    companyService.getAcceptedInterns()
                ]);
                setConventions(convData);
                setReferences(refData);
                setStats(statsData);
                setInterns(Array.isArray(internData) ? internData : internData?.results || []);
            } catch (err) {
                console.error("Failed to fetch documents:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSendReminder = (conventionId, target) => {
        showModal(
            'confirm', 
            'Send Reminder', 
            `Are you sure you want to send a signature reminder to the ${target}?`,
            async () => {
                try {
                    await conventionService.notifyReminder(conventionId, target);
                    showModal('success', 'Reminder Sent', `A notification has been sent to the ${target} successfully.`);
                } catch (err) {
                    console.error("Failed to send reminder:", err);
                    showModal('error', 'Failed', 'Could not send reminder.');
                }
            }
        );
    };

    const filteredDocs = () => {
        let docs = [];
        if (activeTab === 'Conventions') docs = conventions;
        else if (activeTab === 'Reference letters') docs = references;
        else docs = [...conventions, ...references].sort((a, b) => new Date(b.created_at || b.issue_date) - new Date(a.created_at || a.issue_date));

        if (statusFilter !== 'All') {
            docs = docs.filter(doc => doc.status === statusFilter || (statusFilter === 'Generated' && !doc.status));
        }

        if (offerFilter !== 'All') {
            docs = docs.filter(doc => (doc.offer_details?.title || doc.offer_title) === offerFilter);
        }

        return docs;
    };

    const handleGenerate = async () => {
        if (!selectedStudent) {
            showModal('error', 'Selection Required', "Please select a student first.");
            return;
        }

        try {
            setLoading(true);
            if (genType === 'Convention') {
                const studentApp = interns.find(i => i.student === parseInt(selectedStudent));
                if (studentApp) {
                    await companyService.generateConvention(studentApp.id);
                    showModal('success', 'Generated', "Convention generated successfully!");
                }
            } else {
                await referenceService.create({
                    student: selectedStudent,
                    subject: "Attestation de stage",
                    content: "Félicitations pour votre stage."
                });
                showModal('success', 'Generated', "Reference letter generated successfully!");
            }
            // Refresh data
            const [convData, refData, statsData] = await Promise.all([
                conventionService.getConventions(),
                referenceService.getReferences(),
                companyService.getConventionStats()
            ]);
            setConventions(convData);
            setReferences(refData);
            setStats(statsData);
        } catch (err) {
            showModal('error', 'Generation Failed', err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && conventions.length === 0) return <div className="loading-container" style={{ height: '100vh', background: '#0A0C10' }}><div className="custom-loader" /></div>;

    return (
        <div className="company-documents-dashboard">
            {/* Toggle Button */}
            <button
                className="sidebar-toggle-trigger"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? "Close Sidebar" : "Open Menu"}
            >
                <Menu size={24} />
                {!sidebarOpen && <span className="menu-label">Menu</span>}
            </button>

            {/* Overlay */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)}></div>

            {/* Sidebar Drawer */}
            <aside className={`dashboard-sidebar-drawer ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-close-trigger" onClick={() => setSidebarOpen(false)}>
                    <X size={20} />
                </div>
                <CompanySidebar activePath="documents" onClose={() => setSidebarOpen(false)} />
            </aside>

            <AnimatePresence>
                {modernAlert && (
                    <motion.div 
                        className="modern-alert-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ zIndex: 11000 }}
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

            <main className="documents-main">
                <div className="doc-header-flex">
                    <div className="doc-header-left">
                        <h1>Documents</h1>
                        <p>Manage internship agreements and reference letters for your interns.</p>
                    </div>
                    <button className="btn-generate-main" onClick={() => setActiveTab('Conventions')}>
                        <Sparkles size={18} /> Generate document
                    </button>
                </div>

                <div className="doc-tabs-container">
                    {['Conventions', 'Reference letters', 'All documents'].map(tab => (
                        <button
                            key={tab}
                            className={`doc-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="doc-filters-row">
                    <div className="doc-filter-group">
                        <div className="doc-filter-item">
                            <span className="lbl">Status:</span>
                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All</option>
                                <option value="pending_student_signature">Pending Student</option>
                                <option value="pending_company_signature">Pending Company</option>
                                <option value="pending_admin_validation">Pending Admin</option>
                                <option value="validated">Validated</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="doc-filter-divider"></div>
                        <div className="doc-filter-item">
                            <span className="lbl">Offer:</span>
                            <select
                                className="filter-select"
                                value={offerFilter}
                                onChange={(e) => setOfferFilter(e.target.value)}
                            >
                                <option value="All">All</option>
                                {[...new Set(conventions.map(c => c.offer_details?.title || c.offer_title))].filter(Boolean).map(title => (
                                    <option key={title} value={title}>{title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button className="btn-clear-filters" onClick={() => {
                        setStatusFilter('All');
                        setOfferFilter('All');
                        setActiveTab('All documents');
                    }}>
                        <Filter size={14} /> Clear Filters
                    </button>
                </div>

                <div className="doc-table-container">
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Offer</th>
                                <th>Signature Track</th>
                                <th>Generated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs().map(doc => {
                                const isConv = doc.offer_details || doc.offer;
                                const student = isConv ? doc.student_details : doc.student;
                                const studentName = isConv ? `${student?.first_name} ${student?.last_name}` : student?.full_name;
                                const title = isConv ? (doc.offer_details?.title || doc.offer_title) : doc.subject;

                                return (
                                    <tr key={doc.id + (isConv ? '-c' : '-r')}>
                                        <td>
                                            <div className="doc-student-cell">
                                                <img src={student?.profile_picture || "https://ui-avatars.com/api/?name=" + (studentName || 'Student')} alt="avatar" className="doc-s-avatar" />
                                                <div className="doc-s-info">
                                                    <h4>{studentName}</h4>
                                                    <p>{student?.university || student?.domain || 'Student'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="doc-offer-cell">
                                                <h5>{title}</h5>
                                                <p>{isConv ? 'Internship Agreement' : 'Reference Letter'}</p>
                                            </div>
                                        </td>
                                        <td>
                                            {isConv ? (
                                                <div className="company-sig-tracking">
                                                    <div className="sig-dots-row">
                                                        <div className={`sig-dot-s ${doc.student_signed ? 'done' : 'pending'}`} title="Student Signature"></div>
                                                        <div className={`sig-dot-s ${doc.company_signed ? 'done' : 'pending'}`} title="Company Signature"></div>
                                                        <div className={`sig-dot-s ${doc.admin_signed ? 'done' : 'pending'}`} title="Admin Validation"></div>
                                                    </div>
                                                    {!doc.student_signed && (
                                                        <button className="btn-remind-mini" onClick={() => handleSendReminder(doc.id, 'student')}>
                                                            Remind
                                                        </button>
                                                    )}
                                                    {doc.student_signed && !doc.company_signed && (
                                                        <button className="btn-sign-mini-company" onClick={() => navigate(`/dashboard/company/conventions/${doc.id}`)}>
                                                            <Fingerprint size={12} /> Sign
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <StatusPill status={doc.status || 'Generated'} />
                                            )}
                                        </td>
                                        <td>
                                            <div className="doc-gen-cell">
                                                <h6>{new Date(doc.created_at || doc.issue_date).toLocaleDateString()}</h6>
                                                <p>Updated {new Date(doc.updated_at || doc.issue_date).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="doc-actions">
                                                {(doc.pdf_file || doc.pdf_url) ? (
                                                    <a href={isConv ? conventionService.download(doc.id) : doc.pdf_url} className="doc-action-btn" download target="_blank" rel="noreferrer">
                                                        <Download size={18} />
                                                    </a>
                                                ) : (
                                                    <button className="doc-action-btn" disabled style={{ opacity: 0.3 }}><Download size={18} /></button>
                                                )}
                                                <button className="doc-action-btn" onClick={() => navigate(isConv ? `/dashboard/company/conventions/${doc.id}` : `/dashboard/company/references/${doc.id}`)}>
                                                    <Edit3 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            <aside className="doc-right-panel">
                <div className="widget-quick-gen">
                    <h3><Sparkles size={18} color="#9e59ff" /> Quick generate</h3>
                    <span className="widget-label">Select Student</span>
                    <select
                        className="widget-select-input"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                        <option value="">Select an active intern...</option>
                        {interns.map(i => (
                            <option key={i.id} value={i.student}>{i.student_name}</option>
                        ))}
                    </select>
                    <span className="widget-label">Document Type</span>
                    <select
                        className="widget-select-input filled"
                        value={genType}
                        onChange={(e) => setGenType(e.target.value)}
                    >
                        <option value="Convention">Convention de stage</option>
                        <option value="Reference">Reference Letter</option>
                    </select>
                    <button className="btn-widget-gen" onClick={handleGenerate}>Generate</button>
                </div>

                <div className="widget-status-sum">
                    <h3>Status summary</h3>
                    <div className="status-list">
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#5d6785' }}></div> Pending Student</div>
                            <div className="s-item-right">{stats?.pending_student_signature || 0}</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#9e59ff' }}></div> Pending Company</div>
                            <div className="s-item-right">{stats?.pending_company_signature || 0}</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#db2777' }}></div> Pending Admin</div>
                            <div className="s-item-right">{stats?.pending_admin_validation || 0}</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#10b981' }}></div> Validated</div>
                            <div className="s-item-right">{stats?.validated || 0}</div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default CompanyDocuments;
