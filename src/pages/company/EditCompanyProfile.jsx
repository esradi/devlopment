import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Camera, Globe, MapPin, Users, Mail,
    Shield, Save, Sparkles, Building, Target, Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services/api';
import './CompanyProfile.css';

const EditCompanyProfile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        industry: '',
        location: '',
        website: '',
        contact_email: '',
        size_range: '',
        description: '',
        mission: '',
        values: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await companyService.getProfile();
                setFormData({
                    company_name: data.company_name || '',
                    industry: data.industry || '',
                    location: data.location || '',
                    website: data.website || '',
                    contact_email: data.contact_email || '',
                    size_range: data.size_range || '',
                    description: data.description || '',
                    mission: data.mission || '',
                    values: data.values || ''
                });
                setLogoPreview(data.logo);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await companyService.updateProfile(formData);
            navigate('/dashboard/company/profile');
        } catch (err) {
            console.error("Failed to save profile:", err);
            alert("Error saving profile changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoClick = () => {
        fileInputRef.current.click();
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="company-profile-dashboard">
            <main className="profile-main-content full-scroll">
                <div className="edit-profile-container">
                    <header className="edit-header-modern">
                        <button className="back-btn-modern" onClick={() => navigate(-1)}>
                            <ChevronLeft size={16} /> Back to Profile
                        </button>
                        <div className="header-text-modern">
                            <h1>Edit Company Profile</h1>
                            <p>Update your public identity to attract the best talent.</p>
                        </div>
                    </header>

                    <form className="edit-form-modern" onSubmit={handleSave}>
                        <div className="edit-grid-modern">

                            {/* Left Column - Branding & Info */}
                            <div className="edit-col">
                                <section className="edit-section">
                                    <div className="section-label">
                                        <Building size={16} /> COMPANY IDENTITY
                                    </div>
                                    <div className="edit-avatar-upload">
                                        <div className="edit-logo-large">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo Preview" style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
                                            ) : (
                                                <span>{formData.company_name?.charAt(0) || 'C'}</span>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                            />
                                            <button type="button" className="upload-btn-floating" onClick={handleLogoClick}>
                                                <Camera size={14} />
                                            </button>
                                        </div>
                                        <div className="upload-text">
                                            <span>Upload Logo</span>
                                            <p>Recommended: 400x400 PNG or SVG</p>
                                        </div>
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Company Name</label>
                                        <input
                                            type="text"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Industry</label>
                                        <input
                                            type="text"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-row-modern">
                                        <div className="form-group-modern">
                                            <label><Globe size={12} /> Website</label>
                                            <input
                                                type="url"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group-modern">
                                            <label><Mail size={12} /> HR Email</label>
                                            <input
                                                type="email"
                                                value={formData.contact_email}
                                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="edit-section">
                                    <div className="section-label">
                                        <MapPin size={16} /> LOCATION & SIZE
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Headquarters</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Number of Employees</label>
                                        <select
                                            value={formData.size_range}
                                            onChange={(e) => setFormData({ ...formData, size_range: e.target.value })}
                                        >
                                            <option value="">Select size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="501-1000">501-1000 employees</option>
                                            <option value="1001-5000">1001-5000 employees</option>
                                            <option value="5000+">5000+ employees</option>
                                        </select>
                                    </div>
                                </section>
                            </div>

                            {/* Right Column - Culture & Preferences */}
                            <div className="edit-col">
                                <section className="edit-section">
                                    <div className="section-label">
                                        <Shield size={16} /> ABOUT & CULTURE
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Short Description</label>
                                        <textarea
                                            rows="4"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Our Mission</label>
                                        <textarea
                                            rows="3"
                                            value={formData.mission}
                                            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Company Values (comma separated)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. innovation, collaboration"
                                            value={formData.values}
                                            onChange={(e) => setFormData({ ...formData, values: e.target.value })}
                                        />
                                    </div>
                                </section>

                                <div className="edit-actions-modern">
                                    <button type="button" className="btn-cancel-modern" onClick={() => navigate(-1)}>Cancel</button>
                                    <button type="submit" className="btn-save-modern" disabled={saving}>
                                        <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditCompanyProfile;
