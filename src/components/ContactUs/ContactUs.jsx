import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import pic from '../../assets/pic.png';
import './ContactUs.css';

const ContactUs = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        alert("Message sent! (Demo)");
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
                            <div className="form-row-v2">
                                <input type="text" placeholder="Name" required className="pill-input" />
                            </div>
                            <div className="form-row-v2">
                                <input type="email" placeholder="Email" required className="pill-input" />
                            </div>
                            <div className="form-row-v2">
                                <input type="text" placeholder="Phone nr" required className="pill-input" />
                            </div>
                            <div className="form-row-v2">
                                <input type="text" placeholder="Subject" required className="pill-input" />
                            </div>
                            <div className="form-row-v2">
                                <textarea placeholder="Message" rows="3" required className="pill-textarea"></textarea>
                            </div>

                            <motion.button
                                type="submit"
                                className="contact-submit-pill"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="submit-text">SEND</span>
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
