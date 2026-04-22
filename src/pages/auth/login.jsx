import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
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
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();

            if (response.ok) {
                // Store tokens
                localStorage.setItem('access_token', data.tokens.access);
                localStorage.setItem('refresh_token', data.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));

                setUserRole(data.user.role || 'student');
                if (data.user.role === 'student') {
                    navigate('/dashboard/student');
                } else if (data.user.role === 'company') {
                    navigate('/dashboard/company');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.non_field_errors?.[0] || data.error || data.detail || 'Invalid email or password');
            }
        } catch (err) {
            setError('Failed to connect to the server. Please check if the backend is running.');
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

                        {error && <p className="error-msg" style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={20} style={{ margin: '0 auto' }} /> : 'Sign In'}
                        </button>
                    </form>
                    <p className="toggle-text">
                        Don't have an account? <Link to="/signup" className="link">Register here</Link>
                    </p>
                    <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#8892b0', marginBottom: '10px' }}>Testing Mode:</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={() => { setUserRole('student'); navigate('/dashboard/student'); }}
                                style={{ background: 'rgba(158, 89, 255, 0.1)', color: '#9e59ff', border: '1px solid #9e59ff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                            >
                                Preview Student
                            </button>
                            <button
                                type="button"
                                onClick={() => { setUserRole('company'); navigate('/dashboard/company'); }}
                                style={{ background: 'rgba(255, 27, 144, 0.1)', color: '#ff1b90', border: '1px solid #ff1b90', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                            >
                                Preview Company
                            </button>
                        </div>
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
