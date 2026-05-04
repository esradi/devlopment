import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard, Briefcase, User, MessageSquare, Settings, Calendar,
    Folder, Search, MapPin, Globe, Users, Edit3, Camera, PlayCircle, Users2,
    CheckCircle2, PlusCircle, PenTool, CheckCircle, Search as SearchIcon, Bell, BadgeCheck, Activity, Info, Target, Menu, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyProfile.css';
import { companyService } from '../../services/api';
import '../company/CompanyDashboard.css';

const CompanyProfile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await companyService.getProfile();
                setProfile(data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogoClick = () => {
        fileInputRef.current.click();
    };
    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const res = await companyService.uploadLogo(formData);
            setProfile(prev => ({ ...prev, logo: res.logo_url }));
        } catch (err) {
            console.error("Failed to upload logo:", err);
        }
    };

    if (loading) {
        return <div className="loading-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0C10' }}><div className="custom-loader" /></div>;
    }

    if (!profile) return <div>Failed to load profile.</div>;

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
                <CompanySidebar activePath="profile" onClose={() => setSidebarOpen(false)} />
            </aside>


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
                            onClick={() => {
                                setSidebarOpen(false);
                                navigate('/dashboard/company/profile/edit');
                            }}
                        >
                            <Edit3 size={16} /> Edit Profile
                        </button>
                    </div>

                    <div className="profile-card company-hero-card">
                        <div className="company-logo-large">
                            {profile.logo ? (
                                <img src={profile.logo.startsWith('http') ? profile.logo : `http://localhost:8000${profile.logo}`} alt="Company Logo" style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
                            ) : (
                                <div className="logo-placeholder">
                                    {profile.company_name?.[0] || 'C'}
                                </div>
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
                            <h2>{profile.company_name || 'My Company'}</h2>
                            <div className="industry-label">
                                <CheckCircle2 size={14} /> {profile.industry?.toUpperCase() || 'GENERAL'}
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <MapPin className="info-icon" size={18} />
                                    <div className="info-text">
                                        <span>Location</span>
                                        <strong>{profile.location || 'Algeria'}</strong>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Globe className="info-icon" size={18} />
                                    <div className="info-text">
                                        <span>Website</span>
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="info-link">{profile.website || 'Add website'}</a>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <svg className="info-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    <div className="info-text">
                                        <span>Email</span>
                                        <strong>{profile.contact_email || 'Add contact email'}</strong>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Users className="info-icon" size={18} />
                                    <div className="info-text">
                                        <span>Company Size</span>
                                        <strong>{profile.size_range || 'N/A'}</strong>
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
                            {profile.description || "No description provided yet. Complete your profile to tell students about your company culture and missions."}
                        </p>

                        {profile.mission && (
                            <>
                                <div className="card-subtitle">Our Mission</div>
                                <p>{profile.mission}</p>
                            </>
                        )}

                        <div className="card-subtitle">What we offer interns</div>
                        <div className="tag-cloud">
                            {profile.values ? (
                                profile.values.split(',').filter(v => v.trim()).map((val, idx) => (
                                    <div key={idx} className="dark-tag"><PlayCircle size={14} /> {val.trim()}</div>
                                ))
                            ) : (
                                <div className="dark-tag"><PlayCircle size={14} /> Real-world projects</div>
                            )}
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
                                    {profile.preferred_domains && profile.preferred_domains.length > 0 ? (
                                        profile.preferred_domains.map((d, idx) => (
                                            <span key={idx} className="purple-outline-tag">{d.name}</span>
                                        ))
                                    ) : (
                                        <span className="purple-outline-tag">General</span>
                                    )}
                                </div>
                            </div>
                            <div className="pref-col">
                                <h4>Locations</h4>
                                <div className="tag-cloud">
                                    <span className="white-outline-tag">{profile.city || profile.country || 'Various'}</span>
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
                                    <span className="gauge-pct">{profile.strength || 0}%</span>
                                    <span className="gauge-label">{profile.strength >= 80 ? 'Excellent' : 'Good'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="checklist">
                            <div className="check-item">
                                <div className="check-left">
                                    <CheckCircle className={`check-icon ${profile.logo ? '' : 'pending'}`} size={16} />
                                    <span>Company Logo</span>
                                </div>
                            </div>
                            <div className="check-item">
                                <div className="check-left">
                                    <CheckCircle className={`check-icon ${profile.description ? '' : 'pending'}`} size={16} />
                                    <span>Detailed Description</span>
                                </div>
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
                                <p>{profile.is_verified ? 'Verified Company' : 'Pending Verification'}</p>
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
                                <div className="activity-right">{profile.stats?.offers_count || 0}</div>
                            </div>
                            <div className="activity-row">
                                <div className="activity-left">
                                    <Users className="a-icon pink" size={18} />
                                    <span>Applications</span>
                                </div>
                                <div className="activity-right">{profile.stats?.applications_count || 0}</div>
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