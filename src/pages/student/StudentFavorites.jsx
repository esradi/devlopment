import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search,
    Trash2,
    Briefcase,
    MapPin,
    Heart,
    Clock,
    X,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StudentFavorites.css';

const StudentFavorites = ({ recommendations, recentApps, onToggleFavorite, onApply }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    
    // For UI demonstration, we treat all recommendations as favorites, or filter by is_favorite if implemented
    const [favorites, setFavorites] = useState(
        recommendations.map(r => ({ ...r, is_favorite: true }))
    );

    const [toast, setToast] = useState(null);

    const handleRemoveFavorite = (id) => {
        const removedItem = favorites.find(f => f.id === id);
        setFavorites(favorites.filter(f => f.id !== id));
        if (onToggleFavorite) onToggleFavorite(id);
        setToast({
            message: "Offer removed from favorites",
            actionText: "Undo",
            onAction: () => {
                setFavorites(prev => [...prev, removedItem].sort((a,b) => a.id - b.id));
                if (onToggleFavorite) onToggleFavorite(id);
                setToast(null);
            }
        });

        // Hide toast after 5 seconds
        setTimeout(() => setToast(null), 5000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const filteredFavorites = favorites.filter(f => 
        f.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="student-favorites-page">
            <div className="favorites-header">
                <div>
                    <h1>Saved Offers</h1>
                    <p>{favorites.length} saved opportunities</p>
                </div>
                <button 
                    className="btn-clear-all"
                    onClick={() => setFavorites([])}
                >
                    <Trash2 size={16} /> Clear All
                </button>
            </div>

            <div className="favorites-filters">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search saved offers..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="select-wrapper">
                    <select defaultValue="all">
                        <option value="all">All Wilayas</option>
                        <option value="algiers">Algiers</option>
                        <option value="oran">Oran</option>
                    </select>
                </div>
                <div className="select-wrapper">
                    <select defaultValue="all">
                        <option value="all">Offer Type</option>
                        <option value="pfe">PFE</option>
                        <option value="summer">Summer Internship</option>
                    </select>
                </div>
            </div>

            <motion.div 
                className="favorites-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {filteredFavorites.map(offer => (
                        <motion.div 
                            key={offer.id} 
                            className="favorite-card"
                            variants={itemVariants}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        >
                            <div className="card-top-row">
                                <div className="icon-and-tags">
                                    <div className="company-logo-small">
                                        {offer.company_logo ? (
                                            <img src={offer.company_logo} alt="logo"/>
                                        ) : (
                                            <div className="logo-placeholder-small">{offer.company_name?.substring(0,2).toUpperCase()}</div>
                                        )}
                                    </div>
                                    <div className="top-tags">
                                        {offer.offer_types?.[0] && <span className="tag dark">{offer.offer_types[0].name}</span>}
                                        {offer.durations?.[0] && <span className="tag dark">{offer.durations[0].months} MONTHS</span>}
                                    </div>
                                </div>
                                <button className="heart-btn active" onClick={() => handleRemoveFavorite(offer.id)}>
                                    <Heart size={20} fill="#ff1b90" color="#ff1b90" />
                                </button>
                            </div>

                            <div className="card-title-info">
                                <h3>{offer.title}</h3>
                                <div className="company-loc">
                                    <span><Briefcase size={14} /> {offer.company_name}</span>
                                    <span><MapPin size={14} /> {offer.wilaya || 'Remote'}</span>
                                </div>
                            </div>

                            <div className="tech-tags">
                                {(offer.skills || []).slice(0, 3).map((skill, i) => (
                                    <span key={i} className="tech-pill">{skill.name}</span>
                                ))}
                                {(offer.skills || []).length > 3 && (
                                    <span className="tech-pill-more">+{offer.skills.length - 3} others</span>
                                )}
                            </div>

                            <div className="match-score-section">
                                <div className="match-score-header">
                                    <span>MATCH SCORE <Info size={12} style={{marginLeft: 4, color: '#8892b0'}}/></span>
                                    <span className="score-value">{offer.match_score || 85}%</span>
                                </div>
                                <div className="match-bar-bg">
                                    <div 
                                        className="match-bar-fill"
                                        style={{ width: `${offer.match_score || 85}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="card-actions-row">
                                <button className="btn-details-fav" onClick={() => navigate(`/dashboard/student/offer/${offer.id}`)}>Details</button>
                                <button className="btn-apply-fav" disabled={recentApps?.some(a => a.offer === offer.id)} onClick={() => onApply && onApply(offer)}>
                                    {recentApps?.some(a => a.offer === offer.id) ? 'Applied' : 'Apply Now'}
                                </button>
                            </div>

                            <div className="card-bottom">
                                <span><Clock size={12} /> Saved 2 days ago</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {favorites.length === 0 && (
                <div className="empty-state">
                    <Heart size={48} color="#2a2a35" />
                    <h2>No saved offers</h2>
                    <p>When you favorite an offer, it will appear here.</p>
                </div>
            )}

            <div className="load-more-container">
                <button className="btn-load-more">
                    ↓<br/>LOAD MORE
                </button>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        className="toast-notification"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        <div className="toast-icon">i</div>
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-action" onClick={toast.onAction}>{toast.actionText}</button>
                        <button className="toast-close" onClick={() => setToast(null)}><X size={16} /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentFavorites;
