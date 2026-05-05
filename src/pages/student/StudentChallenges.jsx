import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, XOctagon, Trophy, Info, ChevronRight, Clock, Award } from 'lucide-react';
import { quizService } from '../../services/api';
import './StudentChallenges.css';

const StudentChallenges = ({ userData }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const data = await quizService.getAvailableQuizzes();
            const list = Array.isArray(data) ? data : data?.results || [];
            setQuizzes(list);
        } catch (err) {
            console.error("Failed to load quizzes:", err);
            setQuizzes([]); // ← ne pas afficher l'erreur, juste vide
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleStartQuiz = async (competencyId) => {
        try {
            setLoading(true);
            const quizData = await quizService.getQuizDetails(competencyId);
            setActiveQuiz(quizData);
            setAnswers({});
            setQuizResult(null);
        } catch (err) {
            console.error("Failed to fetch quiz:", err);
            showToast("Failed to start quiz. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!activeQuiz) return;
        setSubmitting(true);
        try {
            const sumbissionRes = await quizService.submitQuiz(activeQuiz.competency, answers);
            setQuizResult(sumbissionRes);
            showToast(sumbissionRes.passed ? "Congratulations! You passed." : "Quiz failed, keep practicing!");
            fetchQuizzes(); // Refresh list to get updated statuses
        } catch (err) {
            console.error("Failed to submit quiz:", err);
            showToast("Error submitting quiz");
        } finally {
            setSubmitting(false);
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

    if (loading && !activeQuiz && quizzes.length === 0) {
        return <div className="challenges-loading"><div className="custom-loader" /></div>;
    }

    if (activeQuiz) {
        return (
            <div className="student-challenges-page quiz-mode">
                <div className="quiz-header">
                    <h2>{activeQuiz.title || 'Skill Assessment'}</h2>
                    <p>Verify your competency to boost your profile strength.</p>
                </div>

                {quizResult ? (
                    <motion.div className="quiz-result-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                        <div className={`result-icon ${quizResult.passed ? 'passed' : 'failed'}`}>
                            {quizResult.passed ? <Trophy size={48} /> : <XOctagon size={48} />}
                        </div>
                        <h3>{quizResult.passed ? 'Assessment Passed!' : 'Assessment Failed'}</h3>
                        <div className="score-display">
                            <span>Your Score:</span>
                            <strong className={quizResult.passed ? 'text-green' : 'text-red'}>
                                {Math.round(quizResult.score)}%
                            </strong>
                        </div>
                        <p>{quizResult.passed ? 'This skill is now officially verified on your CV.' : 'Review the concepts and try again later.'}</p>
                        <button className="btn-primary" onClick={() => setActiveQuiz(null)}>
                            Back to Challenges
                        </button>
                    </motion.div>
                ) : (
                    <div className="quiz-questions-container">
                        {(activeQuiz.questions || []).map((q, idx) => (
                            <div key={q.id} className="quiz-question">
                                <h4>{idx + 1}. {q.text}</h4>
                                <div className="quiz-options">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                        q[`option_${opt.toLowerCase()}`] && (
                                            <label key={opt} className={`quiz-option ${answers[q.id] === opt ? 'selected' : ''}`}>
                                                <input 
                                                    type="radio" 
                                                    name={`q-${q.id}`} 
                                                    value={opt}
                                                    checked={answers[q.id] === opt}
                                                    onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                                />
                                                <span className="opt-letter">{opt}</span>
                                                <span className="opt-text">{q[`option_${opt.toLowerCase()}`]}</span>
                                            </label>
                                        )
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="quiz-actions">
                            <button className="btn-secondary" onClick={() => setActiveQuiz(null)}>Cancel</button>
                            <button 
                                className="btn-primary" 
                                disabled={submitting || Object.keys(answers).length < (activeQuiz.questions || []).length}
                                onClick={handleSubmitQuiz}
                            >
                                {submitting ? 'Submitting...' : 'Submit Answers'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="student-challenges-page">
            <div className="challenges-header">
                <h1>Skill Challenges</h1>
                <p>Complete assessments to verify your skills. Verified skills increase your match score by up to 20% by proving your competency to companies.</p>
            </div>

            <motion.div className="challenges-grid" variants={containerVariants} initial="hidden" animate="visible">
                {quizzes.length > 0 ? quizzes.map(quiz => (
                    <motion.div key={quiz.id} className="challenge-card" variants={itemVariants}>
                        <div className="challenge-icon"><Target size={24} /></div>
                        <h3>{quiz.title || `Skill Assessment: ${quiz.competency}`}</h3>
                        <p>{quiz.description || "Take this multiple choice assessment."}</p>
                        
                        <div className="challenge-meta">
                            <span><Clock size={14} /> 15 Mins</span>
                            <span><Award size={14} /> Official Verifier</span>
                        </div>

                        <div className="challenge-status">
                            {quiz.student_status ? (
                                quiz.student_status.passed ? (
                                    <div className="status-badge passed">
                                        <CheckCircle2 size={16} /> Verified ({Math.round(quiz.student_status.score)}%)
                                    </div>
                                ) : (
                                    <div className="status-badge failed">
                                        <XOctagon size={16} /> Failed ({Math.round(quiz.student_status.score)}%)
                                    </div>
                                )
                            ) : (
                                <div className="status-badge new">
                                    <Info size={16} /> Not Started
                                </div>
                            )}
                        </div>

                        <button 
                            className={`btn-start-challenge ${quiz.student_status?.passed ? 'disabled' : ''}`}
                            onClick={() => !quiz.student_status?.passed && handleStartQuiz(quiz.competency)}
                            disabled={quiz.student_status?.passed}
                        >
                            {quiz.student_status?.passed ? 'Completed' : (quiz.student_status ? 'Retake Quiz' : 'Start Assessment')}
                            <ChevronRight size={16} />
                        </button>
                    </motion.div>
                )) : (
                    <div className="empty-challenges">
                        <Award size={48} />
                        <h3>No challenges available</h3>
                        <p>You have verified all relevant skills or none are assigned to your domain currently.</p>
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        className="challenge-toast"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        <CheckCircle2 size={20} />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentChallenges;
