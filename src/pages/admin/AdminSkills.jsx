import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, 
    XCircle, 
    ExternalLink, 
    User, 
    Award, 
    Calendar,
    Search,
    Filter,
    Loader2
} from 'lucide-react';
import { adminService } from '../../services/api';
import './AdminDashboard.css'; // Reuse common styles

const AdminSkills = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await adminService.getPortfolios();
                setSubmissions(res || []);
            } catch (err) {
                console.error("Failed to fetch portfolios:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const handleReview = async (id, status) => {
        const feedback = window.prompt(`Enter review feedback for ${status}:`);
        if (feedback === null) return;

        try {
            await adminService.reviewPortfolio(id, { status, feedback });
            // Refresh
            const res = await adminService.getPortfolios();
            setSubmissions(res || []);
        } catch (err) {
            console.error("Failed to review portfolio:", err);
        }
    };

    const filteredSubmissions = submissions.filter(s => {
        if (statusFilter === 'all') return true;
        return s.status === statusFilter;
    });

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#9e59ff" />
            </div>
        );
    }

    return (
        <div className="admin-skills-page" style={{ padding: '30px' }}>
            <div className="admin-header-area" style={{ marginBottom: '30px' }}>
                <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>Skill Verification Queue</h1>
                <p style={{ color: '#8892b0' }}>Review and verify student skill claims through their project portfolios.</p>
            </div>

            <div className="admin-toolbar" style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                <div className="segmented-control" style={{ background: '#112240', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                    {['pending', 'approved', 'rejected', 'all'].map(status => (
                        <button 
                            key={status}
                            className={`segment-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                background: statusFilter === status ? '#9e59ff' : 'transparent',
                                color: statusFilter === status ? '#fff' : '#8892b0',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-table-container" style={{ background: '#112240', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccd6f6' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '15px' }}>STUDENT</th>
                            <th style={{ padding: '15px' }}>SKILL TO VERIFY</th>
                            <th style={{ padding: '15px' }}>SUBMIT_DATE</th>
                            <th style={{ padding: '15px' }}>PORTFOLIO</th>
                            <th style={{ padding: '15px' }}>STATUS</th>
                            <th style={{ padding: '15px' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubmissions.length > 0 ? filteredSubmissions.map(sub => (
                            <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#9e59ff33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={16} color="#9e59ff" />
                                        </div>
                                        {sub.student_name}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Award size={16} color="#ff1b90" />
                                        {sub.skill_name}
                                    </div>
                                </td>
                                <td style={{ padding: '15px', fontSize: '13px', color: '#8892b0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Calendar size={14} />
                                        {new Date(sub.submitted_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <a 
                                        href={sub.portfolio_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ color: '#64ffda', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                                    >
                                        View Work <ExternalLink size={14} />
                                    </a>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '11px', 
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        background: sub.status === 'approved' ? '#10b98122' : sub.status === 'rejected' ? '#ef444422' : '#f59e0b22',
                                        color: sub.status === 'approved' ? '#10b981' : sub.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                    }}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    {sub.status === 'pending' ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleReview(sub.id, 'approved')}
                                                style={{ padding: '6px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}
                                                title="Approve"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleReview(sub.id, 'rejected')}
                                                style={{ padding: '6px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}
                                                title="Reject"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#8892b0', fontSize: '12px' }}>Reviewed</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#8892b0' }}>
                                    No submissions found for the selected filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSkills;
