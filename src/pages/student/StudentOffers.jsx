import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Bell,
    MapPin,
    Code,
    Layers,
    RotateCcw,
    Heart,
    Info,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { offerService } from '../../services/api';
import './StudentOffers.css';

const StudentOffers = ({ userData, recommendations, recentApps, handleMatchHover, hoveredMatch, matchBreakdown, onApply, onToggleFavorite, showToast }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [viewMode, setViewMode] = useState('recommended'); // 'recommended' | 'all'
    const [allOffers, setAllOffers] = useState([]);
    
    // Advanced Filters State
    const [filters, setFilters] = useState({
        domain: 'all',
        duration: 'all',
        remun: 'all',
        telework: 'all',
        city: 'all'
    });
    
    const handleReset = () => {
        setSearchTerm('');
        setFilters({ domain: 'all', duration: 'all', remun: 'all', telework: 'all', city: 'all' });
    };

    useEffect(() => {
        const fetchAllOffers = async () => {
            try {
                const data = await offerService.getOffers();
                setAllOffers(data?.results || data || []);
            } catch (error) {
                console.error("Failed to fetch all offers:", error);
            }
        };
        fetchAllOffers();
    }, []);

    // Filter recommendations or all offers by search term locally for immediate feedback
    const baseSource = viewMode === 'recommended' ? recommendations : allOffers;
    const filteredOffers = baseSource.filter(offer => 
        (offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || 
        (offer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setTimeout(() => setIsLoadingMore(false), 1000); // Mock load
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

    return (
        <div className="student-offers-page">
            {/* Header */}
            <header className="offers-header">
                <div className="offers-header-content">
                    <div>
                        <h1>Available Internship Offers</h1>
                        <p>{baseSource.length} {viewMode === 'recommended' ? 'recommended' : ''} offers available</p>
                    </div>
                    <div className="offers-header-actions">
                        <div className="search-bar">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search for title, company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && showToast) showToast(`Searching for "${e.target.value}"...`);
                                }}
                            />
                        </div>
                        <button className="icon-btn" onClick={() => showToast && showToast("No new notifications")}>
                            <Bell size={20} />
                        </button>
                        <div className="avatar-wrapper small">
                            <img src={userData?.profile?.profile_picture || `https://ui-avatars.com/api/?name=${userData?.first_name}+${userData?.last_name}&background=9e59ff&color=fff`} alt="Profile" className="user-avatar" />
                        </div>
                    </div>
                </div>

                {/* Scope Toggles */}
                <div className="offers-scope-toggles" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                        className={`filter-tab ${viewMode === 'recommended' ? 'active' : ''}`}
                        onClick={() => setViewMode('recommended')}
                    >
                        Recommended for You ({recommendations.length})
                    </button>
                    <button 
                        className={`filter-tab ${viewMode === 'all' ? 'active' : ''}`}
                        onClick={() => setViewMode('all')}
                    >
                        Explore All Offers ({allOffers.length})
                    </button>
                </div>

                {/* Filters */}
                <div className="filters-row advanced-filters">
                    <select value={filters.domain} onChange={e => setFilters({...filters, domain: e.target.value})}>
                        <option value="all">Secteur: All</option>
                        <option value="dev">Software Engineering</option>
                        <option value="design">UI/UX Design</option>
                        <option value="data">Data Science</option>
                    </select>

                    <select value={filters.duration} onChange={e => setFilters({...filters, duration: e.target.value})}>
                        <option value="all">Durée: All</option>
                        <option value="3m">1 - 3 Mois</option>
                        <option value="6m">4 - 6 Mois</option>
                        <option value="12m">12+ Mois</option>
                    </select>

                    <select value={filters.remun} onChange={e => setFilters({...filters, remun: e.target.value})}>
                        <option value="all">Rémunération: All</option>
                        <option value="paid">Rémunéré (Paid)</option>
                        <option value="unpaid">Non Rémunéré</option>
                    </select>

                    <select value={filters.telework} onChange={e => setFilters({...filters, telework: e.target.value})}>
                        <option value="all">Télétravail: All</option>
                        <option value="remote">100% Remote</option>
                        <option value="hybrid">Hybride</option>
                        <option value="onsite">Sur Site</option>
                    </select>

                    <select value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})}>
                        <option value="all">Ville: All</option>
                        <option value="algiers">Alger</option>
                        <option value="oran">Oran</option>
                        <option value="setif">Sétif</option>
                    </select>

                    <button className="reset-btn" onClick={handleReset}>
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>
            </header>

            {/* Offers Grid */}
            <motion.div
                className="offers-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {filteredOffers.map((offer) => (
                    <motion.div key={offer.id} className="offer-card-detailed" variants={itemVariants}>
                        <div className="card-top">
                            <div className="company-logo">
                                {offer.company_logo ? (
                                    <img src={offer.company_logo} alt={offer.company_name} style={{ width: '30px' }} />
                                ) : (
                                    <div className="logo-placeholder" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                        {offer.company_name?.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="card-title-area">
                                <h3>{offer.title}</h3>
                                <p>{offer.company_name} — {offer.wilaya || 'Algeria'}</p>
                            </div>
                            <Heart 
                                size={20} 
                                className="favorite-icon standalone" 
                                onClick={() => onToggleFavorite && onToggleFavorite(offer.id)}
                                style={{ color: offer.is_favorite ? '#ff1b90' : '#8892b0', cursor: 'pointer', transition: 'transform 0.2s', transform: offer.is_favorite ? 'scale(1.1)' : 'scale(1)' }} 
                            />
                        </div>
                        
                        <div className="card-body">
                            <p className="offer-description" dangerouslySetInnerHTML={{ __html: offer.description?.substring(0, 150) + '...' }}></p>
                        </div>
                        
                        <div className="card-tags">
                            {offer.offer_types?.map((type, i) => (
                                <span key={i} className={`tag ${i === 0 ? 'pfe' : 'intern'}`}>{type.name}</span>
                            ))}
                            {offer.durations?.map((d, i) => (
                                <span key={`d-${i}`} className="tag intern">{d.months} months</span>
                            ))}
                            {/* AI Match */}
                            <span className="tag match-score" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                {offer.match_score > 0 ? `${offer.match_score}% Match` : 'Unscored'}
                            </span>
                        </div>

                        <div className="card-footer">
                            <span className="posted-date">Posted 2 days ago</span>
                            <div className="card-actions">
                                <button className="btn-details" onClick={() => navigate(`/dashboard/student/offer/${offer.id}`)}>View details</button>
                                <button className="btn-apply" disabled={recentApps?.some(a => a.offer === offer.id)} onClick={() => onApply && onApply(offer)}>
                                    {recentApps?.some(a => a.offer === offer.id) ? 'Applied' : 'Apply'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
            
            <div className="archived-offers">
                <p>You've seen all the latest offers from the last 30 days.</p>
                <button className="load-more-btn" onClick={handleLoadMore} disabled={isLoadingMore}>
                    {isLoadingMore ? 'Loading...' : 'Load archived offers'}
                    {!isLoadingMore && <motion.span className="chevron">⌄</motion.span>}
                </button>
            </div>
        </div>
    );
};

export default StudentOffers;
