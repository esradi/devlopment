import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, MessageSquare, Bell, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import './Navbar.css';

const Navbar = ({ role, setUserRole }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const updateScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', updateScroll);
        return () => window.removeEventListener('scroll', updateScroll);
    }, []);

    // Close dropdowns on route change
    useEffect(() => {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const scrollToSection = (sectionId) => {
        setIsMobileMenuOpen(false);
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: sectionId } });
            return;
        }
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleLogout = () => {
        setUserRole('public');
        navigate('/');
    };

    const navbarBackground = useTransform(
        scrollY,
        [0, 100],
        ["rgba(5, 5, 5, 0)", "rgba(5, 5, 5, 0.8)"]
    );

    const publicLinks = [
        { label: 'Home', id: 'home' },
        { label: 'About Us', id: 'about' },
        { label: 'Opportunities', id: 'opportunities' },
        { label: 'How it Works', id: 'how-it-works' },
        { label: 'Stories', id: 'stories' },
        { label: 'Contact Us', id: 'contact' }
    ];

    const dashboardLinks = {
        student: [
            { label: 'Dashboard', path: '/student/dashboard' },
            { label: 'Challenges', path: '/student/challenges' },
            { label: 'Offers', path: '/browse-offers' },
            { label: 'Buddies', path: '/student/buddies' }
        ],
        company: [
            { label: 'Dashboard', path: '/company/dashboard' },
            { label: 'Offers', path: '/company/offers' },
            { label: 'Candidates', path: '/company/candidates' },
            { label: 'Interviews', path: '/company/interviews' }
        ],
        admin: [
            { label: 'Dashboard', path: '/admin/dashboard' },
            { label: 'Validation', path: '/admin/validation' },
            { label: 'Users', path: '/admin/users' },
            { label: 'Stats', path: '/admin/stats' }
        ]
    };

    const isDashboardView = location.pathname.includes('/dashboard') ||
        location.pathname.includes('/student/') ||
        location.pathname.includes('/company/') ||
        location.pathname.includes('/admin/');

    const getDashboardLink = () => {
        switch (role) {
            case 'student': return '/student/dashboard';
            case 'company': return '/company/dashboard';
            case 'admin': return '/admin/dashboard';
            default: return '/';
        }
    };

    const getProfileColor = () => {
        switch (role) {
            case 'student': return '#3b82f6';
            case 'company': return '#10b981';
            case 'admin': return '#f59e0b';
            default: return '#9333ea';
        }
    };

    const getProfileName = () => {
        switch (role) {
            case 'student': return 'JD';
            case 'company': return 'Tech';
            case 'admin': return 'Admin';
            default: return 'User';
        }
    };

    return (
        <motion.nav
            className={`navbar ${isScrolled ? 'scrolled' : ''}`}
            style={{
                background: navbarBackground,
                backdropFilter: isScrolled ? 'blur(10px)' : 'none',
            }}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="nav-content">
                {/* LOGO */}
                <div className="logo-section">
                    <Link to="/" className="logo" onClick={() => scrollToSection('home')}>
                        <motion.img
                            src={logo}
                            alt="Logo"
                            className="nav-logo-img"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        />
                    </Link>
                </div>

                {/* CENTRAL MENU */}
                <div className="menu-section">
                    <ul className="menu-list">
                        {!isDashboardView ? (
                            // Public / Landing Page Links
                            publicLinks.map((link) => (
                                <li key={link.id}>
                                    <a
                                        href={`/#${link.id}`}
                                        className="nav-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection(link.id);
                                        }}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))
                        ) : (
                            // Role-Specific Dashboard Links
                            dashboardLinks[role]?.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="actions-section">
                    {role !== 'public' ? (
                        <div className="auth-actions">
                            <Link to={getDashboardLink()} className="action-icon" title="Dashboard">
                                <LayoutDashboard size={20} />
                            </Link>
                            <Link to="/messages" className="action-icon" title="Messages">
                                <MessageSquare size={20} />
                            </Link>
                            <Link to="/notifications" className="action-icon" title="Notifications">
                                <Bell size={20} />
                                <span className="notification-dot"></span>
                            </Link>

                            {/* Profile with Dropdown */}
                            <div className="profile-container">
                                <div className="profile-pill" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                                    <span>{getProfileName()}</span>
                                    <div
                                        className="profile-avatar"
                                        style={{ background: getProfileColor() }}
                                    >
                                        <User size={14} color="white" />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            className="profile-dropdown"
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        >
                                            <Link to="/profile" className="dropdown-item">
                                                <User size={16} />
                                                <span>Profile</span>
                                            </Link>
                                            <hr className="dropdown-divider" />
                                            <button onClick={handleLogout} className="dropdown-item logout">
                                                <X size={16} />
                                                <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="cta-menu-button">
                            Login
                        </Link>
                    )}

                    <button
                        className="mobile-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <ul className="mobile-menu-list">
                            {!isDashboardView ? (
                                publicLinks.map((link) => (
                                    <li key={link.id}>
                                        <a href={`/#${link.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}>
                                            {link.label}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                dashboardLinks[role]?.map((link) => (
                                    <li key={link.path}>
                                        <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            )}

                            {role !== 'public' && (
                                <>
                                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', margin: '10px 0' }} />
                                    <li><Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link></li>
                                    <li><button onClick={handleLogout} className="mobile-logout-link">Logout</button></li>
                                </>
                            )}
                            {role === 'public' && (
                                <li><Link to="/login" className="mobile-login-btn" onClick={() => setIsMobileMenuOpen(false)}>Login</Link></li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
