import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Send, Sparkles, 
    Target, MapPin, Clock, 
    Briefcase, Code, FileText, CheckCircle2
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
            alert("Error creating the offer. Please check the input fields.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="create-offer-loading"><div className="custom-loader" /></div>;
    }

    return (
        <div className="create-offer-modern">
            <header className="co-header">
                <button className="co-back-btn" onClick={() => navigate('/dashboard/company/offers')}>
                    <ChevronLeft size={18} /> Back to offers
                </button>
                <div className="co-title-wrapper">
                    <h1>Post an <span className="co-text-pink">Offer</span></h1>
                    <p>Define the perfect criteria to find your future talent.</p>
                </div>
            </header>

            <form className="co-form-container" onSubmit={handleSubmit}>
                
                {/* Section 1: Informations Principales */}
                <motion.div className="co-form-card" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}}>
                    <div className="co-card-header">
                        <div className="co-icon-box pink"><Briefcase size={20} /></div>
                        <h2>Main Information</h2>
                    </div>
                    <div className="co-card-body">
                        <div className="co-input-group full-width">
                            <label>Job Title <span className="co-required">*</span></label>
                            <input 
                                type="text" 
                                name="title"
                                placeholder="e.g., Fullstack React/Node Developer" 
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="co-input-group full-width">
                            <label>Internship Description <span className="co-required">*</span></label>
                            <textarea 
                                name="description"
                                placeholder="Describe the main missions, responsibilities, and work environment..." 
                                rows="6"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="co-input-group full-width">
                            <label>Conditions & Requirements</label>
                            <textarea 
                                name="requirements"
                                placeholder="Specific requirements, required equipment, perks..." 
                                rows="3"
                                value={formData.requirements}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Section 2: Détails Logistiques */}
                <motion.div className="co-form-card" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}}>
                    <div className="co-card-header">
                        <div className="co-icon-box purple"><MapPin size={20} /></div>
                        <h2>Logistical Details</h2>
                    </div>
                    <div className="co-card-body co-grid-2">
                        <div className="co-input-group">
                            <label>Location / Wilaya</label>
                            <div className="co-input-with-icon">
                                <MapPin size={18} className="co-input-icon" />
                                <input 
                                    type="text" 
                                    name="wilaya"
                                    placeholder="e.g., Algiers, Remote..." 
                                    value={formData.wilaya}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="co-input-group">
                            <label>Compensation (Optional)</label>
                            <div className="co-input-with-icon">
                                <Sparkles size={18} className="co-input-icon" />
                                <input 
                                    type="text" 
                                    name="salary"
                                    placeholder="e.g., 30,000 DZD / month" 
                                    value={formData.salary}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="co-selector-group full-width">
                            <label>Work Mode</label>
                            <div className="co-chip-cloud">
                                {options?.locations?.map(loc => (
                                    <button 
                                        type="button"
                                        key={loc.id}
                                        className={`co-chip ${formData.location_ids.includes(loc.id) ? 'active' : ''}`}
                                        onClick={() => toggleSelection('location_ids', loc.id)}
                                    >
                                        <CheckCircle2 size={14} className="co-check-icon" />
                                        {loc.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Section 3: Critères de Matching */}
                <motion.div className="co-form-card" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.3}}>
                    <div className="co-card-header">
                        <div className="co-icon-box teal"><Target size={20} /></div>
                        <h2>Matching Criteria (Algorithm)</h2>
                    </div>
                    <div className="co-card-body">
                        
                        <div className="co-grid-2">
                            <div className="co-selector-group">
                                <label>Activity Domains</label>
                                <div className="co-chip-cloud">
                                    {options?.domains?.map(domain => (
                                        <button 
                                            type="button"
                                            key={domain.id}
                                            className={`co-chip ${formData.domain_ids.includes(domain.id) ? 'active' : ''}`}
                                            onClick={() => toggleSelection('domain_ids', domain.id)}
                                        >
                                            {domain.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="co-selector-group">
                                <label>Internship Type</label>
                                <div className="co-chip-cloud">
                                    {options?.offer_types?.map(type => (
                                        <button 
                                            type="button"
                                            key={type.id}
                                            className={`co-chip ${formData.offer_type_ids.includes(type.id) ? 'active' : ''}`}
                                            onClick={() => toggleSelection('offer_type_ids', type.id)}
                                        >
                                            {type.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="co-selector-group mt-4">
                            <label>Desired Duration</label>
                            <div className="co-chip-cloud">
                                {options?.durations?.map(dur => (
                                    <button 
                                        type="button"
                                        key={dur.id}
                                        className={`co-chip ${formData.duration_ids.includes(dur.id) ? 'active' : ''}`}
                                        onClick={() => toggleSelection('duration_ids', dur.id)}
                                    >
                                        {dur.months} Months
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="co-selector-group mt-4">
                            <label className="co-pink-label"><Code size={16} /> Technical Skills</label>
                            <div className="co-chip-cloud scrollable">
                                {options?.skills?.map(skill => (
                                    <button 
                                        type="button"
                                        key={skill.id}
                                        className={`co-chip skill-chip ${formData.skill_ids.includes(skill.id) ? 'active' : ''}`}
                                        onClick={() => toggleSelection('skill_ids', skill.id)}
                                    >
                                        {skill.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* Footer Actions */}
                <div className="co-form-actions">
                    <button type="button" className="co-btn-cancel" onClick={() => navigate('/dashboard/company/offers')}>
                        Cancel
                    </button>
                    <button type="submit" className="co-btn-submit" disabled={submitting}>
                        {submitting ? 'Publishing...' : <><Send size={18} /> Publish New Offer</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateOffer;
