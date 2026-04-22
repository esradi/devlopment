import React, { useState, useRef } from 'react';
import { 
    LayoutDashboard, Briefcase, User, MessageSquare, Settings, Calendar,
    Folder, Search, MapPin, Globe, Users, Edit3, Camera, PlayCircle, Users2,
    CheckCircle2, PlusCircle, PenTool, CheckCircle, Search as SearchIcon, Bell, BadgeCheck, Activity, Info, Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyProfile.css';

const CompanyProfile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [companyLogo, setCompanyLogo] = useState(null);

    const handleLogoClick = () => {
        fileInputRef.current.click();
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompanyLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="company-profile-dashboard">
            {/* 1. SIDEBAR */}
            <CompanySidebar activePath="profile" />

            {/* 2. MAIN CONTAINER */}
            <main className="profile-main-content">
                
                {/* 2A. LEFT COLUMN (Content) */}
                <div className="profile-content-col">
                    <div className="profile-header">
                        <div>
                            <h1>Company Profile</h1>
                            <p>Manage how students see your company on Stag.io.</p>
                        </div>
                        <button 
                            className="btn-edit-profile"
                            onClick={() => navigate('/dashboard/company/profile/edit')}
                        >
                            <Edit3 size={16} /> Edit Profile
                        </button>
                    </div>

                    <div className="profile-card company-hero-card">
                        <div className="company-logo-large">
                            {companyLogo ? (
                                <img src={companyLogo} alt="Company Logo" style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
                            ) : (
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                accept="image/*"
                                onChange={handleLogoChange}
                            />
                            <button className="company-logo-upload-btn" onClick={handleLogoClick}>
                                <Camera size={16} />
                            </button>
                        </div>
                        <div className="company-basic-info">
                            <h2>Sonatrach</h2>
                            <div className="industry-label">
                                <CheckCircle2 size={14} /> ENERGY & PETROLEUM
                            </div>
                            
                            <div className="info-grid">
                                <div className="info-item">
                                    <MapPin className="info-icon" size={18} />
                                    <div className="info-text">
                                        <span>Location</span>
                                        <strong>Algiers, Algeria</strong>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Globe className="info-icon" size={18} />
                                    <div className="info-text">
                                        <span>Website</span>
                                        <a href="#" className="info-link">sonatrach.com</a>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <svg className="info-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    <div className="info-text">
                                        <span>Email</span>
                                        <strong>hr@sonatrach.dz</strong>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Users className="info-icon" size={18} />
                                    <div className="info-text">
                                        <span>Company Size</span>
                                        <strong>5000+ employees</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card">
                        <div className="section-header-card">
                            <div className="section-icon">
                                <Users2 size={18} />
                            </div>
                            <h3>About & Culture</h3>
                        </div>
                        <p>
                            Sonatrach is the national state-owned oil company of Algeria. It is the largest company in Africa and one of the largest gas and oil producers in the world. Our mission is to explore, produce, transport, refine, and market hydrocarbons while fostering the next generation of Algerian engineers and leaders. We pride ourselves on a culture of technical excellence, sustainability, and national commitment.
                        </p>
                        
                        <div className="card-subtitle">What we offer interns</div>
                        <div className="tag-cloud">
                            <div className="dark-tag"><PlayCircle size={14} /> Mentorship</div>
                            <div className="dark-tag"><PlayCircle size={14} /> Real-world projects</div>
                            <div className="dark-tag"><PlayCircle size={14} /> Career path</div>
                            <div className="dark-tag"><PlayCircle size={14} /> Certified Training</div>
                        </div>
                    </div>

                    <div className="profile-card">
                        <div className="section-header-card">
                            <div className="section-icon preferred">
                                <Target size={18} />
                            </div>
                            <h3>Preferred Intern Profiles</h3>
                        </div>

                        <div className="pref-grid">
                            <div className="pref-col">
                                <h4>Domains</h4>
                                <div className="tag-cloud">
                                    <span className="purple-outline-tag">Data Science</span>
                                    <span className="purple-outline-tag">Backend</span>
                                    <span className="purple-outline-tag">Engineering</span>
                                </div>
                            </div>
                            <div className="pref-col">
                                <h4>Locations</h4>
                                <div className="tag-cloud">
                                    <span className="white-outline-tag">Algiers</span>
                                    <span className="white-outline-tag">Remote</span>
                                </div>
                            </div>
                            <div className="pref-col">
                                <h4>Type</h4>
                                <div className="tag-cloud">
                                    <span className="pink-outline-tag">PFE</span>
                                    <span className="pink-outline-tag">Summer Internship</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2B. RIGHT COLUMN (Sidebar metrics) */}
                <div className="profile-right-col">
                    
                    <div className="side-card">
                        <h3>Profile Strength</h3>
                        <div className="strength-gauge-wrap">
                            <div className="gauge-circle">
                                <div className="gauge-content">
                                    <span className="gauge-pct">90%</span>
                                    <span className="gauge-label">Excellent</span>
                                </div>
                            </div>
                        </div>

                        <div className="checklist">
                            <div className="check-item">
                                <div className="check-left">
                                    <CheckCircle className="check-icon" size={16} />
                                    <span>Company Logo</span>
                                </div>
                            </div>
                            <div className="check-item">
                                <div className="check-left">
                                    <CheckCircle className="check-icon" size={16} />
                                    <span>Detailed Description</span>
                                </div>
                            </div>
                            <div className="check-item">
                                <div className="check-left">
                                    <CheckCircle className="check-icon" size={16} />
                                    <span>Website Link</span>
                                </div>
                            </div>
                            <div className="check-item">
                                <div className="check-left">
                                <CheckCircle className="check-icon pending" size={16} />
                                <span style={{ color: '#565d6d' }}>Active Offer</span>
                            </div>
                            <a href="#">Add Now</a>
                        </div>
                    </div>
                    <button 
                        className="btn-view-analytics" 
                        style={{ width: '100%', marginTop: '20px' }}
                        onClick={() => navigate('/dashboard/company/complete-profile')}
                    >
                        Complete Profile
                    </button>
                </div>

                    <div className="side-card verification-badge">
                        <div className="verif-left">
                            <div className="verif-icon">
                                <BadgeCheck size={20} />
                            </div>
                            <div className="verif-text">
                                <h4>Verification Status</h4>
                                <p>Verified Company</p>
                            </div>
                        </div>
                        <Info className="info-circle-icon" size={18} />
                    </div>

                    <div className="side-card">
                        <h3>Activity Summary</h3>
                        <div className="activity-summary-list">
                            <div className="activity-row">
                                <div className="activity-left">
                                    <Activity className="a-icon purple" size={18} />
                                    <span>Offers posted</span>
                                </div>
                                <div className="activity-right">12</div>
                            </div>
                            <div className="activity-row">
                                <div className="activity-left">
                                    <Users className="a-icon pink" size={18} />
                                    <span>Applications</span>
                                </div>
                                <div className="activity-right">428</div>
                            </div>
                            <div className="activity-row">
                                <div className="activity-left">
                                    <User className="a-icon green" size={18} />
                                    <span>Interns hired</span>
                                </div>
                                <div className="activity-right">24</div>
                            </div>
                        </div>
                        <button 
                            className="btn-view-analytics"
                            onClick={() => navigate('/dashboard/company/analytics')}
                        >
                            View Detailed Analytics
                        </button>
                    </div>

                </div>

            </main>
        </div>
    );
};

export default CompanyProfile;
