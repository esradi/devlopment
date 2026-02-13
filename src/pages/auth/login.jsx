import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import './auth.css';

const Login = ({ setUserRole }) => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simulate successful login
        setUserRole('student');
        navigate('/');
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
                                <input type="email" placeholder="Enter your email" required />
                                <User size={18} className="icon" />
                            </div>
                        </div>
                        <div className="input-groupl">
                            <label>Password</label>
                            <div className="input-field">
                                <input type="password" placeholder="••••••••" required />
                                <Lock size={18} className="icon" />
                            </div>
                        </div>
                        <Link to="/forgot-password" core-style="forgot-link">
                            Forgot Password?
                        </Link>
                        <button type="submit" className="submit-btn" style={{ marginBottom: '20px' }}>Sign In</button>
                    </form>
                    <p className="toggle-text">
                        Don't have an account? <Link to="/signup" className="link">Register here</Link>
                    </p>
                </div>

                {/* Right Side: Purple Slant (Hidden on mobile) */}
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
