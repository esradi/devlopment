import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Send, Sparkles, 
    Target, MapPin, Clock, 
    Briefcase, Code, Plus, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services/api';
import './CreateOffer.css';

const CreateOffer = () => {
    const navigate = useNavigate();
    const [options, setOptions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        wilaya: '',
        salary: '',
        requirements: '',
        domain_ids: [],
        location_ids: [],
        offer_type_ids: [],
        duration_ids: [],
        skill_ids: []
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const data = await companyService.getOfferOptions();
                setOptions(data);
            } catch (err) {
                console.error("Failed to fetch offer options:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOptions();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleSelection = (field, id) => {
        setFormData(prev => {
            const current = prev[field];
            if (current.includes(id)) {
                return { ...prev, [field]: current.filter(i => i !== id) };
            } else {
                return { ...prev, [field]: [...current, id] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await companyService.createOffer(formData);
            navigate('/dashboard/company/offers');
        } catch (err) {
            console.error("Failed to create offer:", err);
            alert("Erreur lors de la création de l'offre. Veuillez vérifier les champs.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="create-offer-loading"><div className="custom-loader" /></div>;
    }

    return (
        <div className="create-offer-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/dashboard/company/offers')}>
                    <ChevronLeft size={20} /> Retour
                </button>
                <div className="title-area">
                    <h1>Publier une Offre</h1>
                    <p>Définissez les critères de votre futur stagiaire d'élite.</p>
                </div>
            </header>

            <form className="offer-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    {/* Left Column: Core Info */}
                    <div className="form-section main-info">
                        <h2><Briefcase size={20} /> Informations de l'offre</h2>
                        
                        <div className="input-group">
                            <label>Titre du poste</label>
                            <input 
                                type="text" 
                                name="title"
                                placeholder="ex: Développeur Fullstack React/Node" 
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Description du stage</label>
                            <textarea 
                                name="description"
                                placeholder="Décrivez les missions et l'environnement de travail..." 
                                rows="8"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label><MapPin size={16} /> Wilaya</label>
                                <input 
                                    type="text" 
                                    name="wilaya"
                                    placeholder="ex: Alger" 
                                    value={formData.wilaya}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-group">
                                <label><Sparkles size={16} /> Salaire (optionnel)</label>
                                <input 
                                    type="text" 
                                    name="salary"
                                    placeholder="ex: 30,000 DZD" 
                                    value={formData.salary}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Conditions & Prérequis</label>
                            <textarea 
                                name="requirements"
                                placeholder="Exigences spécifiques, matériel fourni, etc." 
                                rows="4"
                                value={formData.requirements}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>
                    </div>

                    {/* Right Column: Classifications & Skills */}
                    <div className="form-section selectors">
                        <h2><Target size={20} /> Critères de Matching</h2>
                        
                        {/* Domains */}
                        <div className="selector-group">
                            <label>Domaines d'activité</label>
                            <div className="chip-cloud">
                                {options?.domains?.map(domain => (
                                    <button 
                                        type="button"
                                        key={domain.id}
                                        className={`chip ${formData.domain_ids.includes(domain.id) ? 'active' : ''}`}
                                        onClick={() => toggleSelection('domain_ids', domain.id)}
                                    >
                                        {domain.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Types */}
                        <div className="selector-group">
                            <label>Type de stage</label>
                            <div className="chip-cloud">
                                {options?.offer_types?.map(type => (
                                    <button 
                                        type="button"
                                        key={type.id}
                                        className={`chip ${formData.offer_type_ids.includes(type.id) ? 'active' : ''}`}
                                        onClick={() => toggleSelection('offer_type_ids', type.id)}
                                    >
                                        {type.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Durations */}
                        <div className="selector-group">
                            <label>Durées souhaitées</label>
                            <div className="chip-cloud">
                                {options?.durations?.map(dur => (
                                    <button 
                                        type="button"
                                        key={dur.id}
                                        className={`chip ${formData.duration_ids.includes(dur.id) ? 'active' : ''}`}
                                        onClick={() => toggleSelection('duration_ids', dur.id)}
                                    >
                                        {dur.months} Mois
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Locations */}
                        <div className="selector-group">
                            <label>Type de présence</label>
                            <div className="chip-cloud">
                                {options?.locations?.map(loc => (
                                    <button 
                                        type="button"
                                        key={loc.id}
                                        className={`chip ${formData.location_ids.includes(loc.id) ? 'active' : ''}`}
                                        onClick={() => toggleSelection('location_ids', loc.id)}
                                    >
                                        {loc.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="selector-group">
                            <label><Code size={16} /> Compétences requises</label>
                            <div className="chip-cloud scrollable">
                                {options?.skills?.map(skill => (
                                    <button 
                                        type="button"
                                        key={skill.id}
                                        className={`chip skill-chip ${formData.skill_ids.includes(skill.id) ? 'active' : ''}`}
                                        onClick={() => toggleSelection('skill_ids', skill.id)}
                                    >
                                        {skill.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard/company/offers')}>
                        Annuler
                    </button>
                    <button type="submit" className="btn-submit" disabled={submitting}>
                        {submitting ? 'Publication...' : <><Send size={18} /> Publier l'offre</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateOffer;
