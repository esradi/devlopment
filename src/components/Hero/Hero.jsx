import React from 'react';
import { motion } from 'framer-motion';
import pic from '../../assets/pic.png';
import './Hero.css';

const Hero = () => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    const floatVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        },
        float: {
            y: [-15, 15, -15],
            transition: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <section id="home" className="hero-section">
            <div className="hero-content">
                <motion.div
                    className="text-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 className="main-heading" variants={itemVariants}>
                        Start matching to land your <br />
                        <span className="highlight">dream internship</span>
                    </motion.h1>

                    <motion.p className="subheading" variants={itemVariants}>
                        Connect with top companies, <br />
                        prove your skills with verified challenges, <br />
                        and get placed faster.
                    </motion.p>

                    <motion.div variants={itemVariants}>
                        <motion.button
                            className="cta-button"
                            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(139, 92, 246, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            LEARN MORE
                        </motion.button>
                    </motion.div>
                </motion.div>

                <div className="image-container">
                    {/* Glowing background effect BEHIND image (First in DOM + z-index 0) */}
                    <div className="image-glow" style={{ zIndex: 0 }}></div>

                    {/* Wrapper handles the entrance and floating - On TOP of glow (Second in DOM + z-index 10) */}
                    <motion.div
                        variants={floatVariants}
                        initial="hidden"
                        animate={["visible", "float"]}
                        className="floating-wrapper"
                        style={{ position: 'relative', zIndex: 10 }}
                    >
                        {/* Image handles the static tilt */}
                        <img
                            src={pic}
                            alt="3D Abstract Visual"
                            className="main-image"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
