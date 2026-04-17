import React, { useState } from 'react';
import { 
    LayoutDashboard, Briefcase, User, MessageSquare, Settings, Calendar,
    Building2, Globe, Users, MapPin, Sparkles, CheckCircle2, Image as ImageIcon,
    Upload, Info, Eye, CheckCircle, ChevronRight, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyCompleteProfile.css';

const CompanyCompleteProfile = () => {
    const navigate = useNavigate();
    const [strength, setStrength] = useState(75);

    return (
        <div className="company-complete-profile">
            {/* 1. SIDEBAR */}
            <CompanySidebar activePath="profile" />

            {/* 2. MAIN CONTAINER */}
            <div className="cp-main-container">
                
                {/* 2A. CONTENT COLUMN */}
                <div className="cp-content-column">
                    <header className="cp-header">
                        <h1>Complete your company profile</h1>
                        <p>Detailed profiles attract 3x more high-quality intern applications. Show them why Neon Tech is the place to be.</p>
                    </header>

                    {/* Profile Strength Bar */}
                    <div className="cp-strength-card">
                        <div className="strength-bar-wrapper">
                            <div className="strength-header">
                                <span>Profile Strength</span>
                                <strong>{strength}%</strong>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${strength}%` }}></div>
                            </div>
                        </div>
                        <button className="btn-complete-status">Complete Profile</button>
                    </div>

                    {/* Form: Company Details */}
                    <section className="cp-section">
                        <div className="section-title">
                            <Building2 size={24} />
                            <span>Company details</span>
                        </div>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Company Name</label>
                                <input type="text" defaultValue="Neon Tech Inc." placeholder="e.g. Acme Corp" />
                            </div>
                            <div className="form-group">
                                <label>Industry</label>
                                <select defaultValue="Artificial Intelligence">
                                    <option>Artificial Intelligence</option>
                                    <option>Software Development</option>
                                    <option>Energy & Petroleum</option>
                                    <option>Banking & Finance</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Size</label>
                                <select defaultValue="50 - 200 Employees">
                                    <option>1 - 10 Employees</option>
                                    <option>11 - 50 Employees</option>
                                    <option>50 - 200 Employees</option>
                                    <option>200 - 1000 Employees</option>
                                    <option>1000+ Employees</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" defaultValue="San Francisco, CA" placeholder="e.g. Algiers, DZ" />
                            </div>
                            <div className="form-group full-width">
                                <label>Website URL</label>
                                <input type="text" defaultValue="https://neontech.io" placeholder="https://example.com" />
                            </div>
                        </div>
                    </section>

                    {/* Form: About & Culture */}
                    <section className="cp-section">
                        <div className="section-title">
                            <Sparkles size={24} />
                            <span>About & culture</span>
                        </div>
                        
                        <div className="form-group full-width" style={{ marginBottom: '24px' }}>
                            <label>Description</label>
                            <textarea defaultValue="At Neon Tech, we are building the future of decentralized computing. Our team is a mix of visionaries, hackers, and builders dedicated to making the digital void accessible to everyone. We believe in rapid iteration, radical transparency, and the power of neon lights."></textarea>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Mission</label>
                                <input type="text" defaultValue="Empowering the decentralize" placeholder="Our mission is..." />
                            </div>
                            <div className="form-group">
                                <label>Values</label>
                                <input type="text" defaultValue="Speed, Integrity, Innovation" placeholder="Separated by commas" />
                            </div>
                        </div>

                        <div className="form-group full-width" style={{ marginTop: '24px' }}>
                            <label>Culture Highlights</label>
                            <input type="text" placeholder="Add highlights separated by commas (e.g., Friday socials, Remote-friendly)" />
                        </div>
                    </section>

                    {/* Form: Media & Branding */}
                    <section className="cp-section">
                        <div className="section-title">
                            <ImageIcon size={24} />
                            <span>Media & branding</span>
                        </div>

                        <div className="media-grid">
                            <div className="form-group">
                                <label>Company Logo</label>
                                <div className="upload-box">
                                    <Upload className="upload-icon" size={24} />
                                    <span>Upload SVG or PNG</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Cover Image</label>
                                <div className="upload-box">
                                    <ImageIcon className="upload-icon" size={24} />
                                    <span>Recommended 1920 x 480px</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 2B. SIDE PANEL */}
                <div className="cp-side-panel">
                    
                    <div className="side-card">
                        <h3>Profile Steps</h3>
                        <div className="steps-list">
                            <div className="step-item completed">
                                <CheckCircle2 className="step-check" size={18} />
                                <span>Company Info</span>
                            </div>
                            <div className="step-item completed">
                                <CheckCircle2 className="step-check" size={18} />
                                <span>About Overview</span>
                            </div>
                            <div className="step-item">
                                <CheckCircle className="step-check" size={18} />
                                <span>Company Logo</span>
                            </div>
                            <div className="step-item">
                                <CheckCircle className="step-check" size={18} />
                                <span>Global Locations</span>
                            </div>
                            <div className="step-item">
                                <CheckCircle className="step-check" size={18} />
                                <span>Social Channels</span>
                            </div>
                        </div>
                    </div>

                    <div className="side-card tips-card">
                        <div className="tips-header">
                            <Lightbulb size={20} />
                            <span>EXPERT TIPS</span>
                        </div>
                        <ul className="tips-list">
                            <li>Be specific about your tech stack; interns look for learning opportunities.</li>
                            <li>Use authentic office photos rather than generic stock images.</li>
                            <li>List at least 3 core values to help students understand your culture.</li>
                        </ul>
                    </div>

                    <div className="side-card">
                        <h3>Profile Preview</h3>
                        <div className="preview-box">
                            <div className="preview-banner">
                                <div className="preview-avatar">N</div>
                            </div>
                            <div className="preview-body">
                                <div className="preview-name">Neon Tech Inc.</div>
                                <div className="preview-subtext">Building the decentralized void...</div>
                            </div>
                        </div>
                        <button className="btn-view-public">VIEW PUBLIC PROFILE</button>
                    </div>

                </div>

            </div>

            {/* 3. STICKY FOOTER */}
            <div className="cp-sticky-footer">
                <button className="btn-cancel" onClick={() => navigate('/dashboard/company/profile')}>Cancel</button>
                <button className="btn-save-changes" onClick={() => navigate('/dashboard/company/profile')}>Save changes</button>
            </div>

        </div>
    );
};

export default CompanyCompleteProfile;
