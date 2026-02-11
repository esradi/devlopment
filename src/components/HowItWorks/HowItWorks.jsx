import React from 'react';
import { motion } from 'framer-motion';
import './HowItWorks.css';

const HowItWorks = () => {
    const steps = [
        {
            id: "01",
            title: "Profile Creation",
            subtitle: "& Setup",
            pos: "low"
        },
        {
            id: "02",
            title: "AI Matching",
            subtitle: "Algorithm",
            pos: "high"
        },
        {
            id: "03",
            title: "Skill Verification",
            subtitle: "& Interview Prep",
            pos: "low"
        },
        {
            id: "04",
            title: "Get Hired",
            subtitle: "& Start Journey",
            pos: "high"
        }
    ];

    return (
        <section id="how-it-works" className="hiw-section">
            <div className="hiw-container">
                {/* 1. Header Section - Wrapped in a Card */}
                <motion.div
                    className="hiw-header-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="hiw-header">
                        <div className="hiw-header-titles">
                            <span className="hiw-pre-title">HOW IT WORKS</span>
                            <h2 className="hiw-main-title">
                                Your Path to the <br />
                                Perfect Internship
                            </h2>
                        </div>

                        <div className="hiw-header-divider">
                            <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="hiw-line-arrow">
                                <line x1="0" y1="10" x2="190" y2="10" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <path d="M188 6 L196 10 L188 14" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" fill="none" />
                            </svg>
                        </div>

                        <div className="hiw-header-desc">
                            <p>
                                From profile creation to offer acceptance, our AI-powered platform streamlines every step of your internship journey. Get matched with opportunities that align perfectly with your skills and career goals.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Process Flow */}
                <div className="hiw-flow-wrapper">
                    <div className="hiw-wave-background">
                        <svg viewBox="0 0 1000 150" preserveAspectRatio="none" className="hiw-wave-svg">
                            <path
                                d="M0,105 C150,105 150,15 250,15 S350,105 500,105 S650,15 750,15 S850,105 1000,105"
                                fill="none"
                                stroke="#c0b7e8"
                                strokeWidth="2"
                                strokeDasharray="8 8"
                                strokeOpacity="0.3"
                            />
                        </svg>
                    </div>

                    <div className="hiw-steps-flex">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="hiw-step-item"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                viewport={{ once: true }}
                            >
                                <div className={`hiw-circle-wrap ${step.pos}`}>
                                    <div className="hiw-circle">
                                        <span className="hiw-number">{step.id}</span>
                                    </div>
                                </div>
                                <div className="hiw-info">
                                    <h4 className="hiw-info-title">
                                        <span className="hiw-arrow">→</span>{step.title}
                                    </h4>
                                    <p className="hiw-info-sub">{step.subtitle}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
