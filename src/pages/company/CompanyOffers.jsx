import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Eye, Users, ChevronRight, CheckCircle2, Clock, XOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services/api';
import './CompanyOffers.css';

const CompanyOffers = ({ userData }) => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const data = await companyService.getMineOffers();
                // Depending on pagination, data might be {results: []} or just []
                setOffers(data?.results || data || []);
            } catch (err) {
                console.error("Failed to fetch company offers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    const filteredOffers = (Array.isArray(offers) ? offers : []).filter(offer => 
        offer?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        offer?.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status) => {
        switch(status) {
            case 'active': return <CheckCircle2 size={16} />;
            case 'pending': return <Clock size={16} />;
            case 'inactive': return <XOctagon size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return <div className="company-offers-loading"><div className="custom-loader" /></div>;
    }

    return (
        <div className="company-offers-page">
            <header className="offers-header">
                <div>
                    <h1>Mes Offres</h1>
                    <p>Gérez vos offres de stage et attirez les meilleurs talents.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher une offre..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/dashboard/company/offer/create')}>
                        <Plus size={18} /> Nouvelle Offre
                    </button>
                </div>
            </header>

            <motion.div className="offers-grid" variants={containerVariants} initial="hidden" animate="visible">
                {filteredOffers.length > 0 ? filteredOffers.map(offer => (
                    <motion.div key={offer.id} className="company-offer-card" variants={itemVariants}>
                        <div className="card-top-content">
                            <div className="offer-title-row">
                                <h3>{offer.title}</h3>
                                <span className={`status-badge ${offer.status}`}>
                                    {getStatusIcon(offer.status)} {offer.status}
                                </span>
                            </div>
                            
                            <div className="offer-meta">
                                <span><MapPin size={14} /> {offer.wilaya || 'Alger, Algérie'}</span>
                                {offer.durations && Array.isArray(offer.durations) && offer.durations[0] && (
                                    <span><Clock size={14} /> {offer.durations[0].months} Mois</span>
                                )}
                            </div>

                            <p className="offer-excerpt">
                                {offer.description ? offer.description.substring(0, 120) + '...' : 'Aucune description fournie.'}
                            </p>
                        </div>

                        <div className="card-bottom-content">
                            <div className="offer-stats">
                                <div className="stat">
                                    <Eye size={18} />
                                    <span>{offer.views_count || 0} vues</span>
                                </div>
                                <div className="stat">
                                    <Users size={18} />
                                    <span>{offer.application_count || 0} postulants</span>
                                </div>
                            </div>
                            <button 
                                className="btn-manage"
                                onClick={() => navigate(`/dashboard/company/offer/${offer.id}/candidates`)}
                            >
                                Gérer les candidats <ChevronRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                )) : (
                    <div className="empty-state">
                        <div className="empty-icon"><Plus size={48} /></div>
                        <h3>Aucune offre trouvée</h3>
                        <p>Vous n'avez pas encore publié d'offres ou aucune offre ne correspond à votre recherche.</p>
                        <button className="btn-primary" onClick={() => navigate('/dashboard/company/offer/create')}>
                            Créer ma première offre
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CompanyOffers;
