import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Users, Download, 
    CheckCircle2, XCircle, FileText, 
    ExternalLink, Mail, Award, MessageSquare
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyService } from '../../services/api';
import './CompanyCandidates.css';

const CompanyCandidates = ({ userData }) => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const data = await companyService.getOfferApplicants(offerId);
                // Backend usually returns { results: [...] } or just an array
                setApplicants(data?.results || data || []);
            } catch (err) {
                console.error("Failed to fetch applicants:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplicants();
    }, [offerId]);

    const handleStatusAction = async (id, action) => {
        setProcessingId(id);
        try {
            if (action === 'accept') {
                await companyService.acceptApplicant(id);
            } else if (action === 'refuse') {
                await companyService.refuseApplicant(id);
            } else if (action === 'convention') {
                await companyService.generateConvention(id);
            }
            
            // Refresh list
            const data = await companyService.getOfferApplicants(offerId);
            setApplicants(data?.results || data || []);
            
            if (selectedApplicant?.id === id) {
                const updated = (data?.results || data || []).find(a => a.id === id);
                setSelectedApplicant(updated);
            }
        } catch (err) {
            console.error(`Failed to ${action} applicant:`, err);
        } finally {
            setProcessingId(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    if (loading) {
        return <div className="candidates-loading"><div className="custom-loader" /></div>;
    }

    return (
        <div className="company-candidates-page">
            <header className="candidates-header">
                <button className="back-btn" onClick={() => navigate('/dashboard/company/offers')}>
                    <ChevronLeft size={20} /> Retour aux offres
                </button>
                <div className="header-info">
                    <h1>Gestion des Candidats</h1>
                    <p>{applicants.length} candidatures reçues pour cette offre</p>
                </div>
            </header>

            <div className="candidates-layout">
                {/* Candidates List */}
                <motion.div 
                    className="candidates-list"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {applicants?.length > 0 ? applicants.map(app => (
                        <motion.div 
                            key={app.id} 
                            className={`candidate-item ${selectedApplicant?.id === app.id ? 'active' : ''}`}
                            variants={itemVariants}
                            onClick={() => setSelectedApplicant(app)}
                        >
                            <div className="candidate-avatar">
                                <img src={app.student?.profile_picture || `https://ui-avatars.com/api/?name=${app.student?.first_name || 'C'}+${app.student?.last_name || 'A'}&background=9e59ff&color=fff`} alt="" />
                            </div>
                            <div className="candidate-info">
                                <h3>{app.student?.first_name || 'Prénom'} {app.student?.last_name || 'Nom'}</h3>
                                <p>{app.student?.speciality?.name || 'Étudiant'}</p>
                                <div className="match-tag">
                                    <Award size={12} /> {app.match_score || 0}% Match
                                </div>
                            </div>
                            <div className={`status-dot ${app.status || 'pending'}`} title={app.status}></div>
                        </motion.div>
                    )) : (
                        <div className="empty-list">
                            <Users size={40} />
                            <p>Aucun candidat n'a encore postulé.</p>
                        </div>
                    )}
                </motion.div>

                {/* Candidate Detail View */}
                <div className="candidate-detail-view">
                    <AnimatePresence mode="wait">
                        {selectedApplicant ? (
                            <motion.div 
                                key={selectedApplicant.id}
                                className="detail-content"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="detail-header">
                                    <div className="profile-section">
                                        <img className="large-avatar" src={selectedApplicant.student?.profile_picture || `https://ui-avatars.com/api/?name=${selectedApplicant.student?.first_name}+${selectedApplicant.student?.last_name}&background=9e59ff&color=fff`} alt="" />
                                        <div>
                                            <h2>{selectedApplicant.student?.first_name} {selectedApplicant.student?.last_name}</h2>
                                            <p className="university">{selectedApplicant.student?.university || 'Université de Bab Ezzouar'}</p>
                                            <div className="actions-row">
                                                <button className="btn-icon"><Mail size={18} /></button>
                                                <button className="btn-icon"><MessageSquare size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="match-score-radial">
                                        <svg viewBox="0 0 36 36" className="circular-chart">
                                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className="circle" strokeDasharray={`${selectedApplicant.match_score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <text x="18" y="20.35" className="percentage">{selectedApplicant.match_score}%</text>
                                        </svg>
                                        <span>Match AI</span>
                                    </div>
                                </div>

                                <div className="detail-body">
                                    <div className="info-grid">
                                        <div className="info-card">
                                            <h4>Spécialité</h4>
                                            <p>{selectedApplicant.student?.speciality?.name || 'Ingénierie Logicielle'}</p>
                                        </div>
                                        <div className="info-card">
                                            <h4>Niveau</h4>
                                            <p>{selectedApplicant.student?.level || 'Master 2'}</p>
                                        </div>
                                    </div>

                                    <div className="documents-section">
                                        <h3>Documents</h3>
                                        <div className="document-item">
                                            <FileText size={20} />
                                            <div className="doc-info">
                                                <span>Curriculum Vitae</span>
                                                <p>CV_{selectedApplicant.student?.last_name}.pdf</p>
                                            </div>
                                            <button className="download-btn"><Download size={18} /></button>
                                        </div>
                                        {selectedApplicant.student?.portfolio_url && (
                                            <div className="document-item">
                                                <ExternalLink size={20} />
                                                <div className="doc-info">
                                                    <span>Portfolio / LinkedIn</span>
                                                    <p>{selectedApplicant.student?.portfolio_url}</p>
                                                </div>
                                                <a href={selectedApplicant.student?.portfolio_url} target="_blank" rel="noreferrer" className="download-btn">
                                                    <ExternalLink size={18} />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="application-status-controls">
                                        <h3>Décision</h3>
                                        <div className="decision-buttons">
                                            {selectedApplicant.status === 'pending' || selectedApplicant.status === 'under review' ? (
                                                <>
                                                    <button 
                                                        className="btn-refuse"
                                                        disabled={processingId === selectedApplicant.id}
                                                        onClick={() => handleStatusAction(selectedApplicant.id, 'refuse')}
                                                    >
                                                        <XCircle size={18} /> Refuser
                                                    </button>
                                                    <button 
                                                        className="btn-accept"
                                                        disabled={processingId === selectedApplicant.id}
                                                        onClick={() => handleStatusAction(selectedApplicant.id, 'accept')}
                                                    >
                                                        <CheckCircle2 size={18} /> Accepter
                                                    </button>
                                                </>
                                            ) : selectedApplicant.status === 'accepted' ? (
                                                <div className="accepted-flow">
                                                    <div className="status-success">
                                                        <CheckCircle2 size={20} /> Candidat Accepté
                                                    </div>
                                                    {!selectedApplicant.has_convention ? (
                                                        <button 
                                                            className="btn-primary"
                                                            disabled={processingId === selectedApplicant.id}
                                                            onClick={() => handleStatusAction(selectedApplicant.id, 'convention')}
                                                        >
                                                            Générer la Convention
                                                        </button>
                                                    ) : (
                                                        <div className="convention-ready">
                                                            <FileText size={20} /> Convention Générée
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="status-rejected">
                                                    <XCircle size={20} /> Candidature Refusée
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="no-selection">
                                <Users size={60} />
                                <h3>Sélectionnez un candidat</h3>
                                <p>Cliquez sur un candidat dans la liste pour voir son profil détaillé et prendre une décision.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CompanyCandidates;
