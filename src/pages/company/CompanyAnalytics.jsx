import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, BarChart3, Users, Briefcase,
    ArrowUpRight, ArrowDownRight, Target, Clock,
    TrendingUp, Award, Zap, PieChart, Menu, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services/api';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyProfile.css';
import '../company/CompanyDashboard.css';

const CompanyAnalytics = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await companyService.getAnalytics();
                setData(response);
                setError(null);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load recruitment insights.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const metrics = data ? [
        {
            label: 'Total Applications',
            value: data.conversion_funnel.applications.toString(),
            positive: true,
            icon: Users,
            color: '#9e59ff'
        },
        {
            label: 'Candidate Quality',
            value: `${data.performance_metrics.candidate_quality_score}%`,
            positive: true,
            icon: Target,
            color: '#3b82f6'
        },
        {
            label: 'Avg. Hire Time',
            value: `${data.performance_metrics.avg_time_to_hire} days`,
            positive: true,
            icon: Clock,
            color: '#f59e0b'
        },
        {
            label: 'Acceptance Rate',
            value: `${data.performance_metrics.acceptance_rate}%`,
            positive: false,
            icon: Award,
            color: '#ff1b90'
        }
    ] : [
        { label: 'Total Applications', value: '...', positive: true, icon: Users, color: '#9e59ff' },
        { label: 'Candidate Quality', value: '...', positive: true, icon: Target, color: '#3b82f6' },
        { label: 'Avg. Hire Time', value: '...', positive: true, icon: Clock, color: '#f59e0b' },
        { label: 'Acceptance Rate', value: '...', positive: false, icon: Award, color: '#ff1b90' }
    ];

    if (loading) return (
        <div className="company-profile-dashboard">
            <CompanySidebar activePath="analytics" />
            <main className="profile-main-content">
                <div className="analytics-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <div className="loading-spinner-modern"></div>
                </div>
            </main>
        </div>
    );

    return (
        <div className="company-profile-dashboard">
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
                <CompanySidebar activePath="analytics" onClose={() => setSidebarOpen(false)} />
            </aside>



            <main className="profile-main-content">
                <div className="analytics-container">
                    <header className="edit-header-modern">
                        <button className="back-btn-modern" onClick={() => navigate(-1)}>
                            <ChevronLeft size={16} /> Back to Profile
                        </button>
                        <div className="header-text-modern">
                            <h1>Recruitment Analytics</h1>
                            <p>Data-driven insights into your hiring performance.</p>
                        </div>
                    </header>

                    {/* Meta Stats Panel */}
                    <div className="analytics-grid-modern">

                        {metrics.map((m, idx) => (
                            <div key={idx} className="metric-card-modern">
                                <div className="metric-top">
                                    <div className="metric-icon-wrap" style={{ backgroundColor: `${m.color}15`, color: m.color }}>
                                        <m.icon size={20} />
                                    </div>
                                    <div className={`metric-change ${m.positive ? 'up' : 'down'}`}>
                                    </div>
                                </div>
                                <div className="metric-body">
                                    <span className="metric-label">{m.label}</span>
                                    <div className="metric-value">{m.value}</div>
                                </div>
                                <div className="metric-sparkline">
                                    <div className="spark-bar" style={{ height: '40%', background: m.color }}></div>
                                    <div className="spark-bar" style={{ height: '60%', background: m.color }}></div>
                                    <div className="spark-bar" style={{ height: '50%', background: m.color }}></div>
                                    <div className="spark-bar" style={{ height: '80%', background: m.color }}></div>
                                    <div className="spark-bar" style={{ height: '70%', background: m.color }}></div>
                                </div>
                            </div>
                        ))}

                        {/* Conversion Funnel */}
                        <div className="analytics-section-card funnel-card">
                            <div className="section-title-modern">
                                <Target size={18} /> Recruitment Funnel
                            </div>
                            <div className="funnel-display">
                                <div className="funnel-layer l1">
                                    <div className="layer-label">Applicants</div>
                                    <div className="layer-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                                    <div className="layer-val">{data?.conversion_funnel.applications || 0}</div>
                                </div>
                                <div className="funnel-layer l2">
                                    <div className="layer-label">Interviews</div>
                                    <div className="layer-bar"><div className="fill" style={{ width: `${(data?.conversion_funnel.interviews / data?.conversion_funnel.applications * 100) || 0}%` }}></div></div>
                                    <div className="layer-val">{data?.conversion_funnel.interviews || 0}</div>
                                </div>
                                <div className="funnel-layer l3">
                                    <div className="layer-label">Offers</div>
                                    <div className="layer-bar"><div className="fill" style={{ width: `${(data?.conversion_funnel.acceptances / data?.conversion_funnel.applications * 100) || 0}%` }}></div></div>
                                    <div className="layer-val">{data?.conversion_funnel.acceptances || 0}</div>
                                </div>
                                <div className="funnel-layer l4">
                                    <div className="layer-label">Signed</div>
                                    <div className="layer-bar"><div className="fill" style={{ width: `${(data?.conversion_funnel.signed_conventions / data?.conversion_funnel.applications * 100) || 0}%` }}></div></div>
                                    <div className="layer-val">{data?.conversion_funnel.signed_conventions || 0}</div>
                                </div>
                            </div>
                        </div>

                        {/* Top Channels / Performance */}
                        <div className="analytics-section-card">
                            <div className="section-title-modern">
                                <Zap size={18} /> Top Sourcing Channels
                            </div>
                            <div className="performance-list">
                                {data?.applications_by_speciality.length > 0 ? (
                                    data.applications_by_speciality.map((item, i) => (
                                        <div key={i} className="perf-item">
                                            <div className="perf-info">
                                                <span>{item.speciality}</span>
                                                <strong>{Math.round((item.count / data.conversion_funnel.applications) * 100)}%</strong>
                                            </div>
                                            <div className="perf-track">
                                                <div className="perf-fill" style={{
                                                    width: `${(item.count / data.conversion_funnel.applications) * 100}%`,
                                                    backgroundColor: ['#9e59ff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 5]
                                                }}></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data-msg">No specialty data available yet.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyAnalytics;
