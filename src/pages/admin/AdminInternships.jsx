import React, { useState, useEffect } from 'react';
import {
    Filter, ClipboardSignature, FileSignature, ClipboardCheck,
    Eye, Download, MoreVertical, ChevronLeft, ChevronRight,
    Loader2, AlertCircle, X, CheckCircle2, Clock, Search, Calendar
} from 'lucide-react';
import { adminService, conventionService } from '../../services/api';
import './AdminInternships.css';

/* ── status helpers ─────────────────────────────────────── */
const CONV_STATUS_MAP = {
    pending_admin_validation:   { label: 'PENDING SIGN', cls: 'status-draft'     },
    pending_student_signature:  { label: 'AWAITING STU', cls: 'status-sent'      },
    pending_company_signature:  { label: 'AWAITING CO',  cls: 'status-sent'      },
    validated:                  { label: 'FINALIZED',    cls: 'status-finalized' },
};

const APP_STATUS_MAP = {
    accepted:  { label: 'ACCEPTED',  cls: 'status-finalized' },
    pending:   { label: 'PENDING',   cls: 'status-draft'     },
    rejected:  { label: 'REJECTED',  cls: 'status-draft'     },
    refused:   { label: 'REFUSED',   cls: 'status-draft'     },
};

function getStatus(row) {
    if (row.convention_status) {
        return CONV_STATUS_MAP[row.convention_status] || { label: row.convention_status.toUpperCase(), cls: '' };
    }
    return APP_STATUS_MAP[row.status] || { label: (row.status || '').toUpperCase(), cls: '' };
}

