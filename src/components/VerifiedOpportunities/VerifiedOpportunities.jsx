import React from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaCheck, FaBuilding, FaChartLine } from 'react-icons/fa6';
import pcImage from '../../assets/pc.jpg';
import './VerifiedOpportunities.css';

const VerifiedOpportunities = () => {

    return (
        <section id="opportunities" className="verified-opportunities-section">
            <div className="vo-container">

                {/* LEFT COLUMN */}
                <motion.div
                    className="vo-left-content"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2 className="vo-title">
                        Find Internships from <br />
                        <span className="vo-gradient-text">Algeria's Leading Companies</span>
                    </h2>

                    <p className="vo-description">
                        Browse 200+ verified internship positions across technology, engineering, business, and more.
                        Every offer is validated by universities to ensure quality and compliance with academic requirements.
                    </p>

                    <button className="vo-btn" onClick={() => {
                        const element = document.getElementById('about');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        <span>Discover More</span>
                        <span className="arrow">→</span>
                    </button>

                    <div className="vo-stats-row">
                        {[
                            { num: "200+", label: "Active Offers" },
                            { num: "50+", label: "Companies" },
                            { num: "92%", label: "Success Rate" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                className="vo-stat-block"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                viewport={{ once: true }}
                            >
                                <span className="vo-stat-number">{stat.num}</span>
                                <span className="vo-stat-label">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* RIGHT COLUMN */}
                <motion.div
                    className="vo-right-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <div className="vo-image-container">
                        <img src={pcImage} alt="Internship Platform Interface" className="vo-main-image" />

                        {/* Play Button Overlay */}
                        <motion.div
                            className="vo-play-button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaPlay />
                        </motion.div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default VerifiedOpportunities;
