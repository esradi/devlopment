import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Calendar as CalendarIcon, Clock, User, Briefcase, Video, 
    MapPin, ChevronLeft, Send, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import { interviewService } from '../../services/api';
import './CompanyInterviews.css'; 

const ScheduleInterview = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!interviewId;

    const [formData, setFormData] = useState({
        student: location.state?.studentId || '',
        studentName: location.state?.studentName || '',
        offer: location.state?.offerId || '',
        offerTitle: location.state?.offerTitle || '',
        application: location.state?.applicationId || '',
        date: '',
        time: '',
        duration: '45',
        method: 'video',
        location: '',
        notes: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const fetchInterview = async () => {
                try {
                    const data = await interviewService.getDetails(interviewId);
                    setFormData({
                        student: data.student || '',
                        offer: data.offer || '',
                        application: data.application || '',
                        date: data.date || '',
                        time: data.time || '',
                        duration: data.duration || '45',
                        method: data.method || 'video',
                        location: data.location || '',
                        notes: data.notes || ''
                    });
                } catch (err) {
                    console.error("Failed to fetch interview details:", err);
                }
            };
            fetchInterview();
        }
    }, [isEdit, interviewId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEdit) {
                await interviewService.update(interviewId, formData);
            } else {
                await interviewService.create(formData);
            }
            setSubmitted(true);
            setTimeout(() => {
                navigate('/dashboard/company/interviews');
            }, 2000);
        } catch (err) {
            console.error("Failed to schedule interview:", err);
            alert("Error scheduling interview.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="company-interviews-dashboard">
                <CompanySidebar activePath="interviews" />
                <main className="interviews-main flex-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="success-state-modern"
                    >
                        <div className="success-icon-wrap">
                            <CheckCircle2 size={48} color="#10b981" />
                        </div>
                        <h2>Interview {isEdit ? 'Updated' : 'Scheduled'}!</h2>
                        <p>The candidate has been notified via email and their dashboard.</p>
                        <div className="redirect-hint">Redirecting to interviews list...</div>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="company-interviews-dashboard">
            <CompanySidebar activePath="interviews" />

            <main className="interviews-main">
                <div className="schedule-container-modern">
                    <button className="back-link-modern" onClick={() => navigate(-1)}>
                        <ChevronLeft size={16} /> Back to Interviews
                    </button>

                    <div className="schedule-header-modern">
                        <h1>{isEdit ? 'Reschedule' : 'Schedule'} Interview</h1>
                        <p>Set up a meeting with your potential future talent.</p>
                    </div>

                    <form className="schedule-form-modern" onSubmit={handleSubmit}>
                        <div className="form-grid-modern">
                            
                            {/* Candidate & Offer */}
                            <div className="form-section-modern">
                                <div className="section-title-wrap">
                                    <User size={18} className="icon-purple" />
                                    <h3>Candidate Details</h3>
                                </div>
                                <div className="input-group-modern">
                                    <label>Candidate</label>
                                    <input 
                                        type="text" 
                                        placeholder="Candidate Name / ID"
                                        value={formData.studentName || formData.student}
                                        onChange={(e) => setFormData({...formData, student: e.target.value})}
                                        required
                                        readOnly={!!location.state?.studentId}
                                    />
                                </div>
                                <div className="input-group-modern">
                                    <label>Applied for Offer</label>
                                    <input 
                                        type="text" 
                                        placeholder="Offer Title / ID"
                                        value={formData.offerTitle || formData.offer}
                                        onChange={(e) => setFormData({...formData, offer: e.target.value})}
                                        required
                                        readOnly={!!location.state?.offerId}
                                    />
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="form-section-modern">
                                <div className="section-title-wrap">
                                    <CalendarIcon size={18} className="icon-pink" />
                                    <h3>Timing</h3>
                                </div>
                                <div className="input-row-modern">
                                    <div className="input-group-modern flex-1">
                                        <label>Date</label>
                                        <input 
                                            type="date" 
                                            value={formData.date}
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="input-group-modern flex-1">
                                        <label>Start Time</label>
                                        <input 
                                            type="time" 
                                            value={formData.time}
                                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="input-group-modern">
                                    <label>Duration</label>
                                    <select 
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    >
                                        <option value="15">15 Minutes</option>
                                        <option value="30">30 Minutes</option>
                                        <option value="45">45 Minutes</option>
                                        <option value="60">1 Hour</option>
                                        <option value="90">1.5 Hours</option>
                                    </select>
                                </div>
                            </div>

                            {/* Location / Meeting Type */}
                            <div className="form-section-modern full-width">
                                <div className="section-title-wrap">
                                    <Video size={18} className="icon-blue" />
                                    <h3>Meeting Details</h3>
                                </div>
                                <div className="type-selector-modern">
                                    <div 
                                        className={`type-option ${formData.type === 'video' ? 'active' : ''}`}
                                        onClick={() => setFormData({...formData, type: 'video'})}
                                    >
                                        <Video size={20} />
                                        <span>Video Call</span>
                                    </div>
                                    <div 
                                        className={`type-option ${formData.type === 'onsite' ? 'active' : ''}`}
                                        onClick={() => setFormData({...formData, type: 'onsite'})}
                                    >
                                        <MapPin size={20} />
                                        <span>On-site Visit</span>
                                    </div>
                                </div>

                                {formData.type === 'onsite' && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="input-group-modern mt-16"
                                    >
                                        <label>Office Address</label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter meeting location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        />
                                    </motion.div>
                                )}
                            </div>

                            {/* Additional Notes */}
                            <div className="form-section-modern full-width">
                                <div className="section-title-wrap">
                                    <AlertCircle size={18} className="icon-yellow" />
                                    <h3>Additional Instructions</h3>
                                </div>
                                <div className="input-group-modern">
                                    <textarea 
                                        placeholder="Add notes for the candidate (agenda, requirements, etc.)"
                                        rows="4"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>

                        </div>

                        <div className="form-actions-modern">
                            <button type="button" className="btn-cancel-modern" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn-submit-modern">
                                <Send size={16} /> {isEdit ? 'Save Changes' : 'Send Invitation'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ScheduleInterview;
