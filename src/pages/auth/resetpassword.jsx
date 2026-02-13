import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './auth.css';

const ResetPassword = () => {
    return (
        <div className="page-wrapper">
            <div className="reset-password-card">
                <div className="form-container">
                    <h2 className="title">Reset Password</h2>
                    <p className="description">
                        Strong passwords include a mix of letters, numbers, and symbols.
                    </p>

                    <form>
                        <div className="input-groupl">
                            <label>New Password</label>
                            <div className="input-field">
                                <input type="password" placeholder="••••••••" required />
                                <Lock size={18} className="icon" />
                            </div>
                        </div>

                        <div className="input-groupl">
                            <label>Confirm Password</label>
                            <div className="input-field">
                                <input type="password" placeholder="••••••••" required />
                                <Lock size={18} className="icon" />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">Update Password</button>
                    </form>

                    <div className="back-to-login">
                        <Link to="/login" className="back-link">
                            <ArrowLeft size={16} />
                            <span>Back to Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;