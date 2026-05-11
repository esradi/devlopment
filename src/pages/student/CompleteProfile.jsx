import React, { useState, useRef, useEffect } from 'react';
import { dashboardService, studentService } from '../../services/api';
// Centralised media-URL helper — strips the localhost hardcoding so this
// component works against any backend host (local, Railway, etc.).
import { mediaUrl } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Briefcase,
    Plus,
    X,
    Github,
    Linkedin,
    Globe,
    FileText,
    CheckCircle2,
    Camera,
    RefreshCw,
    Eye,
    ChevronDown,
    Award,
    Download,
    Share2,
    Star
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import './CompleteProfile.css';

const ALL_WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
    "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
    "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam",
    "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

const ALL_DOMAINS = [
    "Engineering", "UI/UX Design", "Backend Dev", "Frontend Dev", "Mobile Dev",
    "Cloud Computing", "AI/ML", "SecOps", "Data Science", "Marketing", "Finance",
    "Human Resources", "Product Management", "Quality Assurance", "Game Dev"
];

const CompleteProfile = ({ userData, onSave }) => {
    const [skills, setSkills] = useState([]);
    const [locations, setLocations] = useState([]);
    const [domains, setDomains] = useState([]);
    const [offerType, setOfferType] = useState('Stage');
    const [duration, setDuration] = useState('6M');
    const [isSaving, setIsSaving] = useState(false);
    const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
    const [showDomainDropdown, setShowDomainDropdown] = useState(false);
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [speciality, setSpeciality] = useState('');
    const [academicYear, setAcademicYear] = useState('Master 2 / Engineering');
    const [university, setUniversity] = useState('');
    const contentRef = useRef(null);
    const [linkModal, setLinkModal] = useState({ show: false, type: '', label: '', value: '', icon: null });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await studentService.getProfile();
                if (data) {
                    setLocations(data.wilaya ? [data.wilaya] : ['Algiers']);
                    const backendSkills = data.skills || [];
                    if (backendSkills.length > 0) {
                        setSkills(backendSkills.map(s => ({
                            name: s.skill?.name || s.name || 'Skill',
                            level: s.is_verified ? 'Expert' : 'Intermediate'
                        })));
                    } else {
                        setSkills([
                            { name: 'REACT.JS', level: 'Expert' },
                            { name: 'NODE.JS', level: 'Intermediate' },
                            { name: 'FIGMA', level: 'Advanced' },
                            { name: 'PYTHON', level: 'Beginner' }
                        ]);
                    }
                    setDomains(data.domain ? [data.domain] : ['Engineering', 'UI/UX Design', 'Backend Dev']);
                    if (data.profile_picture) {
                        setProfileImage(mediaUrl(data.profile_picture));
                    }
                    setGithubProfile({ added: !!data.github_url, url: data.github_url || '' });
                    setLinkedinProfile({ added: !!data.linkedin_url, url: data.linkedin_url || '' });
                    setPortfolio({ added: !!data.portfolio_url, url: data.portfolio_url || '' });
                    
                    // Initialize personal info
                    setFirstName(data.first_name || userData?.first_name || '');
                    setLastName(data.last_name || userData?.last_name || '');
                    setPhone(data.phone || userData?.phone || '');
                    setSpeciality(data.speciality || userData?.profile?.speciality || '');
                    setAcademicYear(data.academic_year || userData?.profile?.academic_year || 'Master 2 / Engineering');
                    setUniversity(data.university || userData?.profile?.university || '');
                } else {
                    // Fallback to userData if no profile data
                    setFirstName(userData?.first_name || '');
                    setLastName(userData?.last_name || '');
                    setPhone(userData?.phone || '');
                    setSpeciality(userData?.profile?.speciality || '');
                    setAcademicYear(userData?.profile?.academic_year || 'Master 2 / Engineering');
                    setUniversity(userData?.profile?.university || '');
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
                setSkills([{ name: 'REACT.JS', level: 'Expert' }, { name: 'NODE.JS', level: 'Intermediate' }]);
                setLocations(['Algiers']);
                setDomains(['Engineering', 'UI/UX Design', 'Backend Dev']);
                
                // Fallback to userData on error
                setFirstName(userData?.first_name || '');
                setLastName(userData?.last_name || '');
                setPhone(userData?.phone || '');
                setSpeciality(userData?.profile?.speciality || '');
                setAcademicYear(userData?.profile?.academic_year || 'Master 2 / Engineering');
                setUniversity(userData?.profile?.university || '');
            }
        };
        loadProfile();
    }, []);

    const handleShareProfile = () => {
        navigator.clipboard.writeText('https://stage.io/p/amine-benali-1234');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleExportCV = () => {
        const element = contentRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `CV-${userData?.first_name || 'Amine'}-${userData?.last_name || 'Benali'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0d0d12' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    // Interactive Demo States
    const [githubProfile, setGithubProfile] = useState({ added: !!userData?.profile?.github_url, url: userData?.profile?.github_url || '' });
    const [linkedinProfile, setLinkedinProfile] = useState({ added: !!userData?.profile?.linkedin_url, url: userData?.profile?.linkedin_url || '' });
    const [portfolio, setPortfolio] = useState({ added: !!userData?.profile?.portfolio_url, url: userData?.profile?.portfolio_url || '' });

    const handleAddDomain = (domain) => {
        if (!domains.includes(domain)) {
            setDomains([...domains, domain]);
        }
        setShowDomainDropdown(false);
    };

    const handleAddWilaya = (wilaya) => {
        if (!locations.includes(wilaya)) {
            setLocations([...locations, wilaya]);
        }
        setShowWilayaDropdown(false);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Preview local
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Upload to backend immediately
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
            } catch (error) {
                console.error("Failed to upload profile picture:", error);
            }
        }
    };

    const handleOpenLinkModal = (type) => {
        const configs = {
            github: { label: 'GitHub Profile', value: githubProfile.url, icon: <Github size={24} /> },
            linkedin: { label: 'LinkedIn Profile', value: linkedinProfile.url, icon: <Linkedin size={24} /> },
            portfolio: { label: 'Portfolio Website', value: portfolio.url, icon: <Globe size={24} /> }
        };
        setLinkModal({ show: true, type, ...configs[type] });
    };

    const handleSaveLinkModal = () => {
        const { type, value } = linkModal;
        if (type === 'github') setGithubProfile({ added: !!value, url: value });
        if (type === 'linkedin') setLinkedinProfile({ added: !!value, url: value });
        if (type === 'portfolio') setPortfolio({ added: !!value, url: value });
        setLinkModal({ ...linkModal, show: false });
    };

    const handleCVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('cv', file);

        try {
            setIsSaving(true);
            await studentService.uploadCV(formData);
            // Show a custom toast/notification instead of alert if possible, but keep it simple for now
            alert("CV uploaded successfully!");
        } catch (error) {
            console.error("CV upload failed:", error);
            alert("Failed to upload CV. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddGithub = () => handleOpenLinkModal('github');
    const handleAddLinkedin = () => handleOpenLinkModal('linkedin');
    const handleAddPortfolio = () => handleOpenLinkModal('portfolio');

    const interactiveVariants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.25 }
        },
        tap: {
            scale: 1.08,
            transition: { duration: 0.1 }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            className="complete-profile-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="page-header">
                <div className="header-text">
                    <h1>Complete your profile</h1>
                    <p>Boost your match score and get better offers.</p>
                </div>
                <div className="strength-display">
                    <div className="progress-ring-container">
                        <svg width="100" height="100">
                            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="44" fill="none" stroke="url(#profile-gradient)" strokeWidth="8"
                                strokeDasharray="276.46" strokeDashoffset={276.46 * (1 - 0.85)}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="profile-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#9e59ff" />
                                    <stop offset="100%" stopColor="#ff1b90" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="strength-value">
                            <span className="number">85%</span>
                            <span className="label">STRENGTH</span>
                        </div>
                    </div>
                </div>

                <div className="printable-actions page-header-actions no-print">
                    <button className="action-btn share-btn" onClick={handleShareProfile}>
                        {isCopied ? <CheckCircle2 size={18} /> : <Share2 size={18} />}
                        {isCopied ? 'Link Copied!' : 'Share Portfolio'}
                    </button>
                    <button className="action-btn export-btn" onClick={handleExportCV}>
                        <Download size={18} /> Export CV
                    </button>
                </div>
            </header>

            <div className="content-grid" ref={contentRef}>
                <div className="main-sections">
                    {/* Personal Information */}
                    <section className="profile-section card">
                        <div className="section-title">
                            <User size={20} className="icon-purple" />
                            <h2>Personal Information</h2>
                        </div>
                        <div className="personal-info-grid">
                            <div className="avatar-side">
                                <div className="avatar-edit-container">
                                    <img
                                        src={profileImage || (userData?.profile?.profile_picture ? mediaUrl(userData.profile.profile_picture) : `https://ui-avatars.com/api/?name=${userData?.first_name}+${userData?.last_name}&background=9e59ff&color=fff`)}
                                        alt="Profile"
                                        className="large-avatar"
                                    />
                                    <button className="edit-badge" onClick={() => fileInputRef.current?.click()}>
                                        <Camera size={14} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div className="form-fields">
                                <div className="field-row">
                                    <div className="field-group">
                                        <label>FIRST NAME</label>
                                        <input 
                                            type="text" 
                                            value={firstName} 
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label>LAST NAME</label>
                                        <input 
                                            type="text" 
                                            value={lastName} 
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>
                                <div className="field-row">
                                    <div className="field-group">
                                        <label>EMAIL (READ-ONLY)</label>
                                        <div className="input-with-icon readonly">
                                            <Mail size={14} />
                                            <input type="text" value={userData?.email || "amine.benali@esi.dz"} readOnly />
                                        </div>
                                    </div>
                                    <div className="field-group">
                                        <label>PHONE</label>
                                        <div className="input-with-icon">
                                            <Phone size={14} />
                                            <input 
                                                type="text" 
                                                value={phone} 
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+213 5XX XX XX XX"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="field-row">
                                    <div className="field-group">
                                        <label>CITY + WILAYA</label>
                                        <div className="select-input">
                                            <select>
                                                <option>Algiers (16)</option>
                                                <option>Oran (31)</option>
                                                <option>Setif (19)</option>
                                            </select>
                                            <ChevronDown size={16} className="chevron" />
                                        </div>
                                    </div>
                                    <div className="field-group">
                                        <label>EDUCATION LEVEL</label>
                                        <div className="select-input">
                                            <select 
                                                value={academicYear}
                                                onChange={(e) => setAcademicYear(e.target.value)}
                                            >
                                                <option value="Master 2 / Engineering">Master 2 / Engineering</option>
                                                <option value="Master 1">Master 1</option>
                                                <option value="Licence 3">Licence 3</option>
                                                <option value="Licence 2">Licence 2</option>
                                            </select>
                                            <ChevronDown size={16} className="chevron" />
                                        </div>
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>SPECIALIZATION</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Computer Science" 
                                        value={speciality} 
                                        onChange={(e) => setSpeciality(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Offer Preferences */}
                    <section className="profile-section card">
                        <div className="section-title">
                            <Briefcase size={20} className="icon-purple" />
                            <h2>Offer Preferences</h2>
                        </div>

                        <div className="pref-group" style={{ position: 'relative' }}>
                            <label>INTEREST DOMAINS</label>
                            <div className="tags-container">
                                {domains.map(d => (
                                    <span key={d} className="tag-pill active" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {d} <X size={12} onClick={() => setDomains(domains.filter(dom => dom !== d))} style={{ cursor: 'pointer' }} />
                                    </span>
                                ))}
                                <motion.span
                                    className="tag-pill add interactive"
                                    whileHover="hover"
                                    whileTap="tap"
                                    variants={interactiveVariants}
                                    onClick={() => setShowDomainDropdown(!showDomainDropdown)}
                                >
                                    <motion.span
                                        style={{ display: 'inline-block', marginRight: '4px' }}
                                        variants={{ hover: { rotate: 90 } }}
                                    >+</motion.span> Add
                                </motion.span>
                            </div>

                            {/* Domain Dropdown */}
                            <AnimatePresence>
                                {showDomainDropdown && (
                                    <motion.div
                                        className="custom-dropdown-menu"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <div className="custom-dropdown-content">
                                            {ALL_DOMAINS.filter(d => !domains.includes(d)).map((domain, idx) => (
                                                <div
                                                    key={idx}
                                                    className="custom-dropdown-item"
                                                    onClick={() => handleAddDomain(domain)}
                                                >
                                                    {domain}
                                                </div>
                                            ))}
                                            {ALL_DOMAINS.filter(d => !domains.includes(d)).length === 0 && (
                                                <div className="custom-dropdown-item empty">All domains selected</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="pref-row">
                            <div className="pref-group half">
                                <label>OFFER TYPES</label>
                                <div className="button-group">
                                    <button className={offerType === 'Stage' ? 'active' : ''} onClick={() => setOfferType('Stage')}>Stage</button>
                                    <button className={offerType === 'PFE' ? 'active' : ''} onClick={() => setOfferType('PFE')}>PFE</button>
                                </div>
                            </div>
                            <div className="pref-group half">
                                <label>DESIRED DURATION</label>
                                <div className="button-group">
                                    <button className={duration === '3M' ? 'active' : ''} onClick={() => setDuration('3M')}>3M</button>
                                    <button className={duration === '6M' ? 'active' : ''} onClick={() => setDuration('6M')}>6M</button>
                                    <button className={duration === '12M' ? 'active' : ''} onClick={() => setDuration('12M')}>12M</button>
                                </div>
                            </div>
                        </div>

                        <div className="pref-group" style={{ position: 'relative' }}>
                            <label>PREFERRED LOCATIONS</label>
                            <div className="tags-container">
                                {locations.map(l => (
                                    <span key={l} className="tag-chip">
                                        {l} <X size={12} onClick={() => setLocations(locations.filter(loc => loc !== l))} style={{ cursor: 'pointer' }} />
                                    </span>
                                ))}
                                <motion.span
                                    className="tag-chip add-dashed interactive"
                                    whileHover="hover"
                                    whileTap="tap"
                                    variants={interactiveVariants}
                                    onClick={() => setShowWilayaDropdown(!showWilayaDropdown)}
                                >
                                    <motion.span
                                        style={{ display: 'inline-block', marginRight: '4px' }}
                                        variants={{ hover: { rotate: 90 } }}
                                    >+</motion.span> Add Wilaya
                                </motion.span>
                            </div>

                            {/* Wilaya Dropdown */}
                            <AnimatePresence>
                                {showWilayaDropdown && (
                                    <motion.div
                                        className="custom-dropdown-menu"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <div className="custom-dropdown-content">
                                            {ALL_WILAYAS.filter(w => !locations.includes(w)).map((wilaya, idx) => (
                                                <div
                                                    key={idx}
                                                    className="custom-dropdown-item"
                                                    onClick={() => handleAddWilaya(wilaya)}
                                                >
                                                    {wilaya}
                                                </div>
                                            ))}
                                            {ALL_WILAYAS.filter(w => !locations.includes(w)).length === 0 && (
                                                <div className="custom-dropdown-item empty">All wilayas selected</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="pref-group">
                            <label>CORE SKILLS & PROFICIENCY</label>
                            <div className="tags-container">
                                {skills.map((s, idx) => (
                                    <div key={idx} className={`skill-pill ${s.level.toLowerCase()}`}>
                                        <span className="skill-name">{s.name}</span>
                                        <div className="spacer"></div>
                                        <span className="skill-level">{s.level}</span>
                                        <div className="skill-stars">
                                            {s.level === 'Beginner' && <><Star size={10} fill="currentColor" /><Star size={10} opacity={0.3} /><Star size={10} opacity={0.3} /></>}
                                            {s.level === 'Intermediate' && <><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} opacity={0.3} /></>}
                                            {s.level === 'Advanced' && <><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /></>}
                                            {s.level === 'Expert' && <><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" color="#fbbf24" /></>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar */}
                <aside className="sidebar-sections no-print">
                    {/* Links & Portfolio */}
                    <div className="profile-section card">
                        <div className="section-title">
                            <Globe size={20} className="icon-purple" />
                            <h2>Links & Portfolio</h2>
                        </div>
                        <div className="links-list">
                            <div className="link-item">
                                <div className="link-icon cv"><FileText size={18} /></div>
                                <div className="link-text">
                                    <h4>Curriculum Vitae</h4>
                                    <span className={`status ${userData?.profile?.cv ? 'connected' : 'empty'}`}>
                                        {userData?.profile?.cv ? 'CONNECTED' : 'NOT ADDED YET'}
                                    </span>
                                </div>
                                <button 
                                    className="link-action" 
                                    onClick={() => document.getElementById('cv-file-input').click()}
                                    title="Upload CV"
                                >
                                    <RefreshCw size={14} />
                                </button>
                                <input 
                                    id="cv-file-input"
                                    type="file"
                                    style={{ display: 'none' }}
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleCVUpload}
                                />
                            </div>
                            <motion.div
                                className={`link-item interactive`}
                                whileHover="hover"
                                whileTap="tap"
                                variants={interactiveVariants}
                                onClick={handleAddGithub}
                            >
                                <div className="link-icon github"><Github size={18} /></div>
                                <div className="link-text">
                                    <h4>GitHub Profile</h4>
                                    <span className={`status ${githubProfile.added ? 'connected' : 'empty'}`}>
                                        {githubProfile.added ? githubProfile.url : 'NOT ADDED YET'}
                                    </span>
                                </div>
                                <button className={`link-action ${githubProfile.added ? '' : 'add'}`}>
                                    {githubProfile.added ? <Eye size={14} /> : <Plus size={14} />}
                                </button>
                            </motion.div>
                            <motion.div
                                className={`link-item interactive`}
                                whileHover="hover"
                                whileTap="tap"
                                variants={interactiveVariants}
                                onClick={handleAddLinkedin}
                            >
                                <div className="link-icon linkedin"><Linkedin size={18} /></div>
                                <div className="link-text">
                                    <h4>LinkedIn</h4>
                                    <span className={`status ${linkedinProfile.added ? 'connected' : 'empty'}`}>
                                        {linkedinProfile.added ? linkedinProfile.url : 'NOT ADDED YET'}
                                    </span>
                                </div>
                                <button className={`link-action ${linkedinProfile.added ? '' : 'add'}`}>
                                    {linkedinProfile.added ? <Eye size={14} /> : <Plus size={14} />}
                                </button>
                            </motion.div>
                            <motion.div
                                className={`link-item interactive`}
                                whileHover="hover"
                                whileTap="tap"
                                variants={interactiveVariants}
                                onClick={handleAddPortfolio}
                            >
                                <div className="link-icon portfolio"><Globe size={18} /></div>
                                <div className="link-text">
                                    <h4>Portfolio Website</h4>
                                    <span className={`status ${portfolio.added ? 'connected' : 'empty'}`}>
                                        {portfolio.added ? portfolio.url : 'NOT ADDED YET'}
                                    </span>
                                </div>
                                <button className={`link-action ${portfolio.added ? '' : 'add'}`}>
                                    {portfolio.added ? <Eye size={14} /> : <Plus size={14} />}
                                </button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Final Steps */}
                    <div className="profile-section card final-steps-card">
                        <div className="card-header">
                            <h2>Final Steps</h2>
                            <span className="badge-rising"><Award size={12} /> RISING STAR</span>
                        </div>
                        <ul className="checklist">
                            <li className={profileImage ? "done" : "pending"}>
                                {profileImage ? <CheckCircle2 size={16} /> : <div className="circle"></div>}
                                Profile photo updated
                            </li>
                            <li className={githubProfile.added ? "done" : "pending"}>
                                {githubProfile.added ? <CheckCircle2 size={16} /> : <div className="circle"></div>}
                                Add GitHub link (+5% strength)
                            </li>
                            <li className={domains.length > 0 ? "done" : "pending"}>
                                {domains.length > 0 ? <CheckCircle2 size={16} /> : <div className="circle"></div>}
                                Select domains of interest (+10%)
                            </li>
                        </ul>
                        <button
                            className="btn-save-go"
                            disabled={isSaving}
                            onClick={async () => {
                                setIsSaving(true);
                                try {
                                    const payload = {
                                        first_name: firstName,
                                        last_name: lastName,
                                        phone: phone,
                                        wilaya: locations[0] || '',
                                        academic_year: academicYear,
                                        speciality: speciality,
                                        university: university || userData?.profile?.university || '',
                                        domain: domains[0] || '',
                                        github_url: githubProfile?.url || '',
                                        portfolio_url: portfolio?.url || '',
                                        linkedin_url: linkedinProfile?.url || '',
                                        offer_type: offerType,
                                        duration: duration,
                                        skill_names: skills.map(s => s.name)
                                    };
                                    const updatedProfile = await studentService.updateProfile(payload);
                                    
                                    // Update localStorage
                                    const storedUser = localStorage.getItem('user');
                                    if (storedUser) {
                                        const userDataObj = JSON.parse(storedUser);
                                        const newUserObj = {
                                            ...userDataObj,
                                            first_name: updatedProfile.first_name || firstName,
                                            last_name: updatedProfile.last_name || lastName,
                                            profile: updatedProfile.profile || userDataObj.profile
                                        };
                                        localStorage.setItem('user', JSON.stringify(newUserObj));
                                    }
                                    
                                    // Dispatch event for Navbar
                                    window.dispatchEvent(new Event('profileUpdated'));

                                    if (onSave) onSave();
                                } catch (error) {
                                    console.error("Failed to complete profile:", error);
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                        >
                            {isSaving ? 'Saving...' : 'Save & Go to Dashboard'}
                        </button>
                        <p className="legal-text">
                            By completing your profile, you agree to show your credentials to potential recruiters.
                        </p>
                    </div>
                </aside>
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
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                <p>Enter the URL for your {linkModal.label.toLowerCase()} below.</p>
                                <div className="modal-input-wrapper">
                                    <input 
                                        type="text" 
                                        placeholder={`https://${linkModal.type}.com/yourname`}
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
        </motion.div>
    );
};

export default CompleteProfile;
