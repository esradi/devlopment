import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            console.log('Attempting password reset for:', email);
            const response = await fetch('http://127.0.0.1:8000/api/password-reset/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();

            if (response.ok) {
                setMessage('A reset code has been sent to your email.');
                // Automatically redirect to reset confirm after 2 seconds
                setTimeout(() => {
                    navigate('/reset-password', { state: { email } });
                }, 2000);
            } else {
                setError(data.email ? data.email[0] : (data.error || data.message || 'Something went wrong'));
            }
        } catch (err) {
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapperf">
            <div className="forgot-password-cardf fade-in">
                <h2 className="title">Forgot Password?</h2>

                {!message ? (
                    <>
                        <p className="description">
                            Enter your email address below and we'll send you a 6-digit code to reset your password.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="input-groupl">
                                <label>Email Address</label>
                                <div className="input-field">
                                    <input
                                        type="email"
                                        placeholder="example@mail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Mail size={18} className="icon" />
                                </div>
                            </div>

                            {error && <p className="error-msg center" style={{ color: '#ff4d4d', marginTop: '10px', fontSize: '0.85rem' }}>{error}</p>}

                            <button type="submit" className="submit-btn" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Code'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-message-box fade-in" style={{ padding: '20px 0' }}>
                        <CheckCircle size={48} color="#9e59ff" style={{ margin: '0 auto 20px' }} />
                        <p className="description" style={{ color: '#ffffff' }}>{message}</p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Redirecting to reset page...</p>
                    </div>
                )}

                <div className="back-to-login">
                    <Link to="/login" className="back-link">
                        <ArrowLeft size={16} />
                        <span>Back to Login</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;