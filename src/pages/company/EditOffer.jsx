import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Send, Sparkles, 
    Target, MapPin, Clock, 
    Briefcase, Code, FileText, CheckCircle2, Save
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { companyService } from '../../services/api';
import './CreateOffer.css'; // Reuse CreateOffer styles

const EditOffer = () => {
    const navigate = useNavigate();
    const { offerId } = useParams();
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
        const fetchData = async () => {
            try {
                // Fetch options and offer simultaneously
                const [opts, offerData] = await Promise.all([
                    companyService.getOfferOptions(),
                    companyService.getOfferDetails(offerId)
                ]);
                
                setOptions(opts);
                
                // Map the nested objects/IDs from the backend to the flat form structure
                setFormData({
                    title: offerData.title || '',
                    description: offerData.description || '',
                    wilaya: offerData.wilaya || '',
                    salary: offerData.salary || '',
                    requirements: offerData.requirements || '',
                    domain_ids: offerData.domains?.map(d => d.id) || [],
                    location_ids: offerData.locations?.map(l => l.id) || [],
                    offer_type_ids: offerData.offer_types?.map(t => t.id) || [],
                    duration_ids: offerData.durations?.map(d => d.id) || [],
                    skill_ids: offerData.skills?.map(s => s.id) || []
                });
                
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [offerId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleSelection = (field, id) => {
        setFormData(prev => {
            const current = prev[field] || [];
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
            await companyService.updateOffer(offerId, formData);
            alert("Offer updated successfully!");
            navigate('/dashboard/company/offers');
        } catch (err) {
            console.error("Failed to update offer:", err);
            alert("Error updating the offer.");
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
                    <ChevronLeft size={18} /> Back to dashboard
                </button>
                <div className="co-title-wrapper">
                    <h1>Edit <span className="co-text-pink">Offer</span></h1>
                    <p>Modify the details for offer ID: #{offerId}</p>
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
                                placeholder="Describe the main missions..." 
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
                                placeholder="Specific requirements..." 
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
                            <label>Compensation</label>
                            <div className="co-input-with-icon">
                                <Sparkles size={18} className="co-input-icon" />
                                <input 
                                    type="text" 
                                    name="salary"
                                    placeholder="e.g., 30,000 DZD" 
                                    value={formData.salary}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Section 3: Criteria & Skills */}
                <motion.div className="co-form-card" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.3}}>
                    <div className="co-card-header">
                        <div className="co-icon-box teal"><Target size={20} /></div>
                        <h2>Matching Criteria</h2>
                    </div>
                    <div className="co-card-body">
                         <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Select skills and domains to refine the matching algorithm.</p>
                         <div className="co-selector-group">
                            <label className="co-pink-label"><Code size={16} /> Technical Skills</label>
                            <div className="co-chip-cloud">
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
                    <button type="button" className="co-btn-cancel" onClick={() => navigate('/dashboard/company')}>
                        Cancel
                    </button>
                    <button type="submit" className="co-btn-submit" disabled={submitting} style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}>
                        {submitting ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditOffer;
