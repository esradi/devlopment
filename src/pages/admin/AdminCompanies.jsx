import React, { useState } from 'react';
import { 
    Search, 
    Download, 
    CheckCircle,
    TrendingUp,
    MoreHorizontal,
    MapPin,
    Building2,
    ChevronLeft,
    ChevronRight,
    Plus,
    AlertCircle,
    Handshake,
    ChevronRight as ChevronRightIcon
} from 'lucide-react';
import './AdminCompanies.css';

const AdminCompanies = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Mock data
    const companiesData = [
        {
            id: 1,
            name: 'Sonatrach',
            industry: 'Energy & Petroleum',
            location: 'Algiers, Algeria',
            contactName: 'Ahmed Mansour',
            contactEmail: 'a.mansour@sonatrach.dz',
            offersActive: 8,
            offersTotal: 24,
            interns: 42,
            status: 'Verified',
            logo: 'S'
        },
        {
            id: 2,
            name: 'TechBridge IT',
            industry: 'Software Development',
            location: 'Oran, Algeria',
            contactName: 'Sarah Belkacem',
            contactEmail: 'contact@techbridge.io',
            offersActive: 0,
            offersTotal: 3,
            interns: 12,
            status: 'Pending',
            logo: 'T'
        },
        {
            id: 3,
            name: 'Ooredoo',
            industry: 'Telecommunications',
            location: 'Algiers, Algeria',
            contactName: 'Lydia Haroun',
            contactEmail: 'hr@ooredoo.dz',
            offersActive: 15,
            offersTotal: 88,
            interns: 156,
            status: 'Verified',
            logo: 'O'
        }
    ];

    const needsAttention = [
        { name: 'Sonatrach', issue: 'Requested verification', time: '2d ago' },
        { name: 'TechBridge', issue: 'No verified contact yet', time: 'Recent' },
        { name: 'Ooredoo', issue: '3 offers expired this week', time: 'Today' }
    ];

    const getStatusPill = (status) => {
        if (status === 'Verified') {
            return (
                <span className="company-status-pill status-verified">
                    <span className="company-status-dot"></span>
                    Verified
                </span>
            );
        }
        return (
            <span className="company-status-pill status-pending">
                <span className="company-status-dot"></span>
                Pending
            </span>
        );
    };

    return (
        <div className="admin-companies-page">
            <div className="companies-header">
                <div className="companies-title-area">
                    <h1>Partner Companies</h1>
                    <p>Manage the companies collaborating with your university and their internship offers.</p>
                </div>
                <div className="companies-header-controls">
                    <div className="control-group">
                        <label>ACADEMIC YEAR</label>
                        <select className="dark-select">
                            <option>2025/2026</option>
                            <option>2024/2025</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <label>GLOBAL STATUS</label>
                        <select className="dark-select">
                            <option>All</option>
                            <option>Active only</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="companies-top-grid">
                <div className="companies-metrics-container">
                    <div className="company-metric-card">
                        <div className="metric-header">
                            <span className="metric-title">Total Partners</span>
                            <Handshake className="metric-bg-icon" size={24} />
                        </div>
                        <div className="metric-body">
                            <h2>120</h2>
                            <p className="metric-trend up"><TrendingUp size={14}/> +12% from last year</p>
                        </div>
                    </div>
                    <div className="company-metric-card">
                        <div className="metric-header">
                            <span className="metric-title">Verified</span>
                            <CheckCircle className="metric-bg-icon green" size={24} />
                        </div>
                        <div className="metric-body">
                            <h2>95</h2>
                            <p className="metric-trend">High compliance rate</p>
                        </div>
                    </div>
                    <div className="company-metric-card">
                        <div className="metric-header">
                            <span className="metric-title">Pending Verification</span>
                            <MoreHorizontal className="metric-bg-icon red" size={24} />
                        </div>
                        <div className="metric-body">
                            <h2>12</h2>
                            <p className="metric-trend concern"><AlertCircle size={14}/> Action required</p>
                        </div>
                    </div>
                </div>

                <div className="companies-attention-card">
                    <div className="attention-header">
                        <h3>Needs Attention</h3>
                        <span className="attention-badge">3 Alert</span>
                    </div>
                    <div className="attention-list">
                        {needsAttention.map((item, idx) => (
                            <div className="attention-item" key={idx}>
                                <div className="attention-info">
                                    <h4 className="attention-name">{item.name}</h4>
                                    <p className="attention-issue">{item.issue}</p>
                                    <button className="attention-action">Review <ChevronRightIcon size={12}/></button>
                                </div>
                                <span className="attention-time">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="companies-toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by company name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="segmented-control">
                    {['All', 'Verified', 'Pending', 'Suspended'].map(status => (
                        <button 
                            key={status}
                            className={`segment-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="filter-dropdowns">
                    <select className="dark-select outline-select">
                        <option>Industry</option>
                    </select>
                    <select className="dark-select outline-select">
                        <option>Location</option>
                    </select>
                </div>

                <button className="icon-action-btn">
                    <Download size={18} />
                </button>
                <button className="add-partner-btn">
                    <Plus size={18} /> Add Partner
                </button>
            </div>

            <div className="companies-table-container">
                <table className="companies-table">
                    <thead>
                        <tr>
                            <th>COMPANY</th>
                            <th>LOCATION</th>
                            <th>CONTACT</th>
                            <th>OFFERS</th>
                            <th>INTERNS</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companiesData.map(company => (
                            <tr key={company.id}>
                                <td>
                                    <div className="company-cell">
                                        <div className="company-logo-box">
                                            {company.logo}
                                        </div>
                                        <div className="company-biz-info">
                                            <strong>{company.name}</strong>
                                            <span>{company.industry}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="location-cell">
                                        <MapPin size={14} className="cell-icon"/>
                                        <span dangerouslySetInnerHTML={{__html: company.location.replace(', ', ',<br/>')}}></span>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <strong>{company.contactName}</strong>
                                        <span>{company.contactEmail}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="offers-cell">
                                        <span className="offers-active"><strong>{company.offersActive}</strong> active</span>
                                        <span className="offers-total">{company.offersTotal} total</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="interns-count">{company.interns}</span>
                                </td>
                                <td>
                                    {getStatusPill(company.status)}
                                </td>
                                <td>
                                    <div className="table-actions">
                                        {company.status === 'Pending' ? (
                                            <button className="verify-action-btn">Verify</button>
                                        ) : (
                                            <button className="view-action-btn">View Profile</button>
                                        )}
                                        <button className="more-action-btn">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="table-footer">
                    <span className="showing-text">Showing 1-10 of 120 companies</span>
                    <div className="pagination">
                        <button className="page-btn"><ChevronLeft size={16} /></button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span className="page-ellipsis">...</span>
                        <button className="page-btn">12</button>
                        <button className="page-btn"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="companies-page-footer">
                STAG.IO • ADMIN CENTRAL V4.2 • LAST UPDATED: 12 OCT 2025
            </div>
        </div>
    );
};

export default AdminCompanies;
