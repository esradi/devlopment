import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import { authService } from '../../services/api';
import './auth.css';

const Login = ({ setUserRole }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting login for:', email);
            const data = await authService.login({ email, password });

            // Store tokens - Note: the API returns access_token/refresh_token in data or data.tokens depending on backend
            // Let's assume data has tokens and user based on previous code. If the response structure differs, we'll need to adapt it. 
            // In typical Django REST it might be in data.access or data.tokens.access.
            const tokens = data.tokens || { access: data.access, refresh: data.refresh };
            
            if (tokens && tokens.access) {
                localStorage.setItem('access_token', tokens.access);
                if (tokens.refresh) localStorage.setItem('refresh_token', tokens.refresh);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUserRole(data.user.role || 'student');
                if (data.user.role === 'student') {
                    navigate('/dashboard/student');
                } else if (data.user.role === 'company') {
                    navigate('/dashboard/company');
                } else if (data.user.role === 'admin') {
                    navigate('/dashboard/admin');
                } else {
                    navigate('/');
                }
            } else {
                
                // Fetch user info via getMe() if not included in login response
                try {
                    const userData = await authService.getMe();
                    localStorage.setItem('user', JSON.stringify(userData));
                    setUserRole(userData.role || 'student');
                    if (userData.role === 'student') navigate('/dashboard/student');
                    else if (userData.role === 'company') navigate('/dashboard/company');
                    else if (userData.role === 'admin') navigate('/dashboard/admin');
                    else navigate('/');
                } catch (meErr) {
                     navigate('/');
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to connect to the server. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/" className="back-home-btn">
                <ArrowLeft size={20} />
                <span>Back to Home</span>
            </Link>

            <div className="auth-card login-card">
                {/* Left Side: Form */}
                <div className="form-section fade-in">
                    <div className="auth-logo-container">
                        <img src={logo} alt="Brand Logo" className="auth-logo" />
                    </div>

                    <h1 className="title">Welcome Back</h1>
                    <p className="auth-subtitle">Please enter your details to sign in.</p>

                    <form onSubmit={handleLogin}>
                        <div className="input-groupl">
                            <label>Email Address</label>
                            <div className="input-field">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail size={18} className="icon" />
                            </div>
                        </div>
                        <div className="input-groupl">
                            <label>Password</label>
                            <div className="input-field">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock size={18} className="icon" />
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                            <Link to="/forgot-password" style={{ color: '#ff1b90', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        {error && (
                            <div className="login-error-alert">
                                {error.includes('|REASON|') ? (
                                    <>
                                        <strong>{error.split('|REASON|')[0]}</strong>
                                        <div className="suspend-reason">
                                            Reason: {error.split('|REASON|')[1]}
                                        </div>
                                    </>
                                ) : (
                                    <span>{error}</span>
                                )}
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={20} style={{ margin: '0 auto' }} /> : 'Sign In'}
                        </button>
                    </form>
                    <p className="toggle-text">
                        Don't have an account? <Link to="/signup" className="link">Register here</Link>
                    </p>
                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    </div>
                </div>

                {/* Right Side: Info Section */}
                <div className="info-section login-info">
                    <div className="info-content">
                        <motion.h1
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            LOGIN<br />PORTAL
                        </motion.h1>
                        <p>Access your dashboard and manage your opportunities with ease.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
