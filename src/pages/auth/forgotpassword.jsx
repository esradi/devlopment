import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './auth.css';

const ForgotPassword = () => {
    return (
        <div className="page-wrapperf">
            <div className="forgot-password-cardf fade-in">
                <h2 className="title">Forgot Password?</h2>
                <p className="description">
                    Enter your email address below and we'll send you a link to reset your password.
                </p>

                <form>
                    <div className="input-groupl">
                        <label>Email Address</label>
                        <div className="input-field">
                            <input type="email" placeholder="example@mail.com" required />
                            <Mail size={18} className="icon" />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">Send Reset Link</button>
                </form>

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