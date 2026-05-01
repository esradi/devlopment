import React, { useState } from 'react';
import { 
    Filter, 
    Plus,
    ClipboardSignature, /* Represents "Signed" and "Pending Signature" loosely */
    FileSignature,
    ClipboardCheck,
    Eye,
    Download,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    HelpCircle
} from 'lucide-react';
import './AdminInternships.css';

const AdminInternships = () => {
    // Mock data based on design
    const agreementsData = [
        {
            id: '24892',
            studentName: 'Sarah Jenkins',
            studentAvatar: 'https://i.pravatar.cc/150?img=5',
            companyName: 'Lumina Tech',
            companyLogo: 'L',
            offerTitle: 'UX/UI Design Intern',
            batch: 'Spring Batch 2024',
            submissionDate: 'Oct 12, 2023',
            status: 'SIGNED'
        },
        {
            id: '21045',
            studentName: 'Marcus Zhao',
            studentAvatar: 'https://i.pravatar.cc/150?img=11',
            companyName: 'CloudStream Inc.',
            companyLogo: 'C',
            offerTitle: 'Cloud Infrastructure Intern',
            batch: 'Winter 2023',
            submissionDate: 'Oct 14, 2023',
            status: 'DRAFT'
        },
        {
            id: '25912',
            studentName: 'Amara Okafor',
            studentAvatar: 'https://i.pravatar.cc/150?img=19',
            companyName: 'NeoBank Global',
            companyLogo: 'N',
            offerTitle: 'Data Analyst Assistant',
            batch: 'Spring Batch 2024',
            submissionDate: 'Oct 15, 2023',
            status: 'FINALIZED'
        },
        {
            id: '22110',
            studentName: 'Julian Smith',
            studentAvatar: 'https://i.pravatar.cc/150?img=51',
            companyName: 'PixelPerfect Media',
            companyLogo: 'P',
            offerTitle: 'Creative Copywriter',
            batch: 'Winter 2023',
            submissionDate: 'Oct 16, 2023',
            status: 'SENT'
        }
    ];

    const getStatusStyle = (status) => {
        switch(status) {
            case 'SIGNED':
                return 'status-signed';
            case 'DRAFT':
                return 'status-draft';
            case 'FINALIZED':
                return 'status-finalized';
            case 'SENT':
                return 'status-sent';
            default:
                return '';
        }
    };

    return (
        <div className="admin-internships-page">
            {/* Header */}
            <div className="internships-header">
                <div className="internships-title-area">
                    <h1>Internship Agreements</h1>
                    <p>Manage and track legal internship conventions for your students.</p>
                </div>
                <div className="internships-header-actions">
                    <div className="year-selector">
                        <span className="year-label">YEAR</span>
                        <span className="year-value">2023-2024</span>
                    </div>
                    <button className="new-agreement-btn">
                        <Plus size={16} /> New Agreement
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="internships-metrics-grid">
                <div className="internship-metric-card">
                    <div className="metric-top">
                        <div className="metric-info">
                            <span className="metric-subtitle">PENDING SIGNATURE</span>
                            <h2>14</h2>
                        </div>
                        <div className="metric-icon-box bg-red-dark">
                            <ClipboardSignature size={20} className="color-red-light" />
                        </div>
                    </div>
                    <div className="metric-bottom">
                        <span className="metric-trend color-red">! 4 overdue by 2+ days</span>
                    </div>
                </div>

                <div className="internship-metric-card">
                    <div className="metric-top">
                        <div className="metric-info">
                            <span className="metric-subtitle">SIGNED THIS MONTH</span>
                            <h2>28</h2>
                        </div>
                        <div className="metric-icon-box bg-pink-dark">
                            <FileSignature size={20} className="color-pink-light" />
                        </div>
                    </div>
                    <div className="metric-bottom">
                        <span className="metric-trend color-green"><strong>+12%</strong> vs last month</span>
                    </div>
                </div>

                <div className="internship-metric-card">
                    <div className="metric-top">
                        <div className="metric-info">
                            <span className="metric-subtitle">TOTAL ACTIVE</span>
                            <h2>142</h2>
                        </div>
                        <div className="metric-icon-box bg-purple-dark">
                            <ClipboardCheck size={20} className="color-purple-light" />
                        </div>
                    </div>
                    <div className="metric-bottom">
                        <span className="metric-trend neutral-text">Across 86 partner companies</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="internships-filters-bar">
                <div className="filters-left">
                    <div className="filter-label">
                        <Filter size={16} /> Filters:
                    </div>
                    <button className="filter-pill active">Program: Computer Science</button>
                    <button className="filter-pill">Status: All</button>
                    <button className="filter-pill">Type: Full-time</button>
                </div>
                <button className="clear-filters-btn">Clear all filters</button>
            </div>

            {/* Data Table */}
            <div className="internships-table-container">
                <table className="internships-table">
                    <thead>
                        <tr>
                            <th>STUDENT</th>
                            <th>COMPANY</th>
                            <th>OFFER</th>
                            <th>SUBMISSION</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agreementsData.map((row, idx) => (
                            <tr key={idx}>
                                <td>
                                    <div className="student-profile">
                                        <img src={row.studentAvatar} alt={row.studentName} />
                                        <div className="profile-text">
                                            <strong>{row.studentName}</strong>
                                            <span>ID: {row.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="company-info-cell">
                                        <div className="company-logo-mini">{row.companyLogo}</div>
                                        <strong>{row.companyName}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div className="offer-info-cell">
                                        <strong>{row.offerTitle}</strong>
                                        <span>{row.batch}</span>
                                    </div>
                                </td>
                                <td className="date-cell">
                                    {row.submissionDate}
                                </td>
                                <td>
                                    <span className={`internship-status-pill ${getStatusStyle(row.status)}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="table-action-icons">
                                        <button className="icon-btn"><Eye size={18} /></button>
                                        <button className="icon-btn"><Download size={18} /></button>
                                        <button className="icon-btn"><MoreVertical size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer Pagination */}
                <div className="table-footer">
                    <span className="showing-text">Showing 1-10 of 142 agreements</span>
                    <div className="pagination">
                        <button className="page-btn"><ChevronLeft size={16} /></button>
                        <button className="page-btn active-page">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span className="page-ellipsis">...</span>
                        <button className="page-btn">15</button>
                    </div>
                </div>
            </div>

            {/* Help FAB */}
            <button className="help-fab">
                <HelpCircle size={24} />
            </button>
        </div>
    );
};

export default AdminInternships;
