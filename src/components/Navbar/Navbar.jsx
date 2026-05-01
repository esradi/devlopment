import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, MessageSquare, Bell, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import NotificationCenter from '../NotificationCenter/NotificationCenter';

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

    // Sync role from localStorage on mount and when role changes
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && role === 'public') {
            try {
                const userData = JSON.parse(storedUser);
                if (userData.role) {
                    setUserRole(userData.role);
                }
            } catch (err) {
                console.warn('Failed to parse stored user data');
            }
        }
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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
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

    const isStudentDashboard = location.pathname.startsWith('/dashboard/student');

    const getDashboardLink = () => {
        switch (role) {
            case 'student': return '/student/dashboard';
            case 'company': return '/company/dashboard';
            case 'admin': return '/admin/dashboard';
            default: return '/';
        }
    };

    const getProfileLink = () => {
        let currentRole = role;

        if (currentRole === 'public' || !currentRole) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    if (userData.role) {
                        currentRole = userData.role;
                    }
                }
            } catch (err) {
                console.warn('Failed to retrieve role from localStorage');
            }
        }

        switch (currentRole) {
            case 'student': return '/dashboard/student/complete-profile';
            case 'company': return '/dashboard/company/profile';
            case 'admin': return '/admin/profile';
            default: return '/profile';
        }
    };

    const getProfileColor = () => {
        let currentRole = role;

        if (currentRole === 'public' || !currentRole) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    if (userData.role) {
                        currentRole = userData.role;
                    }
                }
            } catch (err) {
                console.warn('Failed to retrieve role from localStorage');
            }
        }

        switch (currentRole?.toLowerCase()) {
            case 'student': return '#3b82f6';
            case 'company': return '#10b981';
            case 'admin': return '#f59e0b';
            default: return '#9333ea';
        }
    };

    const getProfileName = () => {
        let currentRole = role;

        if (currentRole === 'public' || !currentRole) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    if (userData.role) {
                        currentRole = userData.role;
                    }
                }
            } catch (err) {
                console.warn('Failed to retrieve role from localStorage');
            }
        }

        switch (currentRole?.toLowerCase()) {
            case 'student': return 'AB';
            case 'company': return 'Tech';
            case 'admin': return 'Admin';
            default: return 'User';
        }
    };

    return (
        <motion.nav
            className={`navbar ${isScrolled ? 'scrolled' : ''}`}
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
                <ul className="menu-list">
                    {publicLinks.map((link) => (
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
                    ))}
                </ul>

                {/* RIGHT ACTIONS */}
                <div className="actions-section">
                    {role !== 'public' ? (
                        <div className="auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link
                                to={role === 'student' ? '/dashboard/student/messages' : role === 'company' ? '/dashboard/company/messages' : '/dashboard/admin/messages'}
                                className="nav-action-btn"
                                title="Messages"
                            >
                                <MessageSquare size={20} />
                                <span className="action-badge">2</span>
                            </Link>

                            <NotificationCenter role={role} />

                            <div className="profile-container" style={{ marginLeft: '8px' }}>
                                <div className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 12px 4px 4px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <div className="profile-avatar" style={{ backgroundColor: '#9e59ff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                                        {getProfileName()}
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Ahmed B.</span>
                                </div>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            className="profile-dropdown"
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        >
                                            <Link to={getProfileLink()} className="dropdown-item">
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
                            {publicLinks.map((link) => (
                                <li key={link.id}>
                                    <a href={`/#${link.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}>
                                        {link.label}
                                    </a>
                                </li>
                            ))}

                            {role !== 'public' && (
                                <>
                                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', margin: '10px 0' }} />
                                    <li><Link to={getProfileLink()}>Profile</Link></li>
                                    <li><button onClick={handleLogout} className="mobile-logout-link">Logout</button></li>
                                </>
                            )}
                            {role === 'public' && !isDashboardView && (
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
