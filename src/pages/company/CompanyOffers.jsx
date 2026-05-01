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
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
        return (
            <div className="company-offers-loading" style={{
                height: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="custom-loader" style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(158, 89, 255, 0.1)',
                    borderTop: '3px solid #9e59ff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '15px', color: '#8b92a5', fontSize: '14px' }}>Fetching offers...</p>
            </div>
        );
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
                {filteredOffers.length > 0 ? filteredOffers.map(offer => (
                    <motion.div key={offer.id} className="offer-card-horizontal" variants={itemVariants}>
                        <div className="offer-card-left">
                            <div className="offer-title-row">
                                <h3>{offer.title}</h3>
                                <span className={`status-badge-modern ${offer.status?.toLowerCase()}`}>
                                    {offer.status === 'active' && <span className="dot-active"></span>}
                                    {offer.status?.toUpperCase()}
                                </span>
                            </div>

                            <div className="offer-tags-modern">
                                {offer.offer_types?.map((t, idx) => (
                                    <span key={`type-${idx}`} className="tag-pill tag-pink">
                                        {t.name}
                                    </span>
                                ))}
                                {offer.durations?.map((d, idx) => (
                                    <span key={`dur-${idx}`} className="tag-pill">
                                        {d.months} Months
                                    </span>
                                ))}
                            </div>

                            {offer.status === 'draft' ? (
                                <p className="draft-meta">Last edited {new Date(offer.updated_at).toLocaleDateString()}</p>
                            ) : (
                                <div className="offer-stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-label">CANDIDATES</span>
                                        <span className="stat-value">{offer.applicants_count || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">AVG. MATCH</span>
                                        <span className="stat-value text-pink">{offer.avg_match_score || 0}%</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">POSTED</span>
                                        <span className="stat-value">{new Date(offer.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="offer-card-right">
                            <button
                                className="btn-view-candidates"
                                onClick={() => navigate(`/dashboard/company/offer/${offer.id}/candidates`)}
                            >
                                {offer.status === 'draft' ? 'Publish Offer' : 'View Candidates'}
                            </button>
                            <div className="icon-actions">
                                <button
                                    className="icon-btn"
                                    onClick={() => navigate(`/dashboard/company/offer/${offer.id}/edit`)}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button className="icon-btn">
                                    {offer.status === 'DRAFT' ? <Trash2 size={16} /> : <MoreVertical size={16} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="empty-state-large">
                        <p>No offers found. Start by creating your first listing!</p>
                    </div>
                )}
            </motion.div>

            <div className="pagination-footer">
                <span className="showing-text">
                    Showing <strong>{filteredOffers.length}</strong> of <strong>{offers.length}</strong> offers
                </span>
                {offers.length > 0 && (
                    <div className="pagination-controls">
                        <button className="page-btn">{'<'}</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">{'>'}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyOffers;

