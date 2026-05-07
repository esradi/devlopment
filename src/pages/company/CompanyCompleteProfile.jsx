import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Briefcase, User, MessageSquare, Settings, Calendar,
    Building2, Globe, Users, MapPin, Sparkles, CheckCircle2, Image as ImageIcon,
    Upload, Info, Eye, CheckCircle, ChevronRight, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services/api';
import './CompanyCompleteProfile.css';

const CompanyCompleteProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        company_name: '',
        industry: '',
        location: '',
        website: '',
        description: '',
        mission: '',
        values: ''
    });
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await companyService.getProfile();
                setProfile({
                    company_name: data.company_name || '',
                    industry: data.industry || '',
                    location: data.location || '',
                    website: data.website || '',
                    description: data.description || '',
                    mission: data.mission || '',
                    values: data.values || ''
                });

                // Simple strength calculation
                let count = 0;
                if (data.company_name) count += 15;
                if (data.industry) count += 15;
                if (data.location) count += 15;
                if (data.website) count += 15;
                if (data.description) count += 20;
                if (data.logo) count += 20;
                setStrength(count);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await companyService.updateProfile(profile);
            navigate('/dashboard/company/profile');
        } catch (err) {
            console.error("Failed to save profile:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0C10' }}><div className="custom-loader" /></div>;
    }

    return (
        <div className="company-complete-profile">
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
                                <input type="text" name="company_name" value={profile.company_name} onChange={handleChange} placeholder="e.g. Acme Corp" />
                            </div>
                            <div className="form-group">
                                <label>Industry</label>
                                <input type="text" name="industry" value={profile.industry} onChange={handleChange} placeholder="e.g. Software Development" />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" name="location" value={profile.location} onChange={handleChange} placeholder="e.g. Algiers, DZ" />
                            </div>
                            <div className="form-group full-width">
                                <label>Website URL</label>
                                <input type="text" name="website" value={profile.website} onChange={handleChange} placeholder="https://example.com" />
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
                            <textarea name="description" value={profile.description} onChange={handleChange} placeholder="Tell students about your company..."></textarea>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Mission</label>
                                <input type="text" name="mission" value={profile.mission} onChange={handleChange} placeholder="Our mission is..." />
                            </div>
                            <div className="form-group">
                                <label>Values</label>
                                <input type="text" name="values" value={profile.values} onChange={handleChange} placeholder="Separated by commas" />
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
                                <div className="preview-avatar">{profile.company_name ? profile.company_name[0] : 'C'}</div>
                            </div>
                            <div className="preview-body">
                                <div className="preview-name">{profile.company_name || 'Company Name'}</div>
                                <div className="preview-subtext">{profile.description?.substring(0, 50)}...</div>
                            </div>
                        </div>
                        <button className="btn-view-public">VIEW PUBLIC PROFILE</button>
                    </div>

                </div>

            </div>

            {/* 3. STICKY FOOTER */}
            <div className="cp-sticky-footer">
                <button className="btn-cancel" onClick={() => navigate('/dashboard/company/profile')}>Cancel</button>
                <button className="btn-save-changes" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save changes'}
                </button>
            </div>

        </div>
    );
};

export default CompanyCompleteProfile;
