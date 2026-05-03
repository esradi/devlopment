import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Briefcase, Send, MessageSquare, Settings, Calendar,
    Folder, Sparkles, Filter, ChevronDown, Download, Edit3, CloudDownload,
    LogOut, User, FileText, TrendingUp, Search, Bell, HelpCircle, Menu, X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import { conventionService } from '../../services/api';
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
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const data = await conventionService.getConventions();
                setDocuments(data);
            } catch (err) {
                console.error("Failed to fetch documents:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

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
                            <span className="val">All</span>
                            <ChevronDown size={14} />
                        </div>
                        <div className="doc-filter-divider"></div>
                        <div className="doc-filter-item">
                            <span className="lbl">Offer:</span>
                            <span className="val">All</span>
                            <ChevronDown size={14} />
                        </div>
                        <div className="doc-filter-divider"></div>
                        <div className="doc-filter-item">
                            <span className="lbl">Year:</span>
                            <span className="val">2024</span>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                    <button className="btn-clear-filters">
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
                            {documents.map(doc => (
                                <tr key={doc.id}>
                                    <td>
                                        <div className="doc-student-cell">
                                            <img src={doc.student?.profile_picture || "https://ui-avatars.com/api/?name=" + (doc.student?.first_name || 'Student')} alt="avatar" className="doc-s-avatar" />
                                            <div className="doc-s-info">
                                                <h4>{doc.student?.first_name} {doc.student?.last_name}</h4>
                                                <p>{doc.student?.university}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="doc-offer-cell">
                                            <h5>{doc.offer?.title}</h5>
                                            <p>{doc.offer_type} • {doc.duration} months</p>
                                        </div>
                                    </td>
                                    <td>
                                        <StatusPill status={doc.status} />
                                    </td>
                                    <td>
                                        <div className="doc-gen-cell">
                                            <h6>{new Date(doc.created_at).toLocaleDateString()}</h6>
                                            <p>Updated {new Date(doc.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="doc-actions">
                                            {doc.pdf_file ? (
                                                <a href={conventionService.download(doc.id)} className="doc-action-btn" download>
                                                    <Download size={18} />
                                                </a>
                                            ) : (
                                                <button className="doc-action-btn" disabled style={{ opacity: 0.3 }}><Download size={18} /></button>
                                            )}
                                            <button className="doc-action-btn" onClick={() => navigate(`/dashboard/company/conventions/${doc.id}`)}>
                                                <Edit3 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="doc-right-panel">
                <div className="widget-quick-gen">
                    <h3><Sparkles size={18} color="#9e59ff" /> Quick generate</h3>

                    <span className="widget-label">Select Student</span>
                    <div className="widget-select">
                        <span>Select an active intern...</span>
                        <ChevronDown size={16} />
                    </div>

                    <span className="widget-label">Document Type</span>
                    <div className="widget-select filled">
                        <span>Convention de stage</span>
                        <ChevronDown size={16} />
                    </div>

                    <button className="btn-widget-gen">Generate</button>
                </div>

                <div className="widget-status-sum">
                    <h3>Status summary</h3>
                    <div className="status-list">
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#5d6785' }}></div> Draft</div>
                            <div className="s-item-right">05</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#9e59ff' }}></div> Sent</div>
                            <div className="s-item-right">12</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#db2777' }}></div> Signed</div>
                            <div className="s-item-right">28</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#10b981' }}></div> Finalized</div>
                            <div className="s-item-right">45</div>
                        </div>
                    </div>

                    <div className="activity-block">
                        <span className="widget-label">Activity this month</span>
                        <div className="activity-main">
                            18 <div className="activity-trend"><TrendingUp size={16} /> 12%</div>
                        </div>
                        <span className="activity-sub">Letters generated successfully</span>
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
