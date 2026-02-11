import React from 'react';
import { motion } from 'framer-motion';
import './Testimonials.css';

const testimonialsData = [
    {
        id: 1,
        name: "Amine Khelil",
        role: "Software Student",
        comment: "Found an incredible internship at a top tech firm in Algiers. The AI matching was spot on with my React skills!",
        rating: 5,
        avatar: "https://ui-avatars.com/api/?name=Amine+Khelil&background=9e59ff&color=fff"
    },
    {
        id: 2,
        name: "Lina Belhadj",
        role: "Data Science Student",
        comment: "The verification process gave me peace of mind. I knew the opportunity at the banking sector was legitimate and high-quality.",
        rating: 5,
        avatar: "https://ui-avatars.com/api/?name=Lina+Belhadj&background=06b6d4&color=fff"
    },
    {
        id: 3,
        name: "Yassine Merabet",
        role: "Engineering Student",
        comment: "I landed a position at a leading energy company. This platform is a game-changer for Algerian students looking for real experience.",
        rating: 5,
        avatar: "https://ui-avatars.com/api/?name=Yassine+Merabet&background=ff1b90&color=fff"
    },
    {
        id: 4,
        name: "Sara Ouahabi",
        role: "Marketing Student",
        comment: "Excellent support throughout the application. The dashboard made it so easy to track my offers and interviews.",
        rating: 5,
        avatar: "https://ui-avatars.com/api/?name=Sara+Ouahabi&background=ff8c6b&color=fff"
    }
];

const Stories = () => {
    return (
        <section id="stories" className="stories-section">
            <div className="stories-container">
                {/* Centered Header matching the Image */}
                <motion.div
                    className="stories-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="stories-title-centered">
                        What Our Students <span className="stories-highlight">Say</span>
                    </h2>
                    <p className="stories-subtitle-centered">
                        It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                    </p>
                </motion.div>

                {/* Grid Layout matching the Image */}
                <div className="stories-grid">
                    {testimonialsData.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className="story-card-v2"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                        >
                            {/* Quote Icon in Circle (Top Right) */}
                            <div className="card-quote-circle">
                                <span className="quote-icon">❝</span>
                            </div>

                            {/* Stars (Top Left) */}
                            <div className="card-stars">
                                {[...Array(item.rating)].map((_, i) => (
                                    <span key={i} className="star-v2">★</span>
                                ))}
                            </div>

                            {/* Comment Text */}
                            <p className="story-comment">{item.comment}</p>

                            {/* Student Profile (Bottom) */}
                            <div className="story-profile">
                                <img src={item.avatar} alt={item.name} className="story-avatar" />
                                <div className="story-info">
                                    <h4 className="story-name">{item.name}</h4>
                                    <p className="story-role">Student</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Ambient Background Glows */}
            <div className="stories-glow-1"></div>
            <div className="stories-glow-2"></div>
        </section>
    );
};

export default Stories;
