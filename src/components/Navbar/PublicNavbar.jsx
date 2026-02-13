import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
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
        <Link
          to="/"
          className="logo"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              scrollToSection('home');
            }
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={logo} alt="Logo" className="nav-logo-img" />
          </motion.div>
        </Link>
      </div>
      <div className="menu-section">
        <ul className="menu-list">
          {['Home', 'About Us', 'Opportunities', 'How it Works', 'Stories', 'Contact Us'].map((item) => {
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
                  href={`/#${ids[item]}`}
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(ids[item]);
                  }}
                >
                  {item}
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
      <motion.div
        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        <Link to="/login" className="cta-menu-button">
          Login
        </Link>
      </motion.div>
    </>
  );
};

export default PublicNavbar;
