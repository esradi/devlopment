import React, { useState } from 'react';
import { 
    User, 
    BookOpen, 
    CheckSquare, 
    Settings, 
    Fingerprint, 
    History,
    Edit2,
    Plus,
    MonitorIcon,
    ExternalLink,
    UploadCloud,
    CloudCog
} from 'lucide-react';
import { motion } from 'framer-motion';
import './AdminSettings.css';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [biometricsEnabled, setBiometricsEnabled] = useState(true);

    return (
        <div className="admin-set-page">
            <div className="set-header">
                <h1>University <span className="highlight-text">Settings</span></h1>
                <p>Configure global academic parameters, manage administrative profiles, and monitor validation performance from the central luminary hub.</p>
            </div>

            <div className="set-layout">
                {/* Left Navigation Navigation */}
                <div className="set-nav-sidebar">
                    <button 
                        className={`set-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} /> Profile & Security
                    </button>
                    <button 
                        className={`set-nav-btn ${activeTab === 'academic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('academic')}
                    >
                        <BookOpen size={18} /> Academic Management
                    </button>
                    <button 
                        className={`set-nav-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
                        onClick={() => setActiveTab('portfolio')}
                    >
                        <CheckSquare size={18} /> Portfolio Validation
                    </button>
                    <button 
                        className={`set-nav-btn ${activeTab === 'system' ? 'active' : ''}`}
                        onClick={() => setActiveTab('system')}
                    >
                        <Settings size={18} /> System Config
                    </button>
                </div>

                {/* Right Content Area */}
                <div className="set-content-area">
                    
                    {/* Administrator Profile */}
                    <div className="set-card">
                        <div className="set-card-header">
                            <div className="set-card-icon-bar"></div>
                            <h2>Administrator Profile</h2>
                        </div>
                        <div className="set-form-grid">
                            <div className="set-input-group">
                                <label>FULL NAME</label>
                                <input type="text" defaultValue="Dr. Alistair Vaughn" className="set-input" />
                            </div>
                            <div className="set-input-group">
                                <label>EMAIL ADDRESS</label>
                                <input type="text" defaultValue="a.vaughn@stag.io" className="set-input" />
                            </div>
                            <div className="set-input-group full-width">
                                <label>JOB TITLE</label>
                                <input type="text" defaultValue="Dean of Digital Innovation & System Architecture" className="set-input" />
                            </div>
                        </div>
                    </div>

                    {/* Security & Authentication */}
                    <div className="set-card">
                        <div className="set-card-header no-bar">
                            <h2>Security & Authentication</h2>
                        </div>
                        <div className="set-sec-list">
                            <div className="set-sec-item">
                                <div className="sec-item-left">
                                    <Fingerprint size={20} color="#c4b5fd" />
                                    <div>
                                        <h4>WebAuthn Biometric Access</h4>
                                        <p>Enable fingerprint or face recognition for admin login.</p>
                                    </div>
                                </div>
                                <div 
                                    className={`set-toggle ${biometricsEnabled ? 'on' : 'off'}`}
                                    onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                                >
                                    <div className="set-toggle-knob"></div>
                                </div>
                            </div>
                            
                            <div className="set-sec-divider"></div>
                            
                            <div className="set-sec-item">
                                <div className="sec-item-left">
                                    <History size={20} color="#9ca3af" />
                                    <div>
                                        <h4>Password Management</h4>
                                        <p>Last changed 42 days ago.</p>
                                    </div>
                                </div>
                                <button className="set-btn-dark">Change Password</button>
                            </div>
                        </div>
                    </div>

                    {/* Academic Hierarchy */}
                    <div className="set-card transparent-bg">
                        <div className="set-card-header flex-between mb-4">
                            <div>
                                <h2>Academic Hierarchy</h2>
                                <p className="set-subtitle">Define the structural mapping of knowledge domains.</p>
                            </div>
                            <div className="set-autosave-pill">
                                <div className="autosave-icon-circle"><CloudCog size={14} color="#ec4899"/></div>
                                <div>
                                    <strong>Autosave Active</strong>
                                    <span>Settings synchronized with main node.</span>
                                </div>
                            </div>
                        </div>

                        <div className="set-domain-block">
                            <div className="domain-header">
                                <div className="domain-title">
                                    <MonitorIcon size={18} color="#c4b5fd" /> 
                                    <h3>Computer Science & AI</h3>
                                </div>
                                <div className="domain-actions">
                                    <button className="icon-btn-small"><Edit2 size={14}/></button>
                                    <button className="set-pill-btn">+ SPECIALITY</button>
                                </div>
                            </div>
                            
                            <div className="set-spec-list">
                                <div className="set-spec-card">
                                    <div className="spec-header">
                                        <h4>Advanced Neural Networks</h4>
                                        <button className="set-text-btn">+ ADD SKILL</button>
                                    </div>
                                    <div className="spec-skills">
                                        <span className="set-skill-chip">TensorFlow Architecture</span>
                                        <span className="set-skill-chip">Transformer Models</span>
                                        <span className="set-skill-chip">Hyperparameter Tuning</span>
                                    </div>
                                </div>
                                
                                <div className="set-spec-card">
                                    <div className="spec-header">
                                        <h4>Full-Stack Cloud Systems</h4>
                                        <button className="set-text-btn">+ ADD SKILL</button>
                                    </div>
                                    <div className="spec-skills">
                                        <span className="set-skill-chip">Kubernetes Orchestration</span>
                                        <span className="set-skill-chip">Serverless Edge</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Validation Queue */}
                    <div className="set-card">
                        <div className="set-card-header flex-between mb-4">
                            <h2>Validation Queue</h2>
                            <span className="set-red-pill"><span className="dot"></span> 14 PENDING REVIEWS</span>
                        </div>
                        <div className="set-queue-table-wrapper">
                            <table className="set-queue-table">
                                <thead>
                                    <tr>
                                        <th>STUDENT NAME</th>
                                        <th>PROJECT PORTFOLIO</th>
                                        <th>SUBMISSION DATE</th>
                                        <th style={{textAlign: 'right'}}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="set-student-cell">
                                                <div className="stu-avatar">MS</div>
                                                <strong>Marcus Sterling</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <a href="#" className="set-link">view-portfolio-v3.2.pdf <ExternalLink size={12}/></a>
                                        </td>
                                        <td className="set-date-cell">Oct 24, 2024</td>
                                        <td className="set-actions-cell">
                                            <button className="set-icon-shield"><CheckSquare size={14}/></button>
                                            <button className="set-btn-approve">APPROVE</button>
                                            <button className="set-btn-reject">REJECT</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className="set-student-cell">
                                                <div className="stu-avatar pink">EL</div>
                                                <strong>Elena Lundgard</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <a href="#" className="set-link">ux-case-studies.webflow <ExternalLink size={12}/></a>
                                        </td>
                                        <td className="set-date-cell">Oct 23, 2024</td>
                                        <td className="set-actions-cell">
                                            <button className="set-icon-shield"><CheckSquare size={14}/></button>
                                            <button className="set-btn-approve">APPROVE</button>
                                            <button className="set-btn-reject">REJECT</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Split Row (Timeline + Branding) */}
                    <div className="set-split-row">
                        <div className="set-card">
                            <div className="set-card-header mb-4">
                                <h2>Academic Timeline</h2>
                            </div>
                            <div className="set-input-group mb-5">
                                <label>ACTIVE ACADEMIC YEAR</label>
                                <select className="set-select">
                                    <option>2025 / 2026</option>
                                    <option>2024 / 2025</option>
                                </select>
                            </div>
                            <div className="set-input-group">
                                <label>CURRENT SEMESTER</label>
                                <div className="set-flex-group">
                                    <button className="set-select-pill active">S1 (Autumn)</button>
                                    <button className="set-select-pill">S2 (Spring)</button>
                                </div>
                            </div>
                        </div>

                        <div className="set-card">
                            <div className="set-card-header mb-4">
                                <h2>University Branding</h2>
                            </div>
                            <div className="set-input-group mb-5">
                                <label>PRIMARY BRAND IDENTITY</label>
                                <div className="set-upload-row">
                                    <div className="set-logo-preview">
                                        <div className="inner-star"></div>
                                    </div>
                                    <div className="set-upload-info">
                                        <button className="set-btn-dark"><UploadCloud size={14}/> Upload New Logo</button>
                                        <span className="set-hint">Recommended: SVG or 512x512px PNG.</span>
                                    </div>
                                </div>
                            </div>
                            <div className="set-input-group">
                                <label>ACCENT LUMINARY COLOR</label>
                                <div className="set-color-picker">
                                    <button className="color-swatch purple active"></button>
                                    <button className="color-swatch pink"></button>
                                    <button className="color-swatch blue"></button>
                                    <button className="color-swatch green"></button>
                                    <button className="color-swatch-add"><Plus size={14}/></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="set-footer-actions">
                        <button className="set-btn-transparent">Discard Changes</button>
                        <button className="set-btn-primary">Save All Configurations</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
