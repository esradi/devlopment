import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, Briefcase, Send, MessageSquare, Settings, Calendar,
    Folder, Sparkles, Filter, ChevronDown, Download, Edit3, CloudDownload,
    LogOut, User, FileText, TrendingUp, Search, Bell, HelpCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyDocuments.css';

const StatusPill = ({ status }) => {
    const s = status.toLowerCase();
    return (
        <div className={`doc-status-pill ${s}`}>
            <div className="dot"></div>
            {status}
        </div>
    );
};

const CompanyDocuments = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Conventions');

    const documents = [
        { id: 1, student: { name: 'Jordan Henderson', university: 'Stanford University', avatar: 'https://i.pravatar.cc/150?u=jordan' }, offer: { title: 'UX Research Trainee', details: '6 Months • Full-time' }, status: 'Signed', date: 'Oct 12, 2023', updated: '2h ago' },
        { id: 2, student: { name: 'Elena Rodriguez', university: 'MIT • Computer Science', avatar: 'https://i.pravatar.cc/150?u=elena' }, offer: { title: 'Software Eng Intern', details: '3 Months • Remote' }, status: 'Sent', date: 'Nov 05, 2023', updated: '1d ago' },
        { id: 3, student: { name: 'Lucas Fischer', university: 'ETH Zurich', avatar: 'https://i.pravatar.cc/150?u=lucas' }, offer: { title: 'Machine Learning Trainee', details: '6 Months • On-site' }, status: 'Finalized', date: 'Sep 28, 2023', updated: '2w ago' },
        { id: 4, student: { name: 'Maya Patel', university: 'LSE • Economics', avatar: 'https://i.pravatar.cc/150?u=maya' }, offer: { title: 'Product Management Intern', details: '4 Months • Hybrid' }, status: 'Draft', date: 'Just now', updated: 'In progress' },
    ];

    return (
        <div className="company-documents-dashboard">
            {/* LEFT SIDEBAR */}
            <CompanySidebar activePath="documents" />

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
                                            <img src={doc.student.avatar} alt="avatar" className="doc-s-avatar" />
                                            <div className="doc-s-info">
                                                <h4>{doc.student.name}</h4>
                                                <p>{doc.student.university}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="doc-offer-cell">
                                            <h5>{doc.offer.title}</h5>
                                            <p>{doc.offer.details}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <StatusPill status={doc.status} />
                                    </td>
                                    <td>
                                        <div className="doc-gen-cell">
                                            <h6>{doc.date}</h6>
                                            <p>Updated {doc.updated}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="doc-actions">
                                            {doc.status === 'Finalized' ? (
                                                <button className="doc-action-btn"><Download size={18} /></button>
                                            ) : doc.status === 'Draft' ? (
                                                <button className="doc-action-btn"><Edit3 size={18} /></button>
                                            ) : (
                                                <button className="doc-action-btn" style={{opacity: 0.3}}><Download size={18} /></button>
                                            )}
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
                            <div className="s-item-left"><div className="s-item-dot" style={{background: '#5d6785'}}></div> Draft</div>
                            <div className="s-item-right">05</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{background: '#9e59ff'}}></div> Sent</div>
                            <div className="s-item-right">12</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{background: '#db2777'}}></div> Signed</div>
                            <div className="s-item-right">28</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{background: '#10b981'}}></div> Finalized</div>
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