/* ── tiny avatar ─────────────────────────────────────────── */
function Avatar({ name }) {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const hue = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
        <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: `hsl(${hue},60%,30%)`, color: `hsl(${hue},80%,80%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13
        }}>{initials}</div>
    );
}

/* ── main component ─────────────────────────────────────── */
const AdminInternships = () => {
    const [rows, setRows]           = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [convStats, setConvStats] = useState({ pending_admin: 0, in_progress: 0, validated: 0, total: 0 });
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [page, setPage]           = useState(1);
    const PER_PAGE = 10;

    // Filter definitions — key must match the filter() logic below
    const STATUS_FILTERS = [
        { key: 'All',          label: 'All' },
        { key: 'Pending',      label: 'Pending' },
        { key: 'Accepted',     label: 'Accepted (No Conv.)' },
        { key: 'NeedsSign',    label: 'Needs Your Sign' },
        { key: 'InSigning',    label: 'Awaiting Signing' },
        { key: 'Validated',    label: 'Validated' },
    ];

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [apps, stats] = await Promise.all([
                adminService.getValidations(),
                adminService.getConventionStats(),
            ]);
            setRows(apps?.results || apps || []);
            setConvStats(stats || {});
        } catch (err) {
            console.error(err);
            setError('Could not load internship data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    /* ── filtering — matches real status fields exactly ────── */
    const filtered = rows.filter(r => {
        if (statusFilter === 'All')      return true;
        // Pending: application not yet accepted
        if (statusFilter === 'Pending')  return r.status === 'pending';
        // Accepted but no convention generated yet
        if (statusFilter === 'Accepted') return r.status === 'accepted' && !r.convention_id;
        // Convention awaiting admin's signature
        if (statusFilter === 'NeedsSign') return r.convention_status === 'pending_admin_validation';
        // Convention in student or company signing stage
        if (statusFilter === 'InSigning') return (
            r.convention_status === 'pending_student_signature' ||
            r.convention_status === 'pending_company_signature'
        );
        // Fully validated
        if (statusFilter === 'Validated') return r.convention_status === 'validated';
        return true;
    }).filter(r => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || 
            (r.student_name || '').toLowerCase().includes(searchLower) ||
            (r.student_email || '').toLowerCase().includes(searchLower) ||
            (r.company_name || '').toLowerCase().includes(searchLower);
        
        const matchesDate = !dateFilter || (r.created_at && new Date(r.created_at).toISOString().split('T')[0] === dateFilter);

        return matchesSearch && matchesDate;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleDownload = (row) => {
        if (!row.convention_id) return;
        const url = conventionService.download(row.convention_id, row.convention_verification_code);
        window.open(url, '_blank');
    };

    /* ── render ─────────────────────────────────────────── */
    return (
        <div className="admin-internships-page">

            {/* Header */}
            <div className="internships-header">
                <div className="internships-title-area">
                    <h1>Internship Agreements</h1>
                    <p>Manage and track legal internship conventions for your students.</p>
                </div>
                <div className="internships-header-actions">
                    <button className="icon-btn" onClick={fetchData} title="Refresh">
                        <Loader2 size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                    </button>
                </div>
            </div>

            {/* Metric Cards — live from convStats */}
            <div className="internships-metrics-grid">
                <div className="internship-metric-card" style={{ cursor: 'pointer' }}
                    onClick={() => { setStatusFilter('NeedsSign'); setPage(1); }}>
                    <div className="metric-top">
                        <div className="metric-info">
                            <span className="metric-subtitle">PENDING YOUR SIGNATURE</span>
                            <h2>{convStats.pending_admin ?? 0}</h2>
                        </div>
                        <div className="metric-icon-box bg-red-dark">
                            <ClipboardSignature size={20} className="color-red-light" />
                        </div>
                    </div>
                    <div className="metric-bottom">
                        <span className="metric-trend color-red">
                            {(convStats.pending_admin ?? 0) > 0
                                ? `! ${convStats.pending_admin} convention(s) awaiting your sign`
                                : '✓ Nothing pending — click to filter'}
                        </span>
                    </div>
                </div>

                <div className="internship-metric-card" style={{ cursor: 'pointer' }}
                    onClick={() => { setStatusFilter('InSigning'); setPage(1); }}>
                    <div className="metric-top">
                        <div className="metric-info">
                            <span className="metric-subtitle">PARTNER SIGNING IN PROGRESS</span>
                            <h2>{convStats.in_progress ?? 0}</h2>
                        </div>
                        <div className="metric-icon-box bg-pink-dark">
                            <FileSignature size={20} className="color-pink-light" />
                        </div>
                    </div>
                    <div className="metric-bottom">
                        <span className="metric-trend neutral-text">
                            Awaiting student or company signature — click to filter
                        </span>
                    </div>
                </div>

                <div className="internship-metric-card" style={{ cursor: 'pointer' }}
                    onClick={() => { setStatusFilter('Validated'); setPage(1); }}>
                    <div className="metric-top">
                        <div className="metric-info">
                            <span className="metric-subtitle">FULLY VALIDATED</span>
                            <h2>{convStats.validated ?? 0}</h2>
                        </div>
                        <div className="metric-icon-box bg-purple-dark">
                            <ClipboardCheck size={20} className="color-purple-light" />
                        </div>
                    </div>
                    <div className="metric-bottom">
                        <span className="metric-trend color-green">
                            {convStats.total ?? 0} total conventions — click to filter
                        </span>
                    </div>
                </div>
            </div>

            {/* Status Filter Bar */}
            <div className="internships-filters-bar">
                <div className="filters-left">
                    <div className="filter-label"><Filter size={15} /> Status:</div>
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.key}
                            className={`filter-pill ${statusFilter === f.key ? 'active' : ''}`}
                            onClick={() => { setStatusFilter(f.key); setPage(1); }}
                        >
                            {f.label}
                            {/* Live count badge */}
                            <span style={{
                                marginLeft: 6,
                                background: statusFilter === f.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                                borderRadius: 10,
                                padding: '0 6px',
                                fontSize: 10,
                                fontWeight: 700
                            }}>
                                {f.key === 'All'       ? rows.length
                                : f.key === 'Pending'  ? rows.filter(r => r.status === 'pending').length
                                : f.key === 'Accepted' ? rows.filter(r => r.status === 'accepted' && !r.convention_id).length
                                : f.key === 'NeedsSign'? rows.filter(r => r.convention_status === 'pending_admin_validation').length
                                : f.key === 'InSigning'? rows.filter(r => ['pending_student_signature','pending_company_signature'].includes(r.convention_status)).length
                                : f.key === 'Validated'? rows.filter(r => r.convention_status === 'validated').length
                                : 0}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#112240', borderRadius: '8px', padding: '0 10px', height: '40px' }}>
                    <Search size={16} color="#8892b0" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', padding: '10px', outline: 'none', width: '150px' }}
                    />
                </div>

                <div className="search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#112240', borderRadius: '8px', padding: '0 10px', height: '40px' }}>
                    <Calendar size={16} color="#8892b0" />
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        title="Filter by submission date"
                        style={{ background: 'transparent', border: 'none', color: '#8892b0', padding: '10px', outline: 'none' }}
                    />
                </div>

                <span style={{ fontSize: 12, color: '#4b5563', marginLeft: 'auto' }}>
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            {error ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#f87171' }}>
                    <AlertCircle size={32} style={{ marginBottom: 12 }} />
                    <p>{error}</p>
                    <button onClick={fetchData} style={{ marginTop: 12, background: '#9e59ff', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}>Retry</button>
                </div>
            ) : loading ? (
                <div style={{ textAlign: 'center', padding: '80px', color: '#8892b0' }}>
                    <Loader2 size={36} color="#9e59ff" style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }} />
                    Loading agreements…
                </div>
            ) : (
                <div className="internships-table-container">
                    <table className="internships-table">
                        <thead>
                            <tr>
                                <th>STUDENT</th>
                                <th>COMPANY</th>
                                <th>OFFER</th>
                                <th>APPLIED</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '50px', color: '#4b5563' }}>
                                        No agreements found for this filter.
                                    </td>
                                </tr>
                            ) : paged.map((row) => {
                                const s = getStatus(row);
                                const companyInitial = (row.company_name || '?')[0].toUpperCase();
                                return (
                                    <tr key={row.id}>
                                        <td>
                                            <div className="student-profile">
                                                <Avatar name={row.student_name} />
                                                <div className="profile-text">
                                                    <strong>{row.student_name || 'Unknown'}</strong>
                                                    <span>{row.student_email || `ID: ${row.id}`}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="company-info-cell">
                                                <div className="company-logo-mini">{companyInitial}</div>
                                                <strong>{row.company_name || '—'}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="offer-info-cell">
                                                <strong>{row.offer_title || '—'}</strong>
                                                <span>{new Date(row.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}</span>
                                            </div>
                                        </td>
                                        <td className="date-cell">
                                            {new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <span className={`internship-status-pill ${s.cls}`}>{s.label}</span>
                                        </td>
                                        <td>
                                            <div className="table-action-icons">
                                                {/* Download convention PDF if it exists */}
                                                <button
                                                    className="icon-btn"
                                                    title={row.convention_id ? 'Download Convention PDF' : 'No convention yet'}
                                                    onClick={() => handleDownload(row)}
                                                    disabled={!row.convention_id}
                                                    style={{ opacity: row.convention_id ? 1 : 0.3 }}
                                                >
                                                    <Download size={17} />
                                                </button>
                                                {/* Convention status indicator */}
                                                {row.convention_id ? (
                                                    <span title={`Convention #${row.convention_id}`} style={{ color: '#34d399' }}>
                                                        <CheckCircle2 size={17} />
                                                    </span>
                                                ) : (
                                                    <span title="No convention generated" style={{ color: '#4b5563' }}>
                                                        <Clock size={17} />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="table-footer">
                        <span className="showing-text">
                            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                        </span>
                        <div className="pagination">
                            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                                .reduce((acc, n, idx, arr) => {
                                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                                    acc.push(n);
                                    return acc;
                                }, [])
                                .map((n, i) =>
                                    n === '…'
                                        ? <span key={`e${i}`} className="page-ellipsis">…</span>
                                        : <button key={n} className={`page-btn ${n === page ? 'active-page' : ''}`} onClick={() => setPage(n)}>{n}</button>
                                )
                            }
                            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInternships;
