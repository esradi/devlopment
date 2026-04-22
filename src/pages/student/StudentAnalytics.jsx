import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Target, TrendingUp, CheckCircle, Award, PieChart as PieChartIcon } from 'lucide-react';
import { studentService } from '../../services/api';
import './StudentAnalytics.css';

const COLORS = ['#9e59ff', '#00f2fe', '#4facfe', '#10b981', '#f59e0b', '#ef4444'];

const StudentAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await studentService.getAnalytics();
                setAnalyticsData(data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return <div className="analytics-loading"><div className="custom-loader" /></div>;
    }

    if (!analyticsData) {
        return <div className="analytics-error">Failed to load analytics.</div>;
    }

    const { 
        applications_summary, 
        monthly_applications, 
        skills_summary, 
        match_scores_summary, 
        challenges_summary, 
        badges_summary 
    } = analyticsData;

    const skillsData = [
        { name: 'Verified', value: skills_summary?.verified || 0 },
        { name: 'Unverified', value: skills_summary?.unverified || 0 }
    ];

    return (
        <div className="student-analytics-page">
            <div className="analytics-header">
                <h1>Performance Analytics</h1>
                <p>Track your internship application success, skill verifications, and match scores over time.</p>
            </div>

            <motion.div className="analytics-stats-row" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div className="stat-box" variants={itemVariants}>
                    <div className="stat-icon"><TrendingUp size={24} color="#9e59ff" /></div>
                    <div className="stat-content">
                        <h3>{applications_summary?.acceptance_rate || 0}%</h3>
                        <p>Acceptance Rate</p>
                    </div>
                </motion.div>
                <motion.div className="stat-box" variants={itemVariants}>
                    <div className="stat-icon"><Target size={24} color="#00f2fe" /></div>
                    <div className="stat-content">
                        <h3>{match_scores_summary?.avg || 0}%</h3>
                        <p>Avg Match Score</p>
                    </div>
                </motion.div>
                <motion.div className="stat-box" variants={itemVariants}>
                    <div className="stat-icon"><CheckCircle size={24} color="#10b981" /></div>
                    <div className="stat-content">
                        <h3>{skills_summary?.verification_rate || 0}%</h3>
                        <p>Skill Verify Rate</p>
                    </div>
                </motion.div>
                <motion.div className="stat-box" variants={itemVariants}>
                    <div className="stat-icon"><Award size={24} color="#f59e0b" /></div>
                    <div className="stat-content">
                        <h3>{challenges_summary?.attempted || 0}</h3>
                        <p>Challenges Taken</p>
                    </div>
                </motion.div>
            </motion.div>

            <div className="analytics-charts-grid">
                {/* Monthly Applications Line Chart */}
                <motion.div className="chart-card large" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h3>Application Volume</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthly_applications || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9e59ff" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#9e59ff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="#8892b0" fill="#8892b0" />
                                <YAxis stroke="#8892b0" />
                                <Tooltip 
                                    contentStyle={{ background: '#0a192f', border: '1px solid rgba(158, 89, 255, 0.2)', borderRadius: '8px' }} 
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#9e59ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Match Scores Bar Chart */}
                <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <h3>Top Matched Offers</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={(match_scores_summary?.scores_by_offer || []).slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} stroke="#8892b0" />
                                <YAxis dataKey="offer_title" type="category" width={100} stroke="#8892b0" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ background: '#0a192f', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '8px' }}
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                />
                                <Bar dataKey="score" fill="#00f2fe" radius={[0, 4, 4, 0]}>
                                    {
                                        (match_scores_summary?.scores_by_offer || []).slice(0, 5).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Skills Distribution Pie Chart */}
                <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <h3>Skill Verification</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={skillsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {skillsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#0a192f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
            
            <div className="analytics-badges-section">
                <h3>Earned Badges</h3>
                <div className="badges-list">
                    {badges_summary?.badges?.length > 0 ? (
                        badges_summary.badges.map((b, i) => (
                            <div className="badge-item" key={i}>
                                <div className="badge-icon"><Award size={24} /></div>
                                <div className="badge-info">
                                    <h4>{b.badge_name}</h4>
                                    <p>{b.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-badges">No badges earned yet. Keep performing on the platform!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAnalytics;
