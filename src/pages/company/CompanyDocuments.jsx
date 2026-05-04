import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Briefcase, Send, MessageSquare, Settings, Calendar,
    Folder, Sparkles, Filter, ChevronDown, Download, Edit3, CloudDownload,
    LogOut, User, FileText, TrendingUp, Search, Bell, HelpCircle, Menu, X
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
            alert("Please select a student");
            return;
        }

        try {
            if (genType === 'Convention') {
                // For convention, we need an application ID
                const studentApp = interns.find(i => i.student === parseInt(selectedStudent));
                if (studentApp) {
                    await companyService.generateConvention(studentApp.id);
                    alert("Convention generated successfully!");
                }
            } else {
                await referenceService.create({
                    student: selectedStudent,
                    subject: "Attestation de stage",
                    content: "Félicitations pour votre stage."
                });
                alert("Reference letter generated successfully!");
            }
            // Refresh data
            window.location.reload();
        } catch (err) {
            alert("Generation failed: " + err.message);
        }
    };

    if (loading) return <div className="loading-container" style={{ height: '100vh', background: '#0A0C10' }}><div className="custom-loader" /></div>;


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


            {/* MAIN CONTENT */}
            <main className="documents-main">
                <div className="doc-header-flex">
                    <div className="doc-header-left">
                        <h1>Documents</h1>
                        <p>Manage internship agreements and reference letters for your interns.</p>
                    </div>
                    <button className="btn-generate-main">
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
                                <th>Status</th>
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
                                            <StatusPill status={doc.status || 'Generated'} />
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

            {/* RIGHT SIDEBAR */}
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

                    <div className="activity-block">
                        <span className="widget-label">Total Documents</span>
                        <div className="activity-main">
                            {(conventions.length + references.length)} <div className="activity-trend"><TrendingUp size={16} /></div>
                        </div>
                        <span className="activity-sub">Conventions and letters generated</span>
                    </div>
                </div>

                <div className="widget-export-log">
                    <div className="log-icon-wrap">
                        <CloudDownload size={20} color="#fff" />
                    </div>
                    <h3>Export Audit Log</h3>
                    <p>Get a full spreadsheet of all document movements this quarter.</p>
                </div>
            </aside>
        </div>
    );
};

export default CompanyDocuments;
