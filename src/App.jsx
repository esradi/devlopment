import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import AboutUs from './components/AboutUs/AboutUs';
import VerifiedOpportunities from './components/VerifiedOpportunities/VerifiedOpportunities';
import HowItWorks from './components/HowItWorks/HowItWorks';
import Stories from './components/Testimonials/Testimonials';
import ContactUs from './components/ContactUs/ContactUs';
import Footer from './components/Footer/Footer';
import Login from './pages/auth/login';
import SignUp from './pages/auth/signup';
import ForgotPassword from './pages/auth/forgotpassword';
import ResetPassword from './pages/auth/resetpassword';
import StudentDashboard from './pages/student/StudentDashboard';
import OfferDetails from './pages/student/OfferDetails';
import './App.css';

const LandingPage = ({ userRole }) => {
  const { scrollYProgress } = useScroll();
  const location = useLocation();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <>
      <motion.div
        className="progress-bar"
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #9e59ff 0%, #db2777 100%)',
          transformOrigin: '0%',
          zIndex: 10000,
          boxShadow: '0 0 10px rgba(158, 89, 255, 0.5)'
        }}
      />

      {/* Hero Section */}
      <motion.div
        id="home"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Hero />
      </motion.div>

      {/* Why Us Section */}
      <motion.div
        id="about"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ amount: 0.3 }}
      >
        <AboutUs />
      </motion.div>

      {/* Verified Opportunities Section */}
      <motion.div
        id="opportunities"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ amount: 0.3 }}
      >
        <VerifiedOpportunities />
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        id="how-it-works"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ amount: 0.3 }}
      >
        <HowItWorks />
      </motion.div>

      {/* Stories Section */}
      <motion.div
        id="stories"
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        viewport={{ amount: 0.3 }}
      >
        <Stories />
      </motion.div>

      {/* Contact Section */}
      <motion.div
        id="contact"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ amount: 0.3 }}
      >
        <ContactUs />
      </motion.div>
    </>
  );
};

function App() {
  const [userRole, setUserRole] = useState(() => {
    return window.location.pathname.startsWith('/dashboard') ? 'student' : 'public';
  });
  const location = useLocation();
  const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuthPage = authPaths.includes(location.pathname);
  const hideLayout = isAuthPage;

  return (
    <div className="app">
      {!hideLayout && <Navbar role={userRole} setUserRole={setUserRole} />}

      <Routes>
        <Route path="/" element={<LandingPage userRole={userRole} />} />
        <Route path="/login" element={<Login setUserRole={setUserRole} />} />
        <Route path="/signup" element={<SignUp setUserRole={setUserRole} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard/student/*" element={<StudentDashboard setUserRole={setUserRole} />} />
        <Route path="/dashboard/student/offer/:id" element={<OfferDetails setUserRole={setUserRole} />} />
      </Routes>

      {!hideLayout && !isDashboard && <Footer />}
    </div>
  );
}

const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
