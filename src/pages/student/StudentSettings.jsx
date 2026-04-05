import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    X,
    Lock,
    Upload,
    Github,
    Linkedin,
    Plus,
    X as XIcon,
    AlertTriangle,
    Check
} from 'lucide-react';
import './StudentSettings.css';

const StudentSettings = ({ userData }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef(null);
    const [profilePic, setProfilePic] = useState(null);

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Form State
    const [formData, setFormData] = useState({
        firstName: userData?.first_name || 'Amine',
        lastName: userData?.last_name || 'Kheddar',
        email: userData?.email || 'amine.k@univ-alger.dz',
        phone: '+213 550 123 456',
        wilaya: '16 - Algiers',
        educationLevel: 'Master 2',
        specialization: userData?.profile?.speciality || 'Software Engineering'
    });

    // Toggles
    const [notifications, setNotifications] = useState({
        email: true,
        updates: true,
        matches: true,
        reminders: false
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Skills
    const [skills, setSkills] = useState(['React', 'Python', 'Figma']);
    const [skillInput, setSkillInput] = useState('');

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                triggerToast("File is too large (max 2MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
                triggerToast("Photo uploaded successfully");
            };
            reader.readAsDataURL(file);
        }
    };

    const scrollToSection = (id) => {
        setActiveTab(id);
        const element = document.getElementById(`settings-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="student-settings-page">

            {/* Success Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        className="settings-toast success"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="toast-content">
                            <CheckCircle2 size={18} color="#10b981" />
                            <span>{toastMessage}</span>
                        </div>
                        <button className="btn-close-toast" onClick={() => setShowToast(false)}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your account configurations and preferences.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="settings-tabs-nav">
                <button
                    className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => scrollToSection('profile')}
                >
                    Profile
                </button>
                <button
                    className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => scrollToSection('preferences')}
                >
                    Offer Preferences
                </button>
                <button
                    className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => scrollToSection('notifications')}
                >
                    Notifications
                </button>
                <button
                    className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => scrollToSection('security')}
                >
                    Security
                </button>
            </div>

            <div className="settings-content-layout">
                {/* Main Content Column */}
                <div className="settings-main-col">

                    {/* PROFILE SECTION */}
                    <div id="settings-profile" className="settings-section">
                        <div className="section-header">
                            <h2>Student Profile</h2>
                            <p>Manage your information visible to companies.</p>
                        </div>

                        <div className="settings-card form-grid">
                            <div className="form-group half">
                                <label>FIRST NAME</label>
                                <input name="firstName" value={formData.firstName} onChange={handleInputChange} />
                            </div>
                            <div className="form-group half">
                                <label>LAST NAME</label>
                                <input name="lastName" value={formData.lastName} onChange={handleInputChange} />
                            </div>
                            <div className="form-group full">
                                <label>EMAIL (READ ONLY)</label>
                                <div className="input-with-icon readonly">
                                    <input value={formData.email} readOnly disabled />
                                    <Lock size={16} className="icon-right" />
                                </div>
                            </div>
                            <div className="form-group half">
                                <label>PHONE</label>
                                <input name="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div className="form-group half">
                                <label>WILAYA</label>
                                <div className="select-wrapper">
                                    <select name="wilaya" value={formData.wilaya} onChange={handleInputChange}>
                                        <option value="16 - Algiers">16 - Algiers</option>
                                        <option value="31 - Oran">31 - Oran</option>
                                        <option value="19 - Setif">19 - Setif</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group half">
                                <label>EDUCATION LEVEL</label>
                                <div className="select-wrapper">
                                    <select name="educationLevel" value={formData.educationLevel} onChange={handleInputChange}>
                                        <option value="Master 2">Master 2</option>
                                        <option value="Master 1">Master 1</option>
                                        <option value="Licence 3">Licence 3</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group half">
                                <label>SPECIALIZATION</label>
                                <input name="specialization" value={formData.specialization} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="section-header mt-8">
                            <h2>Links & Portfolio</h2>
                            <p>Connect your professional profiles.</p>
                        </div>

                        <div className="portfolio-grid">
                            <div className="portfolio-card">
                                <div className="p-icon-circle doc"><FileTextIcon /></div>
                                <div className="p-info">
                                    <h4>Resume_Final_2024.pdf</h4>
                                    <span>Updated 2 days ago</span>
                                </div>
                                <button className="p-action"><Upload size={16} /></button>
                            </div>
                            <div className="portfolio-card">
                                <div className="p-icon-circle gh"><Github size={18} /></div>
                                <div className="p-info">
                                    <h4>GITHUB</h4>
                                    <a href="#" className="p-link">github.com/aminek</a>
                                </div>
                            </div>
                            <div className="portfolio-card">
                                <div className="p-icon-circle li"><Linkedin size={18} /></div>
                                <div className="p-info">
                                    <h4>LINKEDIN</h4>
                                    <a href="#" className="p-link">linkedin.com/in/aminek</a>
                                </div>
                            </div>
                            <div className="portfolio-card add-new dashed">
                                <div className="p-icon-circle add"><Plus size={18} /></div>
                                <div className="p-info">
                                    <h4>Add Portfolio</h4>
                                    <span>Personal website or Behance</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PREFERENCES SECTION */}
                    <div id="settings-preferences" className="settings-section">
                        <div className="section-header">
                            <h2>Offer Preferences</h2>
                            <p>Help us match you with the best opportunities across Algeria.</p>
                        </div>

                        <div className="settings-card">
                            <div className="pref-block">
                                <h3>Interest Domains</h3>
                                <div className="pills-wrapper">
                                    <span className="pill active-purple">Engineering</span>
                                    <span className="pill active-purple">Data Science</span>
                                    <span className="pill inactive">Marketing</span>
                                    <span className="pill active-purple">UI/UX Design</span>
                                    <span className="pill inactive">Finance</span>
                                    <span className="pill dashed">+ Add Domain</span>
                                </div>
                            </div>

                            <div className="pref-row-2">
                                <div className="pref-block">
                                    <h3>Offer Types</h3>
                                    <div className="pills-wrapper">
                                        <span className="pill active-outline">Stage</span>
                                        <span className="pill inactive">PFE</span>
                                        <span className="pill active-outline">Alternance</span>
                                    </div>
                                </div>
                                <div className="pref-block">
                                    <h3>Desired Duration</h3>
                                    <div className="pills-wrapper">
                                        <span className="pill inactive">3M</span>
                                        <span className="pill active-outline">6M</span>
                                        <span className="pill inactive">12M</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pref-block mt-6">
                                <h3>Core Skills</h3>
                                <div className="skills-input-wrapper">
                                    {skills.map(skill => (
                                        <div key={skill} className="skill-chip">
                                            {skill}
                                            <button onClick={() => removeSkill(skill)}><XIcon size={12} /></button>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Type a skill..."
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOTIFICATIONS SECTION */}
                    <div id="settings-notifications" className="settings-section">
                        <div className="section-header">
                            <h2>Notifications</h2>
                            <p>Decide what you want to be alerted about.</p>
                        </div>

                        <div className="settings-card no-pad">
                            <div className="toggle-row">
                                <div>
                                    <h4>Email Notifications</h4>
                                    <p>Receive weekly digests and direct alerts.</p>
                                </div>
                                <div
                                    className={`toggle-switch ${notifications.email ? 'on' : 'off'}`}
                                    onClick={() => handleToggle('email')}
                                >
                                    <div className="toggle-knob"></div>
                                </div>
                            </div>
                            <div className="toggle-row">
                                <div>
                                    <h4>Application Updates</h4>
                                    <p>Notify me when a company reviews my CV.</p>
                                </div>
                                <div
                                    className={`toggle-switch ${notifications.updates ? 'on' : 'off'}`}
                                    onClick={() => handleToggle('updates')}
                                >
                                    <div className="toggle-knob"></div>
                                </div>
                            </div>
                            <div className="toggle-row">
                                <div>
                                    <h4>New Matches</h4>
                                    <p>Alert me for offers matching my core skills.</p>
                                </div>
                                <div
                                    className={`toggle-switch ${notifications.matches ? 'on' : 'off'}`}
                                    onClick={() => handleToggle('matches')}
                                >
                                    <div className="toggle-knob"></div>
                                </div>
                            </div>
                            <div className="toggle-row">
                                <div>
                                    <h4>Important Reminders</h4>
                                    <p>Interview calls and pending tasks.</p>
                                </div>
                                <div
                                    className={`toggle-switch ${notifications.reminders ? 'on' : 'off'}`}
                                    onClick={() => handleToggle('reminders')}
                                >
                                    <div className="toggle-knob"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECURITY SECTION */}
                    <div id="settings-security" className="settings-section">
                        <div className="section-header">
                            <h2>Security</h2>
                            <p>Protect your account and personal data.</p>
                        </div>

                        <div className="security-cards-row">
                            <div className="settings-card flex-col">
                                <h3 className="card-inner-title">Change Password</h3>
                                <div className="form-group full mt-4">
                                    <label>CURRENT PASSWORD</label>
                                    <input type="password" />
                                </div>
                                <div className="form-group full">
                                    <label>NEW PASSWORD</label>
                                    <input type="password" />
                                    <div className="password-strength">
                                        <div className="strength-bars">
                                            <div className="s-bar active"></div>
                                            <div className="s-bar active"></div>
                                            <div className="s-bar active"></div>
                                            <div className="s-bar"></div>
                                        </div>
                                        <span className="s-text">Strong password</span>
                                    </div>
                                </div>
                                <button
                                    className="btn-secondary-dark mt-auto"
                                    onClick={() => {
                                        setIsUpdatingPwd(true);
                                        setTimeout(() => {
                                            setIsUpdatingPwd(false);
                                            triggerToast("Password updated successfully");
                                        }, 1000);
                                    }}
                                    disabled={isUpdatingPwd}
                                >
                                    {isUpdatingPwd ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>

                            <div className="settings-card danger-card flex-col">
                                <h3 className="card-inner-title danger">Delete Account</h3>
                                <p className="danger-text mt-4">Permanently remove your account and all your data. This action is irreversible and you will lose access to your application history.</p>
                                <button
                                    className="btn-danger-outline mt-auto"
                                    onClick={() => {
                                        setIsDeleting(true);
                                        setTimeout(() => {
                                            setIsDeleting(false);
                                            triggerToast("Account deletion requested");
                                        }, 1000);
                                    }}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Processing...' : 'Delete Account Permanently'}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar Column */}
                <aside className="settings-right-col">
                    <div className="sticky-sidebar">

                        <h2 className="sidebar-section-title">Avatar</h2>
                        <div className="settings-card text-center profile-avatar-card">
                            <div className="avatar-preview-wrap" onClick={handlePhotoClick} style={{ cursor: 'pointer' }}>
                                <img
                                    src={profilePic || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=0ea5e9&color=fff&size=120`}
                                    alt="Avatar"
                                    className="avatar-preview-img"
                                />
                                <div className="avatar-edit-overlay">
                                    <Upload size={24} />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <h3>{formData.firstName} {formData.lastName}</h3>
                            <p className="avatar-hint">JPG or PNG. Max size 2MB.</p>
                            <button
                                className="btn-secondary-dark full-width mt-4"
                                onClick={handlePhotoClick}
                            >
                                Update Photo
                            </button>
                        </div>

                        <div className="settings-card match-o-meter mt-6">
                            <div className="mom-header">
                                <h3>Match-O-Meter</h3>
                                <span>70%</span>
                            </div>
                            <div className="mom-bar-bg">
                                <div className="mom-bar-fill" style={{ width: '70%' }}></div>
                            </div>
                            <p className="mom-text">Your profile visibility is increased when you reach 90% completion. Add your project details to boost it!</p>
                        </div>

                    </div>
                </aside>
            </div>

            {/* Floating Action Bar */}
            <div className="settings-floating-actions">
                <button className="btn-text" onClick={() => triggerToast("Changes discarded")}>Discard Changes</button>
                <button
                    className="btn-save-changes"
                    onClick={() => {
                        setIsSaving(true);
                        setTimeout(() => {
                            setIsSaving(false);
                            triggerToast("Settings saved successfully");
                        }, 1000);
                    }}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

        </div>
    );
};

export default StudentSettings;

// Helper component for File Icon
const FileTextIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);
