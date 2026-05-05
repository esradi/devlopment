import React, { useState, useEffect } from 'react';
import {
    Download, ArrowUpRight, CheckCircle2, Clock, FileText,
    FileSpreadsheet, Users, Building2, Briefcase, ShieldCheck,
    Loader2, RefreshCw, AlertCircle, TrendingUp, Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/api';
import './AdminReports.css';

/* ─── tiny reusable pieces ──────────────────────────────────── */
const SectionLabel = ({ children }) => (
    <div className="rep-section-label">{children}</div>
);

const KpiCard = ({ title, value, sub, icon: Icon, iconColor, iconBg, delay = 0 }) => (
    <motion.div
        className="rep-kpi-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay }}
        whileHover={{ y: -3 }}
    >
        <div className="rep-kpi-top">
            <span className="rep-kpi-title">{title}</span>
            <div className="rep-kpi-icon" style={{ background: iconBg }}>
                <Icon size={15} color={iconColor} />
            </div>
        </div>
        <div className="rep-kpi-value">{value}</div>
        <div className="rep-kpi-sub">{sub}</div>
    </motion.div>
);

const FunnelBar = ({ label, value, max, color, delay }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="rep-funnel-row">
            <span className="rep-funnel-label">{label}</span>
            <div className="rep-funnel-track">
                <motion.div
                    className="rep-funnel-fill"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay, ease: 'easeOut' }}
                />
            </div>
            <span className="rep-funnel-num">{value}</span>
            <span className="rep-funnel-pct">{pct}%</span>
        </div>
    );
};

