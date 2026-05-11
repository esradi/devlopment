import React, { useState, useRef, useEffect } from 'react';
import { studentService, authService } from '../../services/api';
// mediaUrl: build absolute URLs for /media paths returned by Django, without hardcoding localhost
import { mediaUrl } from '../../config';
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
    const [linkModal, setLinkModal] = useState({ show: false, type: '', label: '', value: '', icon: null });

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        wilaya: '',
        educationLevel: '',
        specialization: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [matchScore, setMatchScore] = useState(70);

    // Skills
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await authService.getMe();
                if (data) {
                    setFormData({
                        firstName: data.first_name || '',
                        lastName: data.last_name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        wilaya: data.profile?.wilaya || '',
                        educationLevel: data.profile?.academic_year || 'Master 2',
                        specialization: data.profile?.speciality || '',
                        githubUrl: data.profile?.github_url || '',
                        linkedinUrl: data.profile?.linkedin_url || '',
                        portfolioUrl: data.profile?.portfolio_url || '',
                        cv: data.profile?.cv || ''
                    });

                    // Load profile picture from backend
                    if (data.profile_picture) {
                        setProfilePic(mediaUrl(data.profile_picture));
                    }

                    // Handle complex skills objects from backend
                    const backendSkills = data.profile?.skills || [];
                    setSkills(backendSkills);

                    // Update match score if available
                    if (data.profile?.profile_completeness) {
                        setMatchScore(data.profile.profile_completeness);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                triggerToast("Failed to load profile data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

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

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            setSkills([...skills, { skill_name: skillInput.trim(), is_verified: false }]);
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => (s.skill_name || s) !== (skillToRemove.skill_name || skillToRemove)));
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                triggerToast("File is too large (max 2MB)");
                return;
            }
            // Preview local
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to backend
            try {
                const formData = new FormData();
                formData.append('profile_picture', file);
                const res = await studentService.uploadPicture(formData);
                
                // Update localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser && res.profile_picture) {
                    const userDataObj = JSON.parse(storedUser);
                    const newUserObj = {
                        ...userDataObj,
                        profile: {
                            ...userDataObj.profile,
                            profile_picture: res.profile_picture
                        }
                    };
                    localStorage.setItem('user', JSON.stringify(newUserObj));
                    window.dispatchEvent(new Event('profileUpdated'));
                }
                
                triggerToast("Photo uploaded successfully ✅");
            } catch (error) {
                triggerToast("Failed to upload photo ❌");
            }
        }
    };

    const handleOpenLinkModal = (type) => {
        const configs = {
            githubUrl: { label: 'GitHub Profile', value: formData.githubUrl, icon: <Github size={24} /> },
            linkedinUrl: { label: 'LinkedIn Profile', value: formData.linkedinUrl, icon: <Linkedin size={24} /> },
            portfolioUrl: { label: 'Portfolio Website', value: formData.portfolioUrl, icon: <Globe size={24} /> }
        };
        setLinkModal({ show: true, type, ...configs[type] });
    };

    const handleSaveLinkModal = () => {
        const { type, value } = linkModal;
        setFormData(prev => ({ ...prev, [type]: value }));
        setLinkModal({ ...linkModal, show: false });
    };

    const handleAddSocial = (type) => {
        handleOpenLinkModal(type);
    };

    const handleCVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('cv', file);

        try {
            setIsSaving(true);
            await studentService.uploadCV(uploadFormData);
            triggerToast("CV uploaded successfully! ✅");
            setFormData(prev => ({ ...prev, cv: 'connected' })); // Visual feedback
        } catch (error) {
            console.error("CV upload failed:", error);
            triggerToast("Failed to upload CV ❌");
        } finally {
            setIsSaving(false);
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
                                    <h4>{formData.cv ? 'Curriculum Vitae' : 'No CV Uploaded'}</h4>
                                    <span>{formData.cv ? 'CONNECTED' : 'Not added yet'}</span>
                                </div>
                                <button 
                                    className="p-action" 
                                    onClick={() => document.getElementById('settings-cv-upload').click()}
                                    title="Upload CV"
                                >
                                    <Upload size={16} />
                                </button>
                                <input 
                                    id="settings-cv-upload"
                                    type="file"
                                    style={{ display: 'none' }}
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleCVUpload}
                                />
                            </div>
                            <div className="portfolio-card" onClick={() => handleAddSocial('githubUrl')} style={{ cursor: 'pointer' }}>
                                <div className="p-icon-circle gh"><Github size={18} /></div>
                                <div className="p-info">
                                    <h4>GITHUB</h4>
                                    <span className="p-link">{formData.githubUrl || 'Not added yet'}</span>
                                </div>
                            </div>
                            <div className="portfolio-card" onClick={() => handleAddSocial('linkedinUrl')} style={{ cursor: 'pointer' }}>
                                <div className="p-icon-circle li"><Linkedin size={18} /></div>
                                <div className="p-info">
                                    <h4>LINKEDIN</h4>
                                    <span className="p-link">{formData.linkedinUrl || 'Not added yet'}</span>
                                </div>
                            </div>
                            <div className="portfolio-card add-new dashed" onClick={() => handleAddSocial('portfolioUrl')} style={{ cursor: 'pointer' }}>
                                <div className="p-icon-circle add"><Plus size={18} /></div>
                                <div className="p-info">
                                    <h4>{formData.portfolioUrl ? 'PORTFOLIO' : 'Add Portfolio'}</h4>
                                    <span className="p-link">{formData.portfolioUrl || 'Personal website or Behance'}</span>
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
                                    {skills.map((skill, idx) => {
                                        const name = typeof skill === 'string' ? skill : skill.skill_name;
                                        const isVerified = skill.is_verified;
                                        return (
                                            <div key={idx} className={`skill-chip ${isVerified ? 'verified-skill' : ''}`}>
                                                {isVerified && <Check size={12} className="verified-icon" />}
                                                {name}
                                                <button onClick={() => removeSkill(skill)}><XIcon size={12} /></button>
                                            </div>
                                        );
                                    })}
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
                                    src={profilePic || (userData?.profile?.profile_picture ? mediaUrl(userData.profile.profile_picture) : `https://ui-avatars.com/api/?name=${formData.firstName || userData?.first_name}+${formData.lastName || userData?.last_name}&background=0ea5e9&color=fff&size=120`)}
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
                                <span>{matchScore}%</span>
                            </div>
                            <div className="mom-bar-bg">
                                <div className="mom-bar-fill" style={{ width: `${matchScore}%` }}></div>
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
                    onClick={async () => {
                        setIsSaving(true);
                        try {
                            const payload = {
                                first_name: formData.firstName,
                                last_name: formData.lastName,
                                phone: formData.phone,
                                wilaya: formData.wilaya,
                                academic_year: formData.educationLevel,
                                speciality: formData.specialization,
                                github_url: formData.githubUrl,
                                portfolio_url: formData.portfolioUrl,
                                linkedin_url: formData.linkedinUrl,
                                skill_names: skills.map(s => s.skill_name || s)
                            };
                            const updatedProfile = await studentService.updateProfile(payload);
                            
                            // Update localStorage
                            const storedUser = localStorage.getItem('user');
                            if (storedUser) {
                                const userDataObj = JSON.parse(storedUser);
                                const newUserObj = {
                                    ...userDataObj,
                                    first_name: updatedProfile.first_name || formData.firstName,
                                    last_name: updatedProfile.last_name || formData.lastName,
                                    profile: updatedProfile.profile || userDataObj.profile
                                };
                                localStorage.setItem('user', JSON.stringify(newUserObj));
                                window.dispatchEvent(new Event('profileUpdated'));
                            }
                            
                            triggerToast("Settings saved successfully");
                        } catch (error) {
                            console.error("Save error:", error);
                            triggerToast("Failed to save changes");
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Custom Link Modal */}
            <AnimatePresence>
                {linkModal.show && (
                    <div className="custom-modal-overlay-wrapper">
                        <motion.div 
                            className="custom-modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLinkModal({ ...linkModal, show: false })}
                        />
                        <motion.div 
                            className="custom-modal-content glass"
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <div className="modal-icon-title">
                                    <div className="modal-icon-bg">{linkModal.icon}</div>
                                    <h3>Connect {linkModal.label}</h3>
                                </div>
                                <button className="modal-close" onClick={() => setLinkModal({ ...linkModal, show: false })}>
                                    <XIcon size={20} />
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                <p>Enter the URL for your {linkModal.label.toLowerCase()} below.</p>
                                <div className="modal-input-wrapper">
                                    <input 
                                        type="text" 
                                        placeholder={`https://${linkModal.type.replace('Url', '')}.com/yourname`}
                                        value={linkModal.value}
                                        onChange={(e) => setLinkModal({ ...linkModal, value: e.target.value })}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveLinkModal()}
                                    />
                                    <div className="input-glow"></div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={() => setLinkModal({ ...linkModal, show: false })}>
                                    Cancel
                                </button>
                                <button className="btn-save-modal" onClick={handleSaveLinkModal}>
                                    Save Connection
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
