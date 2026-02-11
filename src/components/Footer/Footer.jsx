import React from 'react';
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-logo">
                    <h2>STAGE</h2>
                    <p>Connecting students with their dream internships.</p>
                </div>

                <div className="footer-links">
                    <div className="link-column">
                        <h4>Platform</h4>
                        <a href="#home">Home</a>
                        <a href="#about">About Us</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#contact">Contact</a>
                    </div>

                    <div className="link-column">
                        <h4>Legal</h4>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>

                <div className="footer-social">
                    <h4>Follow Us</h4>
                    <div className="social-icons">
                        <a href="#" className="social-icon"><FaTwitter /></a>
                        <a href="#" className="social-icon"><FaLinkedin /></a>
                        <a href="#" className="social-icon"><FaGithub /></a>
                        <a href="#" className="social-icon"><FaInstagram /></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} STAGE Platform. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
