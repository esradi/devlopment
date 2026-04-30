import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import pic from '../../assets/pic.png';
import { api } from '../../services/api';
import './ContactUs.css';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/contact/', formData);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            // Hide success message after 5 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 5000);
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('Contact form error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="contact-section-v2">
            <div className="contact-container-v2">
                <div className="contact-split">
                    {/* LEFT SIDE: Floating Image (Same as Hero) */}
                    <motion.div
                        className="contact-image-side"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="contact-glow-orb"></div>
                        <motion.div
                            animate={{
                                y: [-15, 15, -15],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <img src={pic} alt="Abstract Visual" className="contact-abstract-img" />
                        </motion.div>
                    </motion.div>

                    {/* RIGHT SIDE: Header + Form */}
                    <div className="contact-form-side">
                        <motion.div
                            className="contact-header-v2"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="contact-tag">GET IN TOUCH</span>
                            <h2 className="contact-title-v2">
                                Customer Service and <br />
                                <span className="highlight-blue">Excellence</span>
                            </h2>
                        </motion.div>

                        <motion.form
                            className="contact-form-v2"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {success && (
                                <div className="form-feedback success-message">
                                    ✓ Your message has been received. We will get back to you soon!
                                </div>
                            )}
                            {error && (
                                <div className="form-feedback error-message">
                                    ✗ {error}
                                </div>
                            )}

                            <div className="form-row-v2">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="pill-input"
                                />
                            </div>
                            <div className="form-row-v2">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="pill-input"
                                />
                            </div>
                            <div className="form-row-v2">
                                <input
                                    type="text"
                                    placeholder="Phone nr"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="pill-input"
                                />
                            </div>
                            <div className="form-row-v2">
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="pill-input"
                                />
                            </div>
                            <div className="form-row-v2">
                                <textarea
                                    placeholder="Message"
                                    rows="3"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="pill-textarea"
                                ></textarea>
                            </div>

                            <motion.button
                                type="submit"
                                className="contact-submit-pill"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                            >
                                <span className="submit-text">
                                    {loading ? 'SENDING...' : 'SEND'}
                                </span>
                                <div className="submit-arrow-circle">
                                    <FaArrowRight />
                                </div>
                            </motion.button>
                        </motion.form>
                    </div>
                </div>
            </div>

            {/* Background Glows */}
            <div className="contact-bg-glow-1"></div>
            <div className="contact-bg-glow-2"></div>
        </section>
    );
};

export default ContactUs;
