import React from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, BarChart3, Users, Briefcase, 
    ArrowUpRight, ArrowDownRight, Target, Clock,
    TrendingUp, Award, Zap, PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyProfile.css';

const CompanyAnalytics = () => {
    const navigate = useNavigate();

    const metrics = [
        { label: 'Total Applications', value: '428', change: '+12%', positive: true, icon: Users, color: '#9e59ff' },
        { label: 'Active Offers', value: '12', change: '+2', positive: true, icon: Briefcase, color: '#3b82f6' },
        { label: 'Avg. Response Time', value: '2.4 days', change: '-10%', positive: true, icon: Clock, color: '#f59e0b' },
        { label: 'Conversion Rate', value: '6.4%', change: '-2%', positive: false, icon: Award, color: '#ff1b90' }
    ];

    return (
        <div className="company-profile-dashboard">
            <CompanySidebar activePath="profile" />

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
                                        {m.change} {m.positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
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
                                    <div className="layer-bar"><div className="fill" style={{width: '100%'}}></div></div>
                                    <div className="layer-val">428</div>
                                </div>
                                <div className="funnel-layer l2">
                                    <div className="layer-label">In Review</div>
                                    <div className="layer-bar"><div className="fill" style={{width: '65%'}}></div></div>
                                    <div className="layer-val">278</div>
                                </div>
                                <div className="funnel-layer l3">
                                    <div className="layer-label">Interviews</div>
                                    <div className="layer-bar"><div className="fill" style={{width: '32%'}}></div></div>
                                    <div className="layer-val">136</div>
                                </div>
                                <div className="funnel-layer l4">
                                    <div className="layer-label">Offers</div>
                                    <div className="layer-bar"><div className="fill" style={{width: '12%'}}></div></div>
                                    <div className="layer-val">52</div>
                                </div>
                            </div>
                        </div>

                        {/* Top Channels / Performance */}
                        <div className="analytics-section-card">
                            <div className="section-title-modern">
                                <Zap size={18} /> Top Sourcing Channels
                            </div>
                            <div className="performance-list">
                                {[
                                    { name: 'Direct Search', pct: 45, color: '#9e59ff' },
                                    { name: 'University Partnerships', pct: 32, color: '#3b82f6' },
                                    { name: 'Referrals', pct: 18, color: '#10b981' },
                                    { name: 'External Ads', pct: 5, color: '#8892b0' }
                                ].map((item, i) => (
                                    <div key={i} className="perf-item">
                                        <div className="perf-info">
                                            <span>{item.name}</span>
                                            <strong>{item.pct}%</strong>
                                        </div>
                                        <div className="perf-track">
                                            <div className="perf-fill" style={{ width: `${item.pct}%`, backgroundColor: item.color }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyAnalytics;
