import React from 'react';
import { 
    Download, 
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    FileText,
    FileSpreadsheet,
    Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import './AdminReports.css';

const AdminReports = () => {

    const topCompanies = [
        { name: 'Sonatrach', sector: 'Energy / Oil & Gas', initial: 'S', color: '#1a1a1a', textCol: '#9ca3af', count: 42 },
        { name: 'Ooredoo', sector: 'Telecommunications', initial: 'O', color: '#ff1b90', textCol: '#fff', bg: 'rgba(255, 27, 144, 0.1)', border: '#ff1b90', isPink: true },
        { name: 'Yassir', sector: 'Technology / SaaS', initial: 'Y', color: '#1a1a1a', textCol: '#9ca3af', count: 28 },
        { name: 'Air Algérie', sector: 'Aviation', initial: 'A', color: '#1a1a1a', textCol: '#9ca3af', count: 19 },
    ];

    return (
        <div className="admin-reports-page">
            {/* Header Section */}
            <div className="reports-header-section">
                <div className="reports-header-text">
                    <h1>Reports & Analytics</h1>
                    <p>Analyze internship outcomes and export detailed reports for your university. Monitor performance trends and industry partnerships.</p>
                </div>
                <div className="reports-header-dropdowns">
                    <div className="rep-dropdown-group">
                        <label>ACADEMIC YEAR</label>
                        <select className="rep-dark-select"><option>2025/2026</option></select>
                    </div>
                    <div className="rep-dropdown-group">
                        <label>SEMESTER</label>
                        <select className="rep-dark-select"><option>All Semesters</option></select>
                    </div>
                    <div className="rep-dropdown-group">
                        <label>DEPARTMENT</label>
                        <select className="rep-dark-select"><option>All Departments</option></select>
                    </div>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="reports-stats-grid">
                <motion.div className="rep-stat-card" whileHover={{ y: -2 }}>
                    <span className="rep-stat-title">PLACEMENT RATE</span>
                    <div className="rep-stat-val-row">
                        <h2>72%</h2>
                        <span className="rep-trend positive"><ArrowUpRight size={14}/> +4%</span>
                    </div>
                </motion.div>
                
                <motion.div className="rep-stat-card" whileHover={{ y: -2 }}>
                    <span className="rep-stat-title">INTERNSHIPS COMPLETED</span>
                    <div className="rep-stat-val-row">
                        <h2>315</h2>
                        <span className="rep-trend target"><CheckCircle2 size={12}/> Target: 400</span>
                    </div>
                </motion.div>

                <motion.div className="rep-stat-card" whileHover={{ y: -2 }}>
                    <span className="rep-stat-title">ACTIVE PARTNERS</span>
                    <div className="rep-stat-val-row">
                        <h2>84</h2>
                        <span className="rep-trend new-item"><span className="rep-diamond">✦</span> +12 new</span>
                    </div>
                </motion.div>

                <motion.div className="rep-stat-card" whileHover={{ y: -2 }}>
                    <span className="rep-stat-title">AVG DURATION</span>
                    <div className="rep-stat-val-row">
                        <h2>4.5m</h2>
                        <span className="rep-trend optimal"><Clock size={12}/> Optimal</span>
                    </div>
                </motion.div>
            </div>

            {/* Huge Chart Card */}
            <div className="rep-chart-card">
                <div className="rep-chart-header">
                    <div>
                        <h3>Internship placements over time</h3>
                        <p>Monthly volume of student internship approvals from Oct to Jun</p>
                    </div>
                    <div className="rep-chart-legend">
                        <span className="legend-item"><span className="legend-dot purple"></span> CURRENT YEAR</span>
                        <span className="legend-item"><span className="legend-dot gray"></span> PREV. YEAR</span>
                    </div>
                </div>
                
                {/* SVG Curve Approximation */}
                <div className="rep-svg-container">
                    <svg viewBox="0 0 800 250" preserveAspectRatio="none" className="rep-smooth-curve">
                        <defs>
                            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(158, 89, 255, 0.4)" />
                                <stop offset="100%" stopColor="rgba(158, 89, 255, 0.0)" />
                            </linearGradient>
                            <linearGradient id="purpleLine" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#9e59ff" />
                                <stop offset="100%" stopColor="#c4b5fd" />
                            </linearGradient>
                        </defs>
                        {/* Gradient Fill under curve */}
                        <path 
                            d="M0,180 C80,180 120,190 180,180 C260,166 280,130 320,140 C360,150 380,240 420,240 C460,240 480,50 520,50 C560,50 580,230 620,230 C660,230 680,40 720,40 C760,40 780,220 800,220 L800,250 L0,250 Z" 
                            fill="url(#purpleGrad)" 
                        />
                        {/* the stroke line itself */}
                        <path 
                            d="M0,180 C80,180 120,190 180,180 C260,166 280,130 320,140 C360,150 380,240 420,240 C460,240 480,50 520,50 C560,50 580,230 620,230 C660,230 680,40 720,40 C760,40 780,220 800,220" 
                            fill="none" 
                            stroke="url(#purpleLine)" 
                            strokeWidth="3" 
                        />
                    </svg>
                    
                    <div className="rep-x-axis">
                        <span>OCT</span><span>NOV</span><span>DEC</span><span>JAN</span>
                        <span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                    </div>
                </div>
            </div>

            {/* Split Grid: Programs & Top Companies */}
            <div className="rep-split-grid">
                <div className="rep-panel-card">
                    <h3>Placement by Program</h3>
                    <div className="rep-program-bars">
                        <div className="prog-bar-group">
                            <div className="prog-bar-labels">
                                <span className="prog-name">SOFTWARE ENGINEERING</span>
                                <span className="prog-val">124 INTERNS</span>
                            </div>
                            <div className="prog-bar-rail"><div className="prog-bar-fill grad-pink" style={{width: '80%'}}></div></div>
                        </div>

                        <div className="prog-bar-group">
                            <div className="prog-bar-labels">
                                <span className="prog-name">DATA SCIENCE</span>
                                <span className="prog-val">82 INTERNS</span>
                            </div>
                            <div className="prog-bar-rail"><div className="prog-bar-fill grad-pink-short" style={{width: '60%'}}></div></div>
                        </div>

                        <div className="prog-bar-group">
                            <div className="prog-bar-labels">
                                <span className="prog-name">CYBERSECURITY</span>
                                <span className="prog-val">54 INTERNS</span>
                            </div>
                            <div className="prog-bar-rail"><div className="prog-bar-fill red" style={{width: '35%'}}></div></div>
                        </div>

                        <div className="prog-bar-group">
                            <div className="prog-bar-labels">
                                <span className="prog-name">MECHANICAL ENGINEERING</span>
                                <span className="prog-val">45 INTERNS</span>
                            </div>
                            <div className="prog-bar-rail"><div className="prog-bar-fill purple" style={{width: '30%'}}></div></div>
                        </div>
                    </div>
                </div>

                <div className="rep-panel-card">
                    <h3>Top Hiring Companies</h3>
                    <div className="rep-hiring-table">
                        <div className="rep-table-header">
                            <span>COMPANY</span>
                            <span>SECTOR</span>
                            <span>INTERN COUNT</span>
                        </div>
                        <div className="rep-table-rows">
                            {topCompanies.map((comp, i) => (
                                <div className="rep-table-row" key={i}>
                                    <div className="rep-comp-name">
                                        <div 
                                            className="rep-comp-logo" 
                                            style={{
                                                backgroundColor: comp.bg || '#2a2a2a', 
                                                color: comp.textCol,
                                                border: comp.border ? `1px solid ${comp.border}` : 'none'
                                            }}
                                        >
                                            {comp.initial}
                                        </div>
                                        <span>{comp.name}</span>
                                    </div>
                                    <div className="rep-comp-sector">{comp.sector}</div>
                                    <div className="rep-comp-count">
                                        <div className={`count-badge ${comp.isPink ? 'pink' : ''}`}>
                                            {comp.count || 35}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Grid 2: Type & Locations */}
            <div className="rep-split-grid">
                <div className="rep-panel-card donut-panel">
                    <h3>Internship Type</h3>
                    <div className="rep-donut-row">
                        <div className="rep-donut-chart">
                            <svg viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2a2a" strokeWidth="12" />
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#c4b5fd" strokeWidth="12" strokeDasharray="314" strokeDashoffset="160" />
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#6b21a8" strokeWidth="12" strokeDasharray="314" strokeDashoffset="260" strokeLinecap="round" transform="rotate(180 60 60)" />
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#fbcfe8" strokeWidth="12" strokeDasharray="314" strokeDashoffset="280" strokeLinecap="round" transform="rotate(-90 60 60)" />
                            </svg>
                            <div className="donut-center-text">
                                <strong>PFE</strong>
                                <span>48% DOMINANT</span>
                            </div>
                        </div>
                        <div className="rep-donut-legend">
                            <div className="d-legend-item">
                                <span className="d-dot purple"></span>
                                <div className="d-text"><strong>PFE (Final Year)</strong><span>48% - 151 students</span></div>
                            </div>
                            <div className="d-legend-item">
                                <span className="d-dot pink"></span>
                                <div className="d-text"><strong>Summer Internship</strong><span>32% - 101 students</span></div>
                            </div>
                            <div className="d-legend-item">
                                <span className="d-dot dark-purple"></span>
                                <div className="d-text"><strong>Observations</strong><span>20% - 63 students</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rep-panel-card">
                    <h3>Internship Locations</h3>
                    <div className="rep-locations-list">
                        <div className="rep-loc-item">
                            <span className="loc-name">ALGIERS</span>
                            <div className="loc-bar-bg"><div className="loc-bar-fill purple-light" style={{width: '75%'}}></div></div>
                            <span className="loc-val">236</span>
                        </div>
                        <div className="rep-loc-item">
                            <span className="loc-name">ORAN</span>
                            <div className="loc-bar-bg"><div className="loc-bar-fill pink-light" style={{width: '45%'}}></div></div>
                            <span className="loc-val">142</span>
                        </div>
                        <div className="rep-loc-item">
                            <span className="loc-name">REMOTE</span>
                            <div className="loc-bar-bg"><div className="loc-bar-fill purple-dark" style={{width: '30%'}}></div></div>
                            <span className="loc-val">94</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Downloads Section */}
            <div className="rep-downloads-card">
                <div className="dl-top-row">
                    <div className="dl-title">
                        <h3>Download Reports</h3>
                        <p>Generate and download official academic records and placement summaries.</p>
                    </div>
                    <div className="dl-actions">
                        <button className="dl-filter-btn"><Filter size={14}/> More Filters</button>
                        <button className="dl-export-btn"><Download size={14}/> Export All</button>
                    </div>
                </div>

                <div className="dl-grid">
                    <div className="dl-file-card">
                        <div className="dl-icon-box red-bg"><FileText size={20} color="#ef4444"/></div>
                        <div className="dl-file-info">
                            <h4>Full Placement Report</h4>
                            <span>PDF • 12.4 MB • UPDATED 2H AGO</span>
                        </div>
                        <button className="dl-small-btn"><Download size={14}/></button>
                    </div>

                    <div className="dl-file-card">
                        <div className="dl-icon-box green-bg"><FileSpreadsheet size={20} color="#10b981"/></div>
                        <div className="dl-file-info">
                            <h4>Company Participation</h4>
                            <span>CSV • 2.1 MB • UPDATED 1D AGO</span>
                        </div>
                        <button className="dl-small-btn"><Download size={14}/></button>
                    </div>

                    <div className="dl-file-card">
                        <div className="dl-icon-box red-bg"><FileText size={20} color="#ef4444"/></div>
                        <div className="dl-file-info">
                            <h4>Student Performance Summary</h4>
                            <span>PDF • 8.7 MB • UPDATED 4D AGO</span>
                        </div>
                        <button className="dl-small-btn"><Download size={14}/></button>
                    </div>

                    <div className="dl-file-card">
                        <div className="dl-icon-box green-bg"><FileSpreadsheet size={20} color="#10b981"/></div>
                        <div className="dl-file-info">
                            <h4>Internship Duration Trends</h4>
                            <span>CSV • 1.5 MB • UPDATED 1W AGO</span>
                        </div>
                        <button className="dl-small-btn"><Download size={14}/></button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminReports;
