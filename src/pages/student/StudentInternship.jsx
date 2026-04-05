import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    FileText, 
    CheckCircle, 
    Clock, 
    BookOpen, 
    Download, 
    ChevronRight,
    Plus,
    History,
    FileSignature,
    ClipboardCheck,
    X,
    Star
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import './StudentInternship.css';

const StudentInternship = ({ userData }) => {
    const [logEntries, setLogEntries] = useState([
        { id: 1, week: 'Week 1', date: '21 Oct - 25 Oct', task: 'Introduction to Cloud Architecture & Kubernetes setup.', status: 'Completed' },
        { id: 2, week: 'Week 2', date: '28 Oct - 01 Nov', task: 'Deploying microservices to the staging cluster.', status: 'In Progress' }
    ]);
    const [newLog, setNewLog] = useState('');
    const [showEvaluation, setShowEvaluation] = useState(false);

    const handleAddLog = () => {
        if (!newLog.trim()) return;
        const nextWeek = logEntries.length + 1;
        setLogEntries([...logEntries, {
            id: Date.now(),
            week: `Week ${nextWeek}`,
            date: 'Just now',
            task: newLog,
            status: 'In Progress'
        }]);
        setNewLog('');
    };

    const handleGenerateAgreement = () => {
        const element = document.createElement('div');
        element.style.cssText = 'padding: 40px; font-family: sans-serif; color: #333; background: #fff;';
        element.innerHTML = `
            <div style="background: #fff;">
                <h1 style="text-align: center; color: #111;">CONVENTION DE STAGE</h1>
                <p style="text-align: center; color: #666;">Stag.io / ${new Date().getFullYear()}</p>
                <hr style="margin: 30px 0; border: 1px solid #eee;"/>
                <div style="margin-bottom: 20px;">
                    <h3>ENTRE LES SOUSSIGNÉS :</h3>
                    <p><b>L'Établissement :</b> École Supérieure d'Informatique (ESI)</p>
                    <p><b>L'Entreprise :</b> Sonatrach - Division Cloud</p>
                    <p><b>Le Stagiaire :</b> ${userData?.first_name || 'Amine'} ${userData?.last_name || 'Benali'}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <h3>ARTICLE 1 : OBJET</h3>
                    <p>La présente convention règle les rapports du stagiaire avec l'entreprise d'accueil dans le cadre de son cursus pédagogique.</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <h3>ARTICLE 2 : DURÉE ET MODALITÉS</h3>
                    <p>Le stage se déroule du 20/10/2026 au 20/04/2027.</p>
                </div>
                <div style="margin-top: 80px; display: flex; justify-content: space-between;">
                    <div style="text-align: center;">Signature Étudiant<br/><br/>______________</div>
                    <div style="text-align: center;">Cachet École<br/><br/>______________</div>
                    <div style="text-align: center;">Cachet Entreprise<br/><br/>______________</div>
                </div>
            </div>
        `;
        
        const opt = {
            margin: 10,
            filename: 'Convention-Stage-ESI.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="internship-page">
            <header className="internship-header">
                <div className="ih-main">
                    <h1>Active Internship Tracking</h1>
                    <p>Ongoing at <strong>Sonatrach Cloud Lab</strong> • 1 month remaining</p>
                </div>
                <div className="ih-actions">
                    <button className="btn-agreement" onClick={handleGenerateAgreement}>
                        <FileSignature size={18} /> Convention de Stage (PDF)
                    </button>
                    {!showEvaluation && (
                        <button className="btn-primary" onClick={() => setShowEvaluation(true)}>
                            <ClipboardCheck size={18} /> Finish & Evaluate
                        </button>
                    )}
                </div>
            </header>

            <div className="internship-grid">
                <div className="internship-main">
                    {/* Logbook Section */}
                    <section className="intern-section card">
                        <div className="section-header">
                            <div className="sh-title">
                                <BookOpen size={20} className="icon-purple" />
                                <h2>Journal de Bord (Weekly Log)</h2>
                            </div>
                            <span className="log-count">{logEntries.length} entries</span>
                        </div>
                        
                        <div className="log-input-area">
                            <textarea 
                                placeholder="Avez-vous réalisé des tâches cette semaine ?" 
                                value={newLog}
                                onChange={(e) => setNewLog(e.target.value)}
                            />
                            <button onClick={handleAddLog} disabled={!newLog.trim()}>
                                <Plus size={16} /> Log Activity
                            </button>
                        </div>

                        <div className="log-timeline">
                            {logEntries.slice().reverse().map((log) => (
                                <motion.div 
                                    key={log.id} 
                                    className={`log-item ${log.status === 'Completed' ? 'done' : ''}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <div className="log-meta">
                                        <div className="log-dot">
                                            {log.status === 'Completed' ? <CheckCircle size={12} stroke="#10b981" fill="#10b981" /> : <Clock size={12} stroke="#fbbf24" />}
                                        </div>
                                        <div className="log-line"></div>
                                    </div>
                                    <div className="log-content">
                                        <div className="log-header">
                                            <h4>{log.week}</h4>
                                            <span className="log-date">{log.date}</span>
                                        </div>
                                        <p>{log.task}</p>
                                        <span className={`status-badge-intern ${log.status.toLowerCase().replace(' ', '-')}`}>
                                            {log.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="internship-sidebar">
                    <div className="intern-section card glass info-card">
                        <h3>Détails du Stage</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <label>Supervisor</label>
                                <span>Kacem Slimani</span>
                            </div>
                            <div className="info-item">
                                <label>Department</label>
                                <span>Software Infrastructure</span>
                            </div>
                            <div className="info-item">
                                <label>Duration</label>
                                <span>6 Months (Full-time)</span>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showEvaluation && (
                            <motion.div 
                                className="intern-section card evaluation-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <div className="section-header">
                                    <h3>Final Evaluation</h3>
                                    <X size={16} onClick={() => setShowEvaluation(false)} style={{cursor: 'pointer'}} />
                                </div>
                                <p className="eval-sub">Quel est votre avis sur ce stage ?</p>
                                <div className="rating-area">
                                    <label>Satisfaction</label>
                                    <div className="stars">
                                        {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= 4 ? '#fbbf24' : 'none'} color="#fbbf24" />)}
                                    </div>
                                </div>
                                <div className="eval-field">
                                    <label>Vos commentaires</label>
                                    <textarea placeholder="Décrivez votre expérience..." />
                                </div>
                                <button className="btn-save-full">Envoyer l'avis final</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </aside>
            </div>
        </div>
    );
};

export default StudentInternship;
