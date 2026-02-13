import React from 'react';
import { Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import './auth.css';

const Login = () => {
    return (
        <div className="page-wrapper">
            <div className="auth-card login-card">
                {/* Left Side: Form */}
                <div className="form-section fade-in">
                    <h1 className="title">Login</h1>
                    <div className="input-groupl">
                        <label>Username</label>
                        <div className="input-field">
                            <input type="text" placeholder="Enter your full name" />
                            <User size={18} className="icon" fill="currentColor" />
                        </div>
                    </div>
                    <div className="input-groupl">
                        <label>Password</label>
                        <div className="input-field">
                            <input type="password" placeholder="Password" />
                            <Lock size={18} className="icon" fill="currentColor" />
                        </div>
                    </div>
                    <Link to="/forgot-password" style={{
                        color: '#8a2be2',
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        display: 'block',
                        textAlign: 'right',
                        marginTop: '-8px',
                        marginBottom: '15px'
                    }}>
                        Forgot Password?
                    </Link>
                    <button className="submit-btn">Login</button>
                    <p className="toggle-text">
                        Don't have an account? <Link to="/signup" className="link">Sign Up</Link>
                    </p>
                </div>

                {/* Right Side: Purple Slant */}
                <div className="info-section login-info">
                    <div className="info-content">
                        <h1>WELCOME<br />BACK!</h1>
                        <p>Continue your careee journey with us.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;