/* ─── main component ─────────────────────────────────────────── */
const AdminReports = () => {
    const [dashboard, setDashboard] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [convStats, setConvStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(null); // track which export is running

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [dash, ana, conv] = await Promise.all([
                adminService.getDashboard(),
                adminService.getAnalytics(),
                adminService.getConventionStats(),
            ]);
            setDashboard(dash);
            setAnalytics(ana);
            setConvStats(conv);
        } catch (err) {
            console.error('Reports load error:', err);
            setError('Could not load analytics. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const runExport = async (key, fn) => {
        setExporting(key);
        try { await fn(); } catch (e) { console.error(e); } finally { setExporting(null); }
    };

    /* ── derived values ── */
    const stats            = dashboard?.stats || {};
    const funnel           = analytics?.funnel || {};
    const specialities     = analytics?.specialities || [];
    const skills           = analytics?.skills || [];

    const totalStudents        = stats?.users?.students ?? 0;
    const totalCompanies       = stats?.users?.companies ?? 0;
    const totalApplications    = stats?.applications?.total ?? 0;
    const activeOffers         = stats?.offers?.active ?? 0;
    const pendingConventions   = convStats?.pending_admin ?? 0;
    const validatedConventions = convStats?.validated ?? 0;
    const totalConventions     = convStats?.total ?? 0;
    const inProgressConventions= convStats?.in_progress ?? 0;

    // Use funnel.accepted (distinct students accepted) — dashboard's applications.accepted
    // returns students_with_internship (validated conventions), not accepted applications
    const acceptedApplications = funnel.accepted ?? stats?.applications?.accepted ?? 0;
    const pendingApplications  = stats?.applications?.pending ?? 0;

    const placementRate   = totalStudents > 0 ? Math.round((acceptedApplications / totalStudents) * 100) : 0;
    const conventionRate  = totalConventions > 0 ? Math.round((validatedConventions / totalConventions) * 100) : 0;
    const maxSpec         = specialities.length > 0 ? Math.max(...specialities.map(s => s.applications || 1)) : 1;
    // Pending actions - correct field paths from dashboard API
    const pendingCompanyVerif = stats?.validations?.company ?? 0;
    const pendingStudentIds   = stats?.users?.pending_id_verifications ?? 0;
    const expiredOffers       = stats?.offers?.expired ?? 0;

    /* ── loading / error states ── */
    if (loading) return (
        <div className="rep-center-state">
            <Loader2 size={38} color="#9e59ff" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading live analytics…</p>
        </div>
    );

    if (error) return (
        <div className="rep-center-state">
            <AlertCircle size={38} color="#f87171" />
            <p style={{ color: '#f87171' }}>{error}</p>
            <button className="rep-retry-btn" onClick={fetchData}>Retry</button>
        </div>
    );

    return (
        <div className="admin-reports-page">

            {/* ══════════════ STICKY HEADER ══════════════ */}
            <div className="rep-page-header">
                <div>
                    <h1>Reports &amp; Analytics</h1>
                    <p>Live data — all metrics pulled directly from the platform database.</p>
                </div>
                <div className="rep-header-actions">
                    <button className="rep-ghost-btn" onClick={fetchData}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button
                        className="rep-primary-btn"
                        onClick={() => runExport('students', adminService.exportUsers.bind(null, 'student'))}
                        disabled={exporting === 'students'}
                    >
                        {exporting === 'students'
                            ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Download size={14} />}
                        Export Students
                    </button>
                </div>
            </div>

            {/* ══════════════ ROW 1 — KPI STRIP ══════════════ */}
            <SectionLabel>Platform Overview</SectionLabel>
            <div className="rep-kpi-grid">
                <KpiCard delay={0}    title="PLACEMENT RATE"        value={`${placementRate}%`}      sub={`${acceptedApplications} accepted out of ${totalStudents} students`} icon={Users}       iconColor="#9e59ff" iconBg="rgba(158,89,255,0.12)" />
                <KpiCard delay={0.05} title="ACTIVE OFFERS"         value={activeOffers}              sub={`${totalApplications} applications received in total`}               icon={Briefcase}   iconColor="#ec4899" iconBg="rgba(236,72,153,0.12)" />
                <KpiCard delay={0.1}  title="PARTNER COMPANIES"     value={totalCompanies}            sub="Registered companies on the platform"                                icon={Building2}   iconColor="#34d399" iconBg="rgba(52,211,153,0.12)" />
                <KpiCard delay={0.15} title="CONVENTION COMPLETION" value={`${conventionRate}%`}      sub={`${validatedConventions} validated out of ${totalConventions} total`} icon={ShieldCheck}  iconColor="#a855f7" iconBg="rgba(168,85,247,0.12)" />
            </div>

            {/* ══════════════ ROW 2 — MAIN CONTENT + SIDEBAR ══════════════ */}
            <div className="rep-two-col">

                {/* ── LEFT COLUMN ── */}
                <div className="rep-main-col">

                    {/* Funnel */}
                    <SectionLabel>Internship Pipeline</SectionLabel>
                    <div className="rep-card">
                        <div className="rep-card-head">
                            <div>
                                <h3>Student Journey Funnel</h3>
                                <p>From registration to a fully signed convention</p>
                            </div>
                            <span className="rep-live-badge">● LIVE</span>
                        </div>
                        <div className="rep-funnel-list">
                            {[
                                { label: 'Registered',         value: funnel.registered ?? totalStudents,       color: '#9e59ff' },
                                { label: 'Applied to Offers',  value: funnel.applied ?? totalApplications,      color: '#c084fc' },
                                { label: 'Accepted',           value: funnel.accepted ?? acceptedApplications,  color: '#ec4899' },
                                { label: 'Convention Signed',  value: funnel.signed_convention ?? validatedConventions, color: '#34d399' },
                            ].map((s, i) => (
                                <FunnelBar
                                    key={i}
                                    label={s.label}
                                    value={s.value}
                                    max={funnel.registered ?? totalStudents}
                                    color={s.color}
                                    delay={i * 0.12}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Applications by Speciality */}
                    <SectionLabel>Academic Breakdown</SectionLabel>
                    <div className="rep-card">
                        <div className="rep-card-head">
                            <div>
                                <h3>Applications by Speciality</h3>
                                <p>Which fields are most active on the platform</p>
                            </div>
                        </div>
                        {specialities.length > 0 ? (
                            <div className="rep-spec-list">
                                {specialities.slice(0, 7).map((s, i) => {
                                    const pct = maxSpec > 0 ? Math.round((s.applications / maxSpec) * 100) : 0;
                                    const COLORS = ['#9e59ff','#ec4899','#34d399','#fbbf24','#60a5fa','#f87171','#a78bfa'];
                                    return (
                                        <div key={i} className="rep-spec-row">
                                            <span className="rep-spec-name">{(s.speciality || 'Unknown').toUpperCase()}</span>
                                            <div className="rep-spec-track">
                                                <motion.div
                                                    className="rep-spec-fill"
                                                    style={{ background: COLORS[i % COLORS.length] }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.07 }}
                                                />
                                            </div>
                                            <span className="rep-spec-val">{s.applications}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rep-empty">No application data yet — students need to apply to offers.</div>
                        )}
                    </div>

                    {/* Skills Demand vs Supply */}
                    {skills.length > 0 && (
                        <>
                            <SectionLabel>Skill Gap Analysis</SectionLabel>
                            <div className="rep-card">
                                <div className="rep-card-head">
                                    <div>
                                        <h3>Market Demand vs Student Supply</h3>
                                        <p>Purple = required by offers · Gray = declared by students</p>
                                    </div>
                                    <Award size={18} color="#9e59ff" />
                                </div>
                                <div className="rep-skills-grid-head">
                                    <span>SKILL</span><span>DEMAND</span><span>SUPPLY</span>
                                </div>
                                {skills.slice(0, 8).map((sk, i) => {
                                    const m = Math.max(sk.demand, sk.supply, 1);
                                    return (
                                        <div key={i} className="rep-skill-row">
                                            <span className="rep-skill-name">{sk.skill?.toUpperCase()}</span>
                                            <div className="rep-skill-bar-wrap">
                                                <div className="rep-skill-track">
                                                    <motion.div className="rep-skill-fill purple"
                                                        initial={{ width: 0 }} animate={{ width: `${(sk.demand/m)*100}%` }}
                                                        transition={{ duration: 0.7, delay: i * 0.05 }} />
                                                </div>
                                                <span className="rep-skill-num purple">{sk.demand}</span>
                                            </div>
                                            <div className="rep-skill-bar-wrap">
                                                <div className="rep-skill-track">
                                                    <motion.div className="rep-skill-fill gray"
                                                        initial={{ width: 0 }} animate={{ width: `${(sk.supply/m)*100}%` }}
                                                        transition={{ duration: 0.7, delay: i * 0.05 }} />
                                                </div>
                                                <span className="rep-skill-num gray">{sk.supply}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="rep-side-col">

                    {/* Convention Status */}
                    <SectionLabel>Legal Pipeline</SectionLabel>
                    <div className="rep-card">
                        <div className="rep-card-head">
                            <div>
                                <h3>Convention Status</h3>
                                <p>Current signing stage breakdown</p>
                            </div>
                            <ShieldCheck size={16} color="#a855f7" />
                        </div>
                        <div className="rep-conv-list">
                            {[
                                { label: 'Awaiting Your Signature', value: pendingConventions,    color: '#f87171', bg: 'rgba(248,113,113,0.07)' },
                                { label: 'Partner Signing',         value: inProgressConventions, color: '#fbbf24', bg: 'rgba(251,191,36,0.07)'  },
                                { label: 'Fully Validated',         value: validatedConventions,  color: '#34d399', bg: 'rgba(52,211,153,0.07)'  },
                                { label: 'Total Created',           value: totalConventions,      color: '#a855f7', bg: 'rgba(168,85,247,0.07)'  },
                            ].map((item, i) => (
                                <div key={i} className="rep-conv-row" style={{ background: item.bg }}>
                                    <span className="rep-conv-label">{item.label}</span>
                                    <span className="rep-conv-val" style={{ color: item.color }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        {/* mini donut */}
                        <div className="rep-donut-mini-wrap">
                            <svg viewBox="0 0 80 80" className="rep-donut-mini">
                                <circle cx="40" cy="40" r="32" fill="none" stroke="#2a2a2a" strokeWidth="10" />
                                {totalConventions > 0 && (
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="#34d399" strokeWidth="10"
                                        strokeDasharray={`${(validatedConventions / totalConventions) * 201} 201`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 40 40)" />
                                )}
                            </svg>
                            <div className="rep-donut-mini-label">
                                <strong>{conventionRate}%</strong>
                                <span>Done</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Exports */}
                    <SectionLabel>Data Exports</SectionLabel>
                    <div className="rep-card rep-exports-card">
                        {[
                            {
                                key: 'students',
                                icon: FileText, iconColor: '#ef4444', iconBg: 'rgba(239,68,68,0.1)',
                                title: 'Students List',
                                sub: 'XLSX · all students + status',
                                action: () => adminService.exportUsers('student'),
                                available: true,
                            },
                            {
                                key: 'apps',
                                icon: FileSpreadsheet, iconColor: '#10b981', iconBg: 'rgba(16,185,129,0.1)',
                                title: 'Applications',
                                sub: 'XLSX · with convention info',
                                action: () => adminService.exportApplications({}),
                                available: true,
                            },
                            {
                                key: 'conv',
                                icon: FileText, iconColor: '#a855f7', iconBg: 'rgba(168,85,247,0.1)',
                                title: 'Signed Conventions',
                                sub: 'Available per-convention below',
                                action: null,
                                available: false,
                            },
                        ].map((ex) => (
                            <div key={ex.key} className={`rep-export-row ${!ex.available ? 'disabled' : ''}`}>
                                <div className="rep-export-icon" style={{ background: ex.iconBg }}>
                                    <ex.icon size={16} color={ex.iconColor} />
                                </div>
                                <div className="rep-export-info">
                                    <span className="rep-export-title">{ex.title}</span>
                                    <span className="rep-export-sub">{ex.sub}</span>
                                </div>
                                {ex.available ? (
                                    <button
                                        className="rep-dl-btn"
                                        onClick={() => runExport(ex.key, ex.action)}
                                        disabled={exporting === ex.key}
                                    >
                                        {exporting === ex.key
                                            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                            : <Download size={13} />}
                                    </button>
                                ) : (
                                    <div className="rep-dl-btn disabled"><Download size={13} /></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Quick Stats summary */}
                    <SectionLabel>Pending Actions</SectionLabel>
                    <div className="rep-card">
                        {[
                            { label: 'Pending Applications',  value: pendingApplications,  color: '#fbbf24' },
                            { label: 'Unverified Companies',  value: pendingCompanyVerif,  color: '#f87171' },
                            { label: 'Unverified Student IDs',value: pendingStudentIds,    color: '#f87171' },
                            { label: 'Expired Active Offers', value: expiredOffers,        color: '#f87171' },
                        ].map((a, i) => (
                            <div key={i} className="rep-action-row">
                                <span className="rep-action-label">{a.label}</span>
                                <span className="rep-action-val" style={{ color: a.value > 0 ? a.color : '#4b5563' }}>
                                    {a.value > 0 ? a.value : '✓'}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminReports;
