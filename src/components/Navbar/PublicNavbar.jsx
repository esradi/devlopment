import React from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';

const PublicNavbar = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const linkVariants = {
    hover: { scale: 1.05, color: "#ec4899" }
  };

  return (
    <>
      <div className="logo-section">
        <motion.a
          href="#home"
          className="logo"
          onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={logo} alt="Logo" className="nav-logo-img" />
        </motion.a>
      </div>
      <div className="menu-section">
        <ul className="menu-list">
          {['Home', 'About Us', 'Opportunities', 'How it Works', 'Stories', 'Contact Us'].map((item) => {
            const sectionId = item.toLowerCase().replace(/\s+/g, '-').replace('us', '').replace('it-', '').trim();
            // Fixing ID mapping manually slightly better
            const ids = {
              'Home': 'home',
              'About Us': 'about',
              'Opportunities': 'opportunities',
              'How it Works': 'how-it-works',
              'Stories': 'stories',
              'Contact Us': 'contact'
            };

            return (
              <motion.li key={item} variants={linkVariants} whileHover="hover">
                <a
                  href={`#${ids[item]}`}
                  className="nav-link"
                  onClick={(e) => { e.preventDefault(); scrollToSection(ids[item]); }}
                >
                  {item}
                  {/* Animated Underline */}
                  <motion.span
                    className="nav-underline"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'block',
                      height: '2px',
                      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                      marginTop: '4px'
                    }}
                  />
                </a>
              </motion.li>
            );
          })}
        </ul>
      </div>
      <motion.a
        href="#contact"
        className="cta-menu-button"
        onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        Login
      </motion.a>
    </>
  );
};

export default PublicNavbar;
