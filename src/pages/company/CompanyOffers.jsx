import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ChevronDown, Edit2, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services/api';
import './CompanyOffers.css';

const CompanyOffers = ({ userData }) => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');

useEffect(() => {
    const fetchOffers = async () => {
        try {
            const data = await companyService.getMineOffers();
            let fetchedOffers = data?.results || data || [];

            // Map API fields to component fields
            fetchedOffers = fetchedOffers.map(offer => ({
                id: offer.id,
                title: offer.title,
                status: offer.status?.toUpperCase() || 'ACTIVE', // normalize to uppercase
                tags: [
                    ...(offer.offer_types?.map(t => t.name) || []),
                    ...(offer.durations?.map(d => `${d.months} Months`) || []),
                    ...(offer.skills?.map(s => s.name) || []),
                ],
                candidates: offer.applications_count || 0,
                avg_match: offer.avg_match_score || 0,
                posted: offer.created_at
                    ? new Date(offer.created_at).toLocaleDateString()
                    : 'N/A',
                last_edited: offer.updated_at
                    ? new Date(offer.updated_at).toLocaleDateString()
                    : 'N/A',
            }));

            setOffers(fetchedOffers);
        } catch (err) {
            console.error("Failed to fetch company offers:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchOffers();
}, []);

    const filteredOffers = offers.filter(offer => 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return <div className="company-offers-loading" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="custom-loader" /></div>;
    }

    return (
        <div className="company-offers-page modern-dark">
            <header className="offers-header-modern">
                <div className="title-section">
                    <h1>My <span className="text-pink">Offers</span></h1>
                    <p>Manage your recruitment pipeline and active internship listings.</p>
                </div>
                <div className="header-actions-modern">
                    <div className="search-bar-modern">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Search offers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary-pink" onClick={() => navigate('/dashboard/company/offer/create')}>
                        <Plus size={18} /> Post an Offer
                    </button>
                </div>
            </header>

            <div className="filters-row-modern">
                <div className="tabs-group">
                    {['All', 'Active', 'Draft', 'Closed'].map(tab => (
                        <button 
                            key={tab} 
                            className={`filter-tab-pill ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="dropdowns-group">
                    <button className="btn-dropdown">TYPE <ChevronDown size={14} /></button>
                    <button className="btn-dropdown">LOCATION <ChevronDown size={14} /></button>
                </div>
            </div>

            <motion.div className="offers-list-modern" variants={containerVariants} initial="hidden" animate="visible">
                {filteredOffers.map(offer => (
                    <motion.div key={offer.id} className="offer-card-horizontal" variants={itemVariants}>
                        <div className="offer-card-left">
                            <div className="offer-title-row">
                                <h3>{offer.title}</h3>
                                <span className={`status-badge-modern ${offer.status.toLowerCase()}`}>
                                    {offer.status === 'ACTIVE' && <span className="dot-active"></span>}
                                    {offer.status}
                                </span>
                            </div>
                            
                            <div className="offer-tags-modern">
                                {offer.tags && offer.tags.map((tag, idx) => (
                                    <span key={idx} className={`tag-pill ${['Python', 'TensorFlow', 'React', 'Tailwind CSS'].includes(tag) ? 'tag-pink' : ''}`}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {offer.status === 'DRAFT' ? (
                                <p className="draft-meta">Last edited {offer.last_edited}</p>
                            ) : (
                                <div className="offer-stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-label">CANDIDATES</span>
                                        <span className="stat-value">{offer.candidates}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">AVG. MATCH</span>
                                        <span className="stat-value text-pink">{offer.avg_match}%</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">POSTED</span>
                                        <span className="stat-value">{offer.posted}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="offer-card-right">
                            <button 
                                className="btn-view-candidates"
                                onClick={() => navigate(`/dashboard/company/offer/${offer.id}/candidates`)}
                            >
                                {offer.status === 'DRAFT' ? 'Publish Offer' : 'View Candidates'}
                            </button>
                            <div className="icon-actions">
                                <button className="icon-btn"><Edit2 size={16} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="pagination-footer">
                <span className="showing-text">Showing <strong>3 of 12</strong> offers</span>
                <div className="pagination-controls">
                    <button className="page-btn">{'<'}</button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <button className="page-btn">{'>'}</button>
                </div>
            </div>
        </div>
    );
};

export default CompanyOffers;

