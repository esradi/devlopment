import React, { useState } from 'react';
import { Lock, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../../config';
import './auth.css';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        code: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            console.log('Attempting password reset confirm for:', formData.email);
            const response = await fetch(`${API_URL}/api/password-reset/confirm/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            console.log('Response status:', response.status);
            const data = await response.json();

            if (response.ok) {
                setMessage('Password reset successfully!');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.error || data.message || (data.domain ? data.domain[0] : 'Reset failed'));
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapperf">
            <div className="forgot-password-cardf fade-in">
                <h2 className="title">Reset Password</h2>

                {!message ? (
                    <>
                        <p className="description">
                            Check your email for the 6-digit code and choose a new strong password.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="input-groupl">
                                <label>Email Address</label>
                                <div className="input-field">
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="input-groupl">
                                <label>6-Digit Code</label>
                                <div className="input-field">
                                    <input type="text" name="code" placeholder="XXXXXX" maxLength="6" value={formData.code} onChange={handleChange} required />
                                    <KeyRound size={18} className="icon" />
                                </div>
                            </div>

                            <div className="input-groupl">
                                <label>New Password</label>
                                <div className="input-field">
                                    <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                    <Lock size={18} className="icon" />
                                </div>
                            </div>

                            <div className="input-groupl">
                                <label>Confirm Password</label>
                                <div className="input-field">
                                    <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                                    <Lock size={18} className="icon" />
                                </div>
                            </div>

                            {error && <p className="error-msg center" style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</p>}

                            <button type="submit" className="submit-btn" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-message-box fade-in" style={{ padding: '20px 0' }}>
                        <p className="description" style={{ color: '#ffffff' }}>{message}</p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Redirecting to login...</p>
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

export default ResetPassword;