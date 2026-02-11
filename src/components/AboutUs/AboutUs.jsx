import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import laptopImage from '../../assets/computer.png'; // Using computer.png as it exists
import './AboutUs.css'; // Renamed import to match file

import { FaBrain, FaShieldHalved, FaVideo, FaFileLines, FaChartLine, FaBell, FaBolt, FaCheckDouble } from 'react-icons/fa6';

const features = [
    {
        id: 1,
        tagIcon: <FaBolt />,
        tagText: 'NEURAL ALIGNMENT',
        title: 'AI-Powered Smart Matching',
        description: 'Our proprietary neural networks analyze over 500 unique data points—from technical proficiency to cultural synergy—to ensure a perfect match for your career trajectory.',
        icon: <FaBrain />,
        position: 'top'
    },
    {
        id: 2,
        tagIcon: <FaCheckDouble />,
        tagText: 'CERTIFIED TRUST',
        title: 'Real-Time Skill Verification',
        description: 'Bypass the uncertainty of traditional testing. Our live verification engine validates expertise through interactive problem-solving and real-time behavioral analysis.',
        icon: <FaShieldHalved />,
        position: 'top-right'
    },
    {
        id: 3,
        tagIcon: <FaVideo />,
        tagText: 'INTERVIEW INTELLIGENCE',
        title: 'AI Interview Simulator',
        description: 'Practice with our advanced AI interviewer that analyzes communication patterns, provides instant feedback, and helps you master the art of professional presence.',
        icon: <FaVideo />,
        position: 'bottom-right'
    },
    {
        id: 4,
        tagIcon: <FaFileLines />,
        tagText: 'INSTANT AUTOMATION',
        title: 'Smart Document Generation',
        description: 'Transform weeks of paperwork into minutes. Our intelligent system auto-generates, validates, and manages all official documentation with digital signatures.',
        icon: <FaFileLines />,
        position: 'bottom'
    },
    {
        id: 5,
        tagIcon: <FaChartLine />,
        tagText: 'DEEP INSIGHTS',
        title: 'Advanced Application Analytics',
        description: 'Track every stage of your journey with precision metrics. Understand your performance, compare with market standards, and optimize your approach with data-driven insights.',
        icon: <FaChartLine />,
        position: 'bottom-left'
    },
    {
        id: 6,
        tagIcon: <FaBell />,
        tagText: 'SMART ALERTS',
        title: 'Intelligent Job Recommendations',
        description: 'Never miss an opportunity. Our AI-powered notification system learns your preferences and delivers perfectly-timed alerts for positions that match your unique career aspirations.',
        icon: <FaBell />,
        position: 'top-left'
    }
];

const AboutUs = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % features.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const activeFeature = features[activeIndex];

    return (
        <section id="about" className="why-us-section">
            <div className="why-us-container">

                {/* LEFT SIDE */}
                <div className="left-content">
                    <h2 className="section-title">
                        Why <span className="gradient-text">Us?</span>
                    </h2>

                    <div className="title-underline"></div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.6 }}
                            className="feature-card"
                        >
                            <div className="feature-tag">
                                {activeFeature.tagIcon}
                                <span>{activeFeature.tagText}</span>
                            </div>

                            <h3 className="feature-title">{activeFeature.title}</h3>

                            <p className="feature-description">{activeFeature.description}</p>

                            <button className="learn-more-btn">
                                <span>LEARN MORE</span>
                                <span className="arrow">→</span>
                            </button>

                            <div className="progress-dots">
                                {features.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`dot ${index === activeIndex ? 'active' : ''}`}
                                        onClick={() => setActiveIndex(index)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* RIGHT SIDE - Laptop with orbital features */}
                <div className="right-content">
                    {/* <h2 className="orbital-title">Why Us?</h2> Removed as left side has title */}

                    <div className="orbital-container">
                        {/* Center Laptop */}
                        {/* Center Laptop */}
                        <div className="center-laptop">
                            <img src={laptopImage} alt="Platform" />
                        </div>

                        {/* Orbital circles with static positioning + internal motion reveal */}
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                className={`orbital-icon ${feature.position} ${index === activeIndex ? 'active' : ''}`}
                                onClick={() => setActiveIndex(index)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    viewport={{ once: true }}
                                    className="orbital-motion-wrapper"
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
                                >
                                    <div className="icon-circle">
                                        <span className="icon">{feature.icon}</span>
                                    </div>
                                    <p className="icon-label">{feature.title}</p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
