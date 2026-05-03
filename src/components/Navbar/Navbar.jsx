import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, MessageSquare, Bell, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import { messageService } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';

const Navbar = ({ role, setUserRole }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // WebSocket for real-time messages
    const { message: wsMessage } = useWebSocket('/messages/');

    useEffect(() => {
        const updateScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', updateScroll);
        return () => window.removeEventListener('scroll', updateScroll);
    }, []);

    // Sync role from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && role === 'public') {
            try {
                const userData = JSON.parse(storedUser);
                if (userData.role) {
                    setUserRole(userData.role);
                }
            } catch (err) { }
        }
    }, []);

    const fetchUnreadCount = async () => {
        if (role !== 'public' && role) {
            try {
                const res = await messageService.getUnreadCount();
                setUnreadMessages(res.unread_count || 0);
            } catch (err) {
                console.error("Failed to fetch unread count:", err);
            }
        }
    };

    // Initial and periodic sync
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Sync every minute just in case

        // Listen for internal "read" events from AdminMessages
        window.addEventListener('messagesRead', fetchUnreadCount);

        return () => {
            clearInterval(interval);
            window.removeEventListener('messagesRead', fetchUnreadCount);
        };
    }, [role]);

    // Update unread count on new websocket message
    useEffect(() => {
        if (wsMessage && wsMessage.type === 'chat_message') {
            // Re-fetch total count for 100% accuracy
            fetchUnreadCount();
        }
    }, [wsMessage]);

    // Close dropdowns on route change
    useEffect(() => {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
        // We no longer reset to 0 here because being on the page doesn't mean all are read
        // The individual conversation opening should trigger a mark-as-read in the future
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

    const publicLinks = [
        { label: 'Home', id: 'home' },
        { label: 'About Us', id: 'about' },
        { label: 'Opportunities', id: 'opportunities' },
        { label: 'How it Works', id: 'how-it-works' },
        { label: 'Stories', id: 'stories' },
        { label: 'Contact Us', id: 'contact' }
    ];

    const isDashboardView = location.pathname.includes('/dashboard') ||
        location.pathname.includes('/student/') ||
        location.pathname.includes('/company/') ||
        location.pathname.includes('/admin/');

    const getProfileLink = () => {
        let currentRole = role;
        if (currentRole === 'public' || !currentRole) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) currentRole = JSON.parse(storedUser).role;
            } catch (err) { }
        }
        switch (currentRole) {
            case 'student': return '/dashboard/student/complete-profile';
            case 'company': return '/dashboard/company/profile';
            case 'admin': return '/dashboard/admin/settings';
            default: return '/profile';
        }
    };

    const getProfileName = () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                return (userData.first_name || userData.email || 'A').charAt(0).toUpperCase();
            }
        } catch (err) { }
        return 'U';
    };

    return (
        <motion.nav
            className={`navbar ${isScrolled ? 'scrolled' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="nav-content">
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

                <ul className="menu-list">
                    {publicLinks.map((link) => (
                        <li key={link.id}>
                            <a href={`/#${link.id}`} className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}>
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* RIGHT ACTIONS */}
                <div className="actions-section" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingLeft: '24px',
                }}>
                    {role !== 'public' ? (
                        <div className="auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link
                                to={role === 'student' ? '/dashboard/student' : role === 'company' ? '/dashboard/company' : '/dashboard/admin'}
                                className="nav-action-btn dashboard-btn"
                                title="Dashboard"
                            >
                                <LayoutDashboard size={20} />
                            </Link>

                            <Link
                                to={role === 'student' ? '/dashboard/student/messages' : role === 'company' ? '/dashboard/company/messages' : '/dashboard/admin/messages'}
                                className="nav-action-btn messages-btn"
                                title="Messages"
                            >
                                <MessageSquare size={20} />
                                {unreadMessages > 0 && <span className="action-badge">{unreadMessages}</span>}
                            </Link>

                            <NotificationCenter role={role} />

                            <div className="profile-container" style={{ marginLeft: '8px' }}>
                                <div className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 12px 4px 4px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <div className="profile-avatar" style={{ backgroundColor: '#9e59ff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                                        {getProfileName()}
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                                        {(() => {
                                            try {
                                                const storedUser = localStorage.getItem('user');
                                                if (storedUser) {
                                                    const userData = JSON.parse(storedUser);
                                                    return userData.first_name || userData.email.split('@')[0];
                                                }
                                            } catch (e) { }
                                            return 'User';
                                        })()}
                                    </span>
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
                        <Link to="/login" className="cta-menu-button">Login</Link>
                    )}

                    <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div className="mobile-menu" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <ul className="mobile-menu-list">
                            {publicLinks.map((link) => (
                                <li key={link.id}><a href={`/#${link.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}>{link.label}</a></li>
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
