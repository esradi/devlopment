import React, { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import AboutUs from './components/AboutUs/AboutUs';
import VerifiedOpportunities from './components/VerifiedOpportunities/VerifiedOpportunities';
import HowItWorks from './components/HowItWorks/HowItWorks';
import Stories from './components/Testimonials/Testimonials';
import ContactUs from './components/ContactUs/ContactUs';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState('public');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="app">
      <motion.div
        className="progress-bar"
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #9e59ff 0%, #06b6d4 100%)',
          transformOrigin: '0%',
          zIndex: 10000,
          boxShadow: '0 0 10px rgba(158, 89, 255, 0.5)'
        }}
      />
      <Navbar role={userRole} />

      {/* Debug Role Switcher - Kept as per "Delete Later" instruction */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <select
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="public">View: Public</option>
          <option value="student">View: Student</option>
          <option value="company">View: Company</option>
          <option value="admin">View: Admin</option>
        </select>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Hero />
      </motion.div>

      {/* Why Us Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ amount: 0.3 }}
      >
        <AboutUs />
      </motion.div>

      {/* Verified Opportunities Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ amount: 0.3 }}
      >
        <VerifiedOpportunities />
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ amount: 0.3 }}
      >
        <HowItWorks />
      </motion.div>

      {/* Stories Section */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        viewport={{ amount: 0.3 }}
      >
        <Stories />
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ amount: 0.3 }}
      >
        <ContactUs />
      </motion.div>

      <Footer />
    </div>
  );
}

export default App;
