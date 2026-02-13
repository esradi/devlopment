import React, { useState } from 'react';
import { User, Mail, Lock, Upload, ArrowLeft, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import './signup.css';

function SignUp({ setUserRole }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        profilePhoto: null,
        email: '',
        password: '',
        confirmPassword: '',
        code: '',
        role: '',
        interest: '',
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = () => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.fullName) newErrors.fullName = 'Full Name is required';
            if (!formData.phone) newErrors.phone = 'Phone Number is required';
        } else if (step === 2) {
            if (!formData.email) newErrors.email = 'Email is required';
            if (!formData.password) newErrors.password = 'Password is required';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        } else if (step === 3) {
            if (!formData.code) newErrors.code = 'Verification code is required';
        } else if (step === 4) {
            if (!formData.role) newErrors.role = 'Please select a role';
            if (!formData.interest) newErrors.interest = 'Area of interest is required';
            if (!agreedToTerms) newErrors.terms = 'You must accept the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = (e) => {
        if (e) e.preventDefault();
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const prevStep = () => setStep(step - 1);

    return (
        <div className="signup-page">
            <Link to="/" className="back-home-btn">
                <ArrowLeft size={20} />
                <span>Back to Home</span>
            </Link>

            <div className="signup-container">
                {/* Sidebar */}
                <div className="sidebar">
                    <div className="logo-section">
                        <img src={logo} alt="Logo" className="auth-logo" />
                    </div>
                    <p className='p'>Create your account to access a platform that connects students and companies, providing skills-based training opportunities.</p>

                    <div className="stepper">
                        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number" >1</div>
                            <div className="step-label">Personal info</div>
                        </div>
                        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Account Security</div>
                        </div>
                        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <div className="step-label">Verification</div>
                        </div>
                        <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
                            <div className="step-number">4</div>
                            <div className="step-label">Final Details</div>
                        </div>
                    </div>

                    <p className="footer-text">© Secure Data Storage Enabled</p>
                </div>

                {/* Form Content */}
                <div className="form-content">

                    {/* Step 1: Signup */}
                    {step === 1 && (
                        <div className="step-panel fade-in">
                            <h2>Join the Community</h2>
                            <p className="subtitle">Let's start with your basic information</p>

                            <form onSubmit={nextStep}>
                                <div className={`input-group ${errors.fullName ? 'error' : ''}`}>
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Your name"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                                </div>
                                <div className="input-row">
                                    <div className={`input-group ${errors.phone ? 'error' : ''}`}>
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="+212 ..."
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {errors.phone && <span className="error-msg">{errors.phone}</span>}
                                    </div>
                                    <div className="input-group">
                                        <label>Profile Photo</label>
                                        <div className="file-upload-wrapper">
                                            <label htmlFor="profile-upload" className="file-upload-label">
                                                <Upload size={18} />
                                                <span>{formData.profilePhoto ? formData.profilePhoto.name : 'Choose a file...'}</span>
                                            </label>
                                            <input
                                                id="profile-upload"
                                                type="file"
                                                className="hidden-file-input"
                                                onChange={(e) => setFormData(prev => ({ ...prev, profilePhoto: e.target.files[0] }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="button-group right">
                                    <button type="submit" className="btn-next">Next step</button>
                                </div>
                            </form>
                            <div className="social-separator">
                                <span>Or register with</span>
                            </div>

                            <button className="btn-google" onClick={() => console.log("Google Login Clicked")}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" />
                                Continue with Google
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-panel fade-in">
                            <h2>Security Check</h2>
                            <p className="subtitle">Create a strong password for your account</p>

                            <form onSubmit={nextStep}>
                                <div className={`input-group ${errors.email ? 'error' : ''}`}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.email && <span className="error-msg">{errors.email}</span>}
                                </div>
                                <div className="input-row">
                                    <div className={`input-group ${errors.password ? 'error' : ''}`}>
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className={`input-group ${errors.confirmPassword ? 'error' : ''}`}>
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}

                                <div className="button-group right">
                                    <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                    <button type="submit" className="btn-next">Next step</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Email Confirmation */}
                    {step === 3 && (
                        <div className="step-panel fade-in">
                            <h2>Confirm Email</h2>
                            <p className="subtitle">Enter the 6-digit code sent to your inbox</p>

                            <form onSubmit={nextStep}>
                                <div className={`input-group center ${errors.code ? 'error' : ''}`}>
                                    <label>Verification Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        className="otp-input"
                                        placeholder="XXXXXX"
                                        maxLength="6"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.code && <span className="error-msg">{errors.code}</span>}
                                </div>

                                <div className="button-group">
                                    <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                    <button type="submit" className="btn-next">Verify Code</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 4: Role Selection & Finalization */}
                    {step === 4 && (
                        <div className="step-panel fade-in">
                            <h2>Choose Your Path</h2>
                            <p className="subtitle">Select the account type that fits you best</p>

                            <form onSubmit={nextStep}>
                                <div className="role-grid">
                                    <div
                                        className={`role-card ${formData.role === 'Student' ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, role: 'Student' }))}
                                    >
                                        <GraduationCap size={32} />
                                        <h3>Student</h3>
                                        <p>Find internships & get verified</p>
                                    </div>
                                    <div
                                        className={`role-card ${formData.role === 'Company' ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, role: 'Company' }))}
                                    >
                                        <Briefcase size={32} />
                                        <h3>Company</h3>
                                        <p>Post offers & hire talent</p>
                                    </div>
                                    <div
                                        className={`role-card admin ${formData.role === 'Admin' ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, role: 'Admin' }))}
                                    >
                                        <ShieldCheck size={32} />
                                        <h3>Admin</h3>
                                        <p>Oversee the platform</p>
                                    </div>
                                </div>
                                {errors.role && <span className="error-msg">{errors.role}</span>}

                                {formData.role === 'Admin' && (
                                    <div className="admin-notice">
                                        <p><strong>Note:</strong> Admin accounts require manual validation by an existing administrator before access is granted.</p>
                                    </div>
                                )}

                                <div className={`input-group ${errors.interest ? 'error' : ''}`} style={{ marginTop: '20px' }}>
                                    <label>Area of Interest</label>
                                    <input
                                        type="text"
                                        name="interest"
                                        placeholder="e.g. Graphic Design, Dev, Marketing"
                                        value={formData.interest}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.interest && <span className="error-msg">{errors.interest}</span>}
                                </div>

                                <div className={`checkbox-group ${errors.terms ? 'error' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreedToTerms}
                                        onChange={(e) => {
                                            setAgreedToTerms(e.target.checked);
                                            if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                                        }}
                                    />
                                    <label htmlFor="terms">
                                        Accept <a href="/terms">Terms</a> & <a href="/privacy">Privacy</a>
                                    </label>
                                </div>

                                <div className="button-group">
                                    <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                    <button type="submit" className="btn-next">Complete Signup</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 5: Success Message */}
                    {step === 5 && (
                        <div className="success-overlay fade-in">
                            <div className="success-card">
                                <div className="icon-circle">✓</div>
                                <h2>Registration Successful!</h2>
                                {formData.role === 'Admin' ? (
                                    <p>Your Admin request has been submitted. Please wait for an existing admin to validate your registration.</p>
                                ) : (
                                    <p>Your account is ready. Welcome to the platform! Access your dashboard to get started.</p>
                                )}
                                <button className="btn-next full" onClick={() => {
                                    setUserRole(formData.role.toLowerCase());
                                    navigate('/');
                                }}>Go to Portal</button>
                            </div>
                        </div>
                    )}
                    <p className="toggle-text">
                        Joined already? <Link to="/login" className="link">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
