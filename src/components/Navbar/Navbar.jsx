import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageSquare, Bell, User } from 'lucide-react';
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

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user from localStorage');
            }
        }
    }, [role, location.pathname]);

    const handleLogout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            const access = localStorage.getItem('access_token');

            if (refresh && access) {
                await fetch('http://127.0.0.1:8000/api/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access}`
                    },
                    body: JSON.stringify({ refresh })
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            setUserRole('public');
            navigate('/');
        }
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

    const getProfileColor = () => {
        switch (role) {
            case 'student': return '#C026D3'; // Matches your theme
            case 'company': return '#10b981';
            case 'admin': return '#f59e0b';
            default: return '#9333ea';
        }
    };

    const getProfileName = () => {
        if (user && (user.first_name || user.fullName)) {
            // Priority to split first_name/last_name from backend
            const firstName = user.first_name || user.fullName?.split(' ')[0] || '';
            const lastName = user.last_name || user.fullName?.split(' ')[1] || '';

            const firstChar = firstName ? firstName.charAt(0).toUpperCase() : '';
            const lastChar = lastName ? lastName.charAt(0).toUpperCase() : '';

            return firstChar + lastChar || user.email.charAt(0).toUpperCase();
        }

        switch (role) {
            case 'student': return 'ST';
            case 'company': return 'CO';
            case 'admin': return 'AD';
            default: return 'U';
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
                </div>

                {/* RIGHT ACTIONS */}
                <div className="actions-section">
                    {role !== 'public' ? (
                        <div className="auth-actions">
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
