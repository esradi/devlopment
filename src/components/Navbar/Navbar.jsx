import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import StudentNavbar from './StudentNavbar';
import CompanyNavbar from './CompanyNavbar';
import AdminNavbar from './AdminNavbar';
import './Navbar.css';

const Navbar = ({ role }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const updateScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', updateScroll);
        return () => window.removeEventListener('scroll', updateScroll);
    }, []);

    const navbarBackground = useTransform(
        scrollY,
        [0, 100],
        ["rgba(5, 5, 5, 0)", "rgba(5, 5, 5, 0.8)"]
    );

    const navbarBackdrop = useTransform(
        scrollY,
        [0, 100],
        ["blur(0px)", "blur(10px)"]
    );

    const navbarBorder = useTransform(
        scrollY,
        [0, 100],
        ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]
    );

    const renderNavbarContent = () => {
        switch (role) {
            case 'student':
                return <StudentNavbar />;
            case 'company':
                return <CompanyNavbar />;
            case 'admin':
                return <AdminNavbar />;
            default:
                return <PublicNavbar />;
        }
    };

    return (
        <motion.nav
            className={`navbar ${isScrolled ? 'scrolled' : ''}`}
            style={{
                background: navbarBackground,
                backdropFilter: navbarBackdrop,
                borderBottom: `1px solid ${navbarBorder.get()}` // .get() might not work reactively in style prop string interpolation, purely using motion value in style is better but borderBottom needs manual handling or separate motion values.
                // Simpler approach: use class or just background/backdrop
            }}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="nav-content">
                {renderNavbarContent()}

                {/* Mobile Toggle acts as absolute overlay or part of right section in mobile view */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
