import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Camera, Globe, MapPin, Users, Mail, 
    Shield, Save, Sparkles, Building, Target, Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyProfile.css';

const EditCompanyProfile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: 'Sonatrach',
        industry: 'Energy & Petroleum',
        location: 'Algiers, Algeria',
        website: 'https://sonatrach.com',
        email: 'hr@sonatrach.dz',
        size: '5000+ employees',
        description: 'Sonatrach is the national state-owned oil company of Algeria. It is the largest company in Africa and one of the largest gas and oil producers in the world.',
        culture: 'technical excellence, sustainability, and national commitment',
        mentorship: true,
        realWorldProjects: true,
        careerPath: true,
        certifiedTraining: true
    });

    const handleSave = (e) => {
        e.preventDefault();
        // Mock save logic
        setTimeout(() => {
            navigate('/dashboard/company/profile');
        }, 1500);
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
            <CompanySidebar activePath="profile" />

            <main className="profile-main-content">
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
                                                <span>{formData.name.charAt(0)}</span>
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
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Industry</label>
                                        <input 
                                            type="text" 
                                            value={formData.industry} 
                                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row-modern">
                                        <div className="form-group-modern">
                                            <label><Globe size={12} /> Website</label>
                                            <input 
                                                type="url" 
                                                value={formData.website} 
                                                onChange={(e) => setFormData({...formData, website: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group-modern">
                                            <label><Mail size={12} /> HR Email</label>
                                            <input 
                                                type="email" 
                                                value={formData.email} 
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Number of Employees</label>
                                        <select 
                                            value={formData.size} 
                                            onChange={(e) => setFormData({...formData, size: e.target.value})}
                                        >
                                            <option>1-10 employees</option>
                                            <option>11-50 employees</option>
                                            <option>51-200 employees</option>
                                            <option>201-500 employees</option>
                                            <option>501-1000 employees</option>
                                            <option>1001-5000 employees</option>
                                            <option>5000+ employees</option>
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
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        ></textarea>
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Culture Keywords</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. innovation, collaboration"
                                            value={formData.culture}
                                            onChange={(e) => setFormData({...formData, culture: e.target.value})}
                                        />
                                    </div>
                                </section>

                                <section className="edit-section">
                                    <div className="section-label">
                                        <Heart size={16} /> BENEFITS & INTERNSHIPS
                                    </div>
                                    <div className="checkbox-grid-modern">
                                        <label className="checkbox-item-modern">
                                            <input type="checkbox" checked={formData.mentorship} onChange={() => setFormData({...formData, mentorship: !formData.mentorship})} />
                                            <span>Mentorship Program</span>
                                        </label>
                                        <label className="checkbox-item-modern">
                                            <input type="checkbox" checked={formData.realWorldProjects} onChange={() => setFormData({...formData, realWorldProjects: !formData.realWorldProjects})} />
                                            <span>Real-world Projects</span>
                                        </label>
                                        <label className="checkbox-item-modern">
                                            <input type="checkbox" checked={formData.careerPath} onChange={() => setFormData({...formData, careerPath: !formData.careerPath})} />
                                            <span>Career Path</span>
                                        </label>
                                        <label className="checkbox-item-modern">
                                            <input type="checkbox" checked={formData.certifiedTraining} onChange={() => setFormData({...formData, certifiedTraining: !formData.certifiedTraining})} />
                                            <span>Certified Training</span>
                                        </label>
                                    </div>
                                </section>

                                <div className="edit-actions-modern">
                                    <button type="button" className="btn-cancel-modern" onClick={() => navigate(-1)}>Cancel</button>
                                    <button type="submit" className="btn-save-modern">
                                        <Save size={18} /> Save Changes
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
