import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, 
    XCircle, 
    User, 
    Award, 
    Calendar,
    Search,
    Activity,
    Code,
    FileText,
    ListChecks,
    Loader2
} from 'lucide-react';
import { adminService } from '../../services/api';
import './AdminDashboard.css'; 

const AdminSkills = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await adminService.getAdminChallenges();
                // Assumes ViewSet with pagination or array response
                setSubmissions(res?.results || res || []);
            } catch (err) {
                console.error("Failed to fetch challenge submissions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const filteredSubmissions = submissions.filter(s => {
        const matchesStatus = statusFilter === 'All' || 
                              (statusFilter === 'Passed' && s.passed) || 
                              (statusFilter === 'Failed' && !s.passed);
        
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || 
            (s.student_name || '').toLowerCase().includes(searchLower) ||
            (s.student_email || '').toLowerCase().includes(searchLower) ||
            (s.challenge_title || '').toLowerCase().includes(searchLower) ||
            (s.skill_name || '').toLowerCase().includes(searchLower);
            
        const matchesDate = !dateFilter || (s.submitted_at && new Date(s.submitted_at).toISOString().split('T')[0] === dateFilter);

        return matchesStatus && matchesSearch && matchesDate;
    });

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#9e59ff" />
            </div>
        );
    }

    const getTypeIcon = (type) => {
        switch(type) {
            case 'coding': return <Code size={14} color="#64ffda" />;
            case 'qcm': return <ListChecks size={14} color="#f59e0b" />;
            case 'text': return <FileText size={14} color="#9e59ff" />;
            default: return <Activity size={14} color="#8892b0" />;
        }
    };

    return (
        <div className="admin-skills-page" style={{ padding: '30px' }}>
            <div className="admin-header-area" style={{ marginBottom: '30px' }}>
                <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>Automated Challenges Feed</h1>
                <p style={{ color: '#8892b0' }}>Monitor student skill acquisitions through automatically generated and graded challenges.</p>
            </div>

            <div className="admin-toolbar" style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <div className="segmented-control status-filters" style={{ background: '#112240', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                    {['All', 'Passed', 'Failed'].map(status => (
                        <button 
                            key={status}
                            className={`segment-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {status}
                            <span style={{
                                background: statusFilter === status ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                                borderRadius: '10px',
                                padding: '0 6px',
                                fontSize: '10px',
                                fontWeight: 700
                            }}>
                                {status === 'All' ? submissions.length
                                : status === 'Passed' ? submissions.filter(s => s.passed).length
                                : status === 'Failed' ? submissions.filter(s => !s.passed).length
                                : 0}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="val-select-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#112240', borderRadius: '8px', padding: '0 10px' }}>
                    <Search size={16} color="#8892b0" />
                    <input 
                        type="text" 
                        placeholder="Search student or skill..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', padding: '10px', outline: 'none', width: '220px' }}
                    />
                </div>

                <div className="val-select-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#112240', borderRadius: '8px', padding: '0 10px' }}>
                    <Calendar size={16} color="#8892b0" />
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        title="Filter by submission date"
                        style={{ background: 'transparent', border: 'none', color: '#8892b0', padding: '10px', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="admin-table-container" style={{ background: '#112240', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccd6f6' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '15px' }}>STUDENT</th>
                            <th style={{ padding: '15px' }}>CHALLENGE / SKILL</th>
                            <th style={{ padding: '15px' }}>TYPE</th>
                            <th style={{ padding: '15px' }}>DATE</th>
                            <th style={{ padding: '15px' }}>SCORE</th>
                            <th style={{ padding: '15px' }}>RESULT</th>
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
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <strong>{sub.student_name}</strong>
                                            <span style={{ fontSize: '12px', color: '#8892b0' }}>{sub.student_email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <strong>{sub.challenge_title}</strong>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8892b0' }}>
                                            <Award size={12} color="#ff1b90" />
                                            {sub.skill_name}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', textTransform: 'uppercase' }}>
                                        {getTypeIcon(sub.challenge_type)}
                                        {sub.challenge_type}
                                    </div>
                                </td>
                                <td style={{ padding: '15px', fontSize: '13px', color: '#8892b0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Calendar size={14} />
                                        {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <strong style={{ color: sub.passed ? '#10b981' : '#ef4444' }}>{sub.score}%</strong>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '11px', 
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        background: sub.passed ? '#10b98122' : '#ef444422',
                                        color: sub.passed ? '#10b981' : '#ef4444'
                                    }}>
                                        {sub.passed ? 'PASSED' : 'FAILED'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#8892b0' }}>
                                    No completed challenges found for this filter.
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
