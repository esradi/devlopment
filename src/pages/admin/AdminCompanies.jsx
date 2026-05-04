import React, { useState, useEffect } from 'react';
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
    Loader2,
    ChevronRight as ChevronRightIcon,
    Calendar
} from 'lucide-react';
import { adminService } from '../../services/api';
import './AdminCompanies.css';

const AdminCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await adminService.getCompanies();
                setCompanies(res || []);
            } catch (err) {
                console.error("Failed to fetch companies:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const handleVerify = async (id, status) => {
        try {
            await adminService.verifyCompany(id, { verification_status: status });
            // Refresh list
            const res = await adminService.getCompanies();
            setCompanies(res || []);
        } catch (err) {
            console.error("Failed to verify company:", err);
        }
    };

    const getStatusPill = (status) => {
        if (status === 'verified') {
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
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.company_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || company.verification_status.toLowerCase() === statusFilter.toLowerCase();
        const matchesDate = !dateFilter || (company.created_at && new Date(company.created_at).toISOString().split('T')[0] === dateFilter);
        return matchesSearch && matchesStatus && matchesDate;
    });

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#9e59ff" />
            </div>
        );
    }

    return (
        <div className="admin-companies-page">
            <div className="companies-header">
                <div className="companies-title-area">
                    <h1>Partner Companies</h1>
                    <p>Manage the companies collaborating with your university.</p>
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
                            <h2>{companies.length}</h2>
                        </div>
                    </div>
                    <div className="company-metric-card">
                        <div className="metric-header">
                            <span className="metric-title">Verified</span>
                            <CheckCircle className="metric-bg-icon green" size={24} />
                        </div>
                        <div className="metric-body">
                            <h2>{companies.filter(c => c.verification_status === 'verified').length}</h2>
                        </div>
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

                <div className="search-box" style={{ width: 'auto' }}>
                    <Calendar size={18} />
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        title="Filter by joining date"
                        style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
                    />
                </div>

                <div className="segmented-control">
                    {['All', 'Verified', 'Pending'].map(status => (
                        <button 
                            key={status}
                            className={`segment-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="companies-table-container">
                <table className="companies-table">
                    <thead>
                        <tr>
                            <th>COMPANY</th>
                            <th>INDUSTRY</th>
                            <th>EMAIL</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map(company => (
                            <tr key={company.id}>
                                <td>
                                    <div className="company-cell">
                                        <div className="company-logo-box">
                                            {company.company_name[0]}
                                        </div>
                                        <div className="company-biz-info">
                                            <strong>{company.company_name}</strong>
                                        </div>
                                    </div>
                                </td>
                                <td>{company.industry || 'N/A'}</td>
                                <td className="contact-cell">
                                    <span>{company.email}</span>
                                </td>
                                <td>
                                    {getStatusPill(company.verification_status)}
                                </td>
                                <td>
                                    <div className="table-actions">
                                        {company.verification_status === 'pending' ? (
                                            <button className="verify-action-btn" onClick={() => handleVerify(company.id, 'verified')}>Verify</button>
                                        ) : (
                                            <button className="view-action-btn">View Profile</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCompanies;
