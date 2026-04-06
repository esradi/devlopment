import React, { useState, useRef } from 'react';
import { dashboardService } from '../../services/api';
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
    const [skills, setSkills] = useState([
        { name: 'REACT.JS', level: 'Expert' }, 
        { name: 'NODE.JS', level: 'Intermediate' }, 
        { name: 'FIGMA', level: 'Advanced' }, 
        { name: 'PYTHON', level: 'Beginner' }
    ]);
    const [locations, setLocations] = useState(['Algiers', 'Oran']);
    const [domains, setDomains] = useState(['Engineering', 'UI/UX Design', 'Backend Dev']);
    const [offerType, setOfferType] = useState('Stage');
    const [duration, setDuration] = useState('6M');
    const [isSaving, setIsSaving] = useState(false);
    const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
    const [showDomainDropdown, setShowDomainDropdown] = useState(false);
    
    // File upload & share states
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const contentRef = useRef(null);

    const handleShareProfile = () => {
        navigator.clipboard.writeText('https://stage.io/p/amine-benali-1234');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleExportCV = () => {
        const element = contentRef.current;
        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     `CV-${userData?.first_name || 'Amine'}-${userData?.last_name || 'Benali'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0d0d12' },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    // Interactive Demo States
    const [githubProfile, setGithubProfile] = useState({ added: false, url: '' });
    const [portfolio, setPortfolio] = useState({ added: false, url: '' });

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddGithub = () => {
        setGithubProfile({ added: true, url: 'github.com/amine-benali' });
    };

    const handleAddPortfolio = () => {
        setPortfolio({ added: true, url: 'amine-portfolio.dev' });
    };

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
                                        src={profileImage || userData?.profile?.profile_picture || `https://ui-avatars.com/api/?name=${userData?.first_name}+${userData?.last_name}&background=9e59ff&color=fff`} 
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
                                        <input type="text" defaultValue={userData?.first_name || "Amine"} />
                                    </div>
                                    <div className="field-group">
                                        <label>LAST NAME</label>
                                        <input type="text" defaultValue={userData?.last_name || "Benali"} />
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
                                            <input type="text" defaultValue="+213 5XX XX XX XX" />
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
                                            <select>
                                                <option>Master 2 / Engineering</option>
                                                <option>Licence 3</option>
                                            </select>
                                            <ChevronDown size={16} className="chevron" />
                                        </div>
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>SPECIALIZATION</label>
                                    <input type="text" placeholder="e.g. Computer Science" defaultValue={userData?.profile?.speciality} />
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
                                            {s.level === 'Expert' && <><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" color="#fbbf24"/></>}
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
                                    <span className="status connected">CONNECTED</span>
                                </div>
                                <button className="link-action"><RefreshCw size={14} /></button>
                            </div>
                            <motion.div 
                                className={`link-item ${!githubProfile.added ? 'interactive' : ''}`}
                                whileHover={!githubProfile.added ? "hover" : ""}
                                whileTap={!githubProfile.added ? "tap" : ""}
                                variants={interactiveVariants}
                                onClick={!githubProfile.added ? handleAddGithub : undefined}
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
                            <div className="link-item">
                                <div className="link-icon linkedin"><Linkedin size={18} /></div>
                                <div className="link-text">
                                    <h4>LinkedIn</h4>
                                    <span className="status connected">CONNECTED</span>
                                </div>
                                <button className="link-action"><Eye size={14} /></button>
                            </div>
                            <motion.div 
                                className={`link-item ${!portfolio.added ? 'interactive' : ''}`}
                                whileHover={!portfolio.added ? "hover" : ""}
                                whileTap={!portfolio.added ? "tap" : ""}
                                variants={interactiveVariants}
                                onClick={!portfolio.added ? handleAddPortfolio : undefined}
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
                            <li className="done"><CheckCircle2 size={16} /> Profile photo updated</li>
                            <li className="pending"><div className="circle"></div> Add GitHub link (+5% strength)</li>
                            <li className="pending"><div className="circle"></div> Select domains of interest (+10%)</li>
                        </ul>
                        <button 
                            className="btn-save-go" 
                            disabled={isSaving}
                            onClick={async () => {
                                setIsSaving(true);
                                try {
                                    const payload = {
                                        // Map current local states to backend fields
                                        wilaya: locations[0], 
                                        academic_year: "Master 2",
                                        speciality: userData?.profile?.speciality,
                                        skill_names: skills.map(s => s.name)
                                    };
                                    await dashboardService.updateProfile(payload);
                                    if(onSave) onSave();
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
        </motion.div>
    );
};

export default CompleteProfile;
