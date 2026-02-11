import React from 'react';
import { motion } from 'framer-motion';
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaArrowRight, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-v2">
            {/* Ambient Background Glows */}
            <div className="footer-glow-1"></div>
            <div className="footer-glow-2"></div>

            <div className="footer-container-v2">
                <div className="footer-grid-v2">

                    {/* Column 1: Brand & Bio */}
                    <div className="footer-col brand-col">
                        <div className="footer-logo-v2">
                            <img src={logo} alt="STAGE Logo" className="footer-logo-img" />
                            <span className="footer-logo-text">STAGE</span>
                        </div>
                        <p className="footer-description-v2">
                            Connecting the next generation of Algerian talent with industry-leading opportunities through AI-powered intelligence and seamless automation.
                        </p>
                        <div className="footer-social-v2">
                            {[
                                { icon: <FaTwitter />, link: "#" },
                                { icon: <FaLinkedin />, link: "#" },
                                { icon: <FaGithub />, link: "#" },
                                { icon: <FaInstagram />, link: "#" }
                            ].map((social, idx) => (
                                <motion.a
                                    key={idx}
                                    href={social.link}
                                    className="social-btn"
                                    whileHover={{ y: -5, scale: 1.1, backgroundColor: "rgba(158, 89, 255, 0.2)" }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="footer-col links-col">
                        <h4 className="footer-col-title">Quick Links</h4>
                        <ul className="footer-links-v2">
                            <li><a href="#home">Home</a></li>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#opportunities">Opportunities</a></li>
                            <li><a href="#how-it-works">How It Works</a></li>
                            <li><a href="#stories">Stories</a></li>
                            <li><a href="#contact">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div className="footer-col contact-col">
                        <h4 className="footer-col-title">Get in Touch</h4>
                        <ul className="footer-contact-list">
                            <li>
                                <FaMapMarkerAlt className="contact-icon" />
                                <span>Tech Hub Algiers, Algeria</span>
                            </li>
                            <li>
                                <FaPhone className="contact-icon" />
                                <span>+213 (0) 555 12 34 56</span>
                            </li>
                            <li>
                                <FaEnvelope className="contact-icon" />
                                <span>hello@stage.io</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div className="footer-col newsletter-col">
                        <h4 className="footer-col-title">Join Our Journey</h4>
                        <p className="newsletter-text">Subscribe for the latest internship alerts and career insights.</p>
                        <div className="newsletter-form-v2">
                            <input type="email" placeholder="Email Address" className="newsletter-input" />
                            <button className="newsletter-btn">
                                <FaArrowRight />
                            </button>
                        </div>
                    </div>

                </div>

                <div className="footer-bottom-v2">
                    <div className="footer-bottom-content">
                        <p>&copy; {new Date().getFullYear()} STAGE. Built for the Future.</p>
                        <div className="footer-legal">
                            <a href="#">Privacy Policy</a>
                            <span className="separator">•</span>
                            <a href="#">Terms of Use</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
