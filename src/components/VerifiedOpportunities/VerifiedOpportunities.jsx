import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaCheck, FaBuilding, FaChartLine } from 'react-icons/fa6';
import pcImage from '../../assets/pc.jpg';
import { api } from '../../services/api';
import './VerifiedOpportunities.css';


const VerifiedOpportunities = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeOffers: 0,
        companiesWithOffers: 0,
        successRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlatformStats();
    }, []);

    const fetchPlatformStats = async () => {
        try {
            const data = await api.get('/platform-stats/');
            
            setStats({
                activeOffers: data.active_offers || 0,
                companiesWithOffers: data.companies_with_offers || 0,
                successRate: data.success_rate || 0
            });
        } catch (error) {
            console.error('Error fetching platform stats:', error);
            // Fallback to default values if API fails
            setStats({
                activeOffers: 200,
                companiesWithOffers: 50,
                successRate: 92
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLearnMore = () => {
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (user && user.role && typeof user.role === 'string') {
                if (user.role === 'student') {
                    navigate('/dashboard/student');
                } else if (user.role === 'company') {
                    navigate('/dashboard/company');
                } else {
                    navigate('/signup');
                }
            } else {
                navigate('/signup');
            }
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            navigate('/signup');
        }
    };

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

                    <button className="vo-btn" onClick={handleLearnMore}>
                        <span>Discover More</span>
                        <span className="arrow">→</span>
                    </button>

                    <div className="vo-stats-row">
                        {[
                            { num: `${stats.activeOffers}+`, label: "Active Offers" },
                            { num: `${stats.companiesWithOffers}+`, label: "Companies" },
                            { num: `${stats.successRate}%`, label: "Success Rate" }
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
