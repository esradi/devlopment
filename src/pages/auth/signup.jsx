import React, { useState } from 'react';
import { User, Mail, Lock, Upload, ArrowLeft, Briefcase, GraduationCap, ShieldCheck, Building2, Globe, Loader2, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Gold_Green_Round_Minimalist_Real_Estate_Logo__2_-removebg-preview.png';
import './signup.css';

function SignUp({ setUserRole }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Common / Account Owner
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        code: '',

        // Student Specific
        interest: '', // Speciality
        cv: null,

        // Company Specific
        company_name: '',
        company_type: '',
        country: '',
        city: '',
        address: '',
        postal_code: '',
        website: '',
        nif: '',
        registre_commerce: '',
        industry: '',
        company_size: '',
        description: '',
        referral_source: '',
        logo: null,

        // Admin Specific
        admin_role: '',
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files[0] }));
    };

    const SPECIALITIES = [
        'Computer Science', 'Medicine', 'Pharmacy', 'Biology',
        'Polytechnique', 'GP', 'ST', 'English Literature'
    ];

    const ADMIN_ROLES = [
        'Dean of University',
        'Head of Department',
        'Career Service Manager',
        'Internship Coordinator',
        'General Administration'
    ];

    const validateStep = () => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.role) newErrors.role = 'Please select your role to continue';
        } else if (step === 2) {
            if (formData.role === 'student' && !formData.interest) newErrors.interest = 'Please select your speciality';
            if (formData.role === 'admin' && !formData.admin_role) newErrors.admin_role = 'Please select your administration role';
            if (formData.role === 'company') {
                if (!formData.company_name) newErrors.company_name = 'Company name is required';
                if (!formData.company_type) newErrors.company_type = 'Company type is required';
                if (!formData.country) newErrors.country = 'Country is required';
                if (!formData.city) newErrors.city = 'City is required';
            }
        } else if (step === 3) {
            if (formData.role === 'student' || formData.role === 'admin') {
                if (!formData.fullName) newErrors.fullName = 'Full Name is required';
                if (!formData.phone) newErrors.phone = 'Phone Number is required';
                if (formData.role === 'student' && !formData.cv) newErrors.cv = 'CV upload is required';
            } else if (formData.role === 'company') {
                if (!formData.address) newErrors.address = 'Business address is required';
                if (!formData.registre_commerce) newErrors.registre_commerce = 'Tax/Registration number is required';
                if (!formData.industry) newErrors.industry = 'Industry category is required';
            }
        } else if (step === 4) {
            if (!formData.email) newErrors.email = 'Email is required';
            if (!formData.password) newErrors.password = 'Password is required';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
            if (formData.role === 'company') {
                if (!formData.fullName) newErrors.fullName = 'Account owner name is required';
                if (!formData.phone) newErrors.phone = 'Owner phone number is required';
            }
        } else if (step === 5) {
            // For Students/Admins, this is the final verification step
            if (formData.role !== 'company') {
                if (!formData.code) newErrors.code = 'Verification code is required';
                if (!agreedToTerms) newErrors.terms = 'You must accept the terms';
            }
        } else if (step === 6) {
            // For Companies, this is the final verification step
            if (formData.role === 'company') {
                if (!formData.code) newErrors.code = 'Verification code is required';
                if (!agreedToTerms) newErrors.terms = 'You must accept the terms';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        setLoading(true);
        const data = new FormData();

        // Append all text fields
        Object.keys(formData).forEach(key => {
            if (formData[key] && key !== 'cv' && key !== 'logo' && key !== 'code') {
                data.append(key, formData[key]);
            }
        });

        // Add special mapping for speciality
        if (formData.interest) data.append('domain', formData.interest);

        // Append files
        if (formData.cv) data.append('cv', formData.cv);
        if (formData.logo) data.append('logo', formData.logo);

        try {
            console.log('Attempting registration...');
            const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method: 'POST',
                body: data,
            });

            console.log('Registration response status:', response.status);
            const result = await response.json();

            if (response.ok) {
                setStep(step + 1);
            } else {
                setErrors(result);
            }
        } catch (err) {
            console.error('Registration failed:', err);
            setErrors({ general: 'Connection to server failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        setLoading(true);
        try {
            console.log('Attempting email verification...');
            const response = await fetch('http://127.0.0.1:8000/api/verify-email/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    code: formData.code
                }),
            });

            console.log('Verification response status:', response.status);
            const result = await response.json();

            if (response.ok) {
                // Store tokens and user info for immediate login
                if (result.user && result.tokens) {
                    localStorage.setItem('access_token', result.tokens.access);
                    localStorage.setItem('refresh_token', result.tokens.refresh);
                    localStorage.setItem('user', JSON.stringify(result.user));

                    // Update global state if available (from props)
                    if (typeof setUserRole === 'function') {
                        setUserRole(result.user.role);
                    }
                }
                setStep(step + 1);
            } else {
                setErrors({ code: result.error || 'Invalid verification code' });
            }
        } catch (err) {
            setErrors({ code: 'Failed to verify. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    const nextStep = (e) => {
        if (e) e.preventDefault();
        if (!validateStep()) return;

        // Special handling for the step that triggers API calls
        if ((formData.role !== 'company' && step === 4) || (formData.role === 'company' && step === 5)) {
            handleRegister();
        } else if ((formData.role !== 'company' && step === 5) || (formData.role === 'company' && step === 6)) {
            handleVerifyEmail();
        } else {
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
                    <p className='p'>Create your account to access a platform that connects candidates and organizations, providing skills-based training opportunities.</p>

                    <div className="stepper">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className={`step-item ${step >= s ? 'active' : ''}`}>
                                <div className="step-number">{s}</div>
                                <div className="step-label">
                                    {s === 1 && "Choose Path"}
                                    {s === 2 && "Vital Details"}
                                    {s === 3 && (formData.role === 'company' ? "Organization" : "Profile info")}
                                    {s === 4 && "Security"}
                                    {s === 5 && "Verification"}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="footer-text">© Secure Data Storage Enabled</p>
                </div>

                {/* Form Content */}
                <div className="form-content">

                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <div className="step-panel fade-in">
                            <h2>Choose Your Path</h2>
                            <p className="subtitle">Select the account type that fits you best</p>
                            <div className="role-grid">
                                <div
                                    className={`role-card ${formData.role === 'student' ? 'selected' : ''}`}
                                    onClick={() => { setFormData(prev => ({ ...prev, role: 'student' })); setStep(2); }}
                                >
                                    <GraduationCap size={32} />
                                    <h3>Student</h3>
                                    <p>Find internships & get verified</p>
                                </div>
                                <div
                                    className={`role-card ${formData.role === 'company' ? 'selected' : ''}`}
                                    onClick={() => { setFormData(prev => ({ ...prev, role: 'company' })); setStep(2); }}
                                >
                                    <Briefcase size={32} />
                                    <h3>Company</h3>
                                    <p>Post offers & hire talent</p>
                                </div>
                                <div
                                    className={`role-card admin ${formData.role === 'admin' ? 'selected' : ''}`}
                                    onClick={() => { setFormData(prev => ({ ...prev, role: 'admin' })); setStep(2); }}
                                >
                                    <ShieldCheck size={32} />
                                    <h3>University Administration</h3>
                                    <p>Oversee the platform</p>
                                </div>
                            </div>
                            {errors.role && <span className="error-msg center">{errors.role}</span>}
                        </div>
                    )}

                    {/* Step 2: Role-Specific Initial Details */}
                    {step === 2 && (
                        <div className="step-panel fade-in">
                            {formData.role === 'student' && (
                                <>
                                    <h2>Academic Focus</h2>
                                    <p className="subtitle">Select your field of expertise</p>
                                    <form onSubmit={nextStep}>
                                        <div className={`input-group ${errors.interest ? 'error' : ''}`}>
                                            <label>Speciality</label>
                                            <select name="interest" value={formData.interest} onChange={handleInputChange} required className="auth-select">
                                                <option value="">Select your speciality</option>
                                                {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {errors.interest && <span className="error-msg">{errors.interest}</span>}
                                        </div>
                                        <div className="button-group right">
                                            <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                            <button type="submit" className="btn-next">Next Step</button>
                                        </div>
                                    </form>
                                </>
                            )}
                            {formData.role === 'admin' && (
                                <>
                                    <h2>Administration Role</h2>
                                    <p className="subtitle">What is your position in the university?</p>
                                    <form onSubmit={nextStep}>
                                        <div className={`input-group ${errors.admin_role ? 'error' : ''}`}>
                                            <label>Position</label>
                                            <select name="admin_role" value={formData.admin_role} onChange={handleInputChange} required className="auth-select">
                                                <option value="">Select your position</option>
                                                {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            {errors.admin_role && <span className="error-msg">{errors.admin_role}</span>}
                                        </div>
                                        <div className="button-group right">
                                            <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                            <button type="submit" className="btn-next">Next Step</button>
                                        </div>
                                    </form>
                                </>
                            )}
                            {formData.role === 'company' && (
                                <>
                                    <h2>Business Profile</h2>
                                    <p className="subtitle">Basic information about your organization</p>
                                    <form onSubmit={nextStep}>
                                        <div className={`input-group ${errors.company_name ? 'error' : ''}`}>
                                            <label>Company Legal Name</label>
                                            <div className="input-with-icon">
                                                <Building2 size={18} />
                                                <input type="text" name="company_name" placeholder="ABC Corp" value={formData.company_name} onChange={handleInputChange} required />
                                            </div>
                                            {errors.company_name && <span className="error-msg">{errors.company_name}</span>}
                                        </div>
                                        <div className="input-row">
                                            <div className={`input-group ${errors.company_type ? 'error' : ''}`}>
                                                <label>Company Type</label>
                                                <select name="company_type" value={formData.company_type} onChange={handleInputChange} required className="auth-select">
                                                    <option value="">Select Type</option>
                                                    <option value="Startup">Startup</option>
                                                    <option value="Agency">Agency</option>
                                                    <option value="Enterprise">Large Enterprise</option>
                                                    <option value="School">School/Institute</option>
                                                    <option value="NGO">NGO</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Industry</label>
                                                <input type="text" name="industry" placeholder="e.g. IT, Health" value={formData.industry} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="input-row">
                                            <div className="input-group">
                                                <label>Country</label>
                                                <input type="text" name="country" placeholder="Algeria" value={formData.country} onChange={handleInputChange} required />
                                            </div>
                                            <div className="input-group">
                                                <label>City</label>
                                                <input type="text" name="city" placeholder="Algiers" value={formData.city} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="button-group right">
                                            <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                            <button type="submit" className="btn-next">Next Step</button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 3: Identity / Specific Documentation */}
                    {step === 3 && (
                        <div className="step-panel fade-in">
                            {formData.role === 'student' || formData.role === 'admin' ? (
                                <>
                                    <h2>{formData.role === 'student' ? 'Professional Profile' : 'Personal Details'}</h2>
                                    <p className="subtitle">Provide your contact and identification details</p>
                                    <form onSubmit={nextStep}>
                                        <div className={`input-group ${errors.fullName ? 'error' : ''}`}>
                                            <label>Full Name</label>
                                            <input type="text" name="fullName" placeholder="Your name" value={formData.fullName} onChange={handleInputChange} required />
                                            {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                                        </div>
                                        <div className="input-group">
                                            <label>Phone Number</label>
                                            <input type="tel" name="phone" placeholder="+213 ..." value={formData.phone} onChange={handleInputChange} required />
                                        </div>
                                        {formData.role === 'student' && (
                                            <div className={`input-group ${errors.cv ? 'error' : ''}`}>
                                                <label>Latest CV (PDF)</label>
                                                <div className="file-upload-wrapper">
                                                    <label htmlFor="cv-upload" className="file-upload-label">
                                                        <Upload size={18} />
                                                        <span>{formData.cv ? formData.cv.name : 'Choose CV file...'}</span>
                                                    </label>
                                                    <input id="cv-upload" type="file" accept=".pdf" className="hidden-file-input" name="cv" onChange={handleFileChange} />
                                                </div>
                                                {errors.cv && <span className="error-msg">{errors.cv}</span>}
                                            </div>
                                        )}
                                        <div className="button-group right">
                                            <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                            <button type="submit" className="btn-next">Next Step</button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h2>Identity & Address</h2>
                                    <p className="subtitle">Official registration and contact details</p>
                                    <form onSubmit={nextStep}>
                                        <div className="input-group">
                                            <label>Full Business Address</label>
                                            <textarea name="address" placeholder="Street name, Building..." value={formData.address} onChange={handleInputChange} required rows="2" />
                                        </div>
                                        <div className="input-row">
                                            <div className="input-group">
                                                <label>Postal Code</label>
                                                <input type="text" name="postal_code" placeholder="16000" value={formData.postal_code} onChange={handleInputChange} />
                                            </div>
                                            <div className="input-group">
                                                <label>Tax ID / RC Number</label>
                                                <input type="text" name="registre_commerce" placeholder="NIF, RC, VAT..." value={formData.registre_commerce} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Company Website (Optional)</label>
                                            <div className="input-with-icon">
                                                <Globe size={18} />
                                                <input type="url" name="website" placeholder="https://..." value={formData.website} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="button-group right">
                                            <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                            <button type="submit" className="btn-next">Next Step</button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 4: Account Security / Main Contact */}
                    {step === 4 && (
                        <div className="step-panel fade-in">
                            <h2>{formData.role === 'company' ? 'Main Contact Person' : 'Account Security'}</h2>
                            <p className="subtitle">How you will access and manage your account</p>
                            <form onSubmit={nextStep}>
                                {formData.role === 'company' && (
                                    <div className="input-row">
                                        <div className={`input-group ${errors.fullName ? 'error' : ''}`}>
                                            <label>Contact Full Name</label>
                                            <input type="text" name="fullName" placeholder="Primary contact name" value={formData.fullName} onChange={handleInputChange} required />
                                        </div>
                                        <div className={`input-group ${errors.phone ? 'error' : ''}`}>
                                            <label>Work Phone</label>
                                            <input type="tel" name="phone" placeholder="WhatsApp/Office" value={formData.phone} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                )}
                                <div className={`input-group ${errors.email ? 'error' : ''}`}>
                                    <label>{formData.role === 'company' ? 'Account Email' : 'Email Address'}</label>
                                    <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required />
                                    {errors.email && <span className="error-msg">{errors.email}</span>}
                                </div>
                                <div className="input-row">
                                    <div className={`input-group ${errors.password ? 'error' : ''}`}>
                                        <label>Password</label>
                                        <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                                        {errors.password && <span className="error-msg">{errors.password}</span>}
                                    </div>
                                    <div className={`input-group ${errors.confirmPassword ? 'error' : ''}`}>
                                        <label>Confirm</label>
                                        <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} required />
                                        {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                                    </div>
                                </div>
                                {errors.general && <p className="error-msg center" style={{ marginBottom: '15px' }}>{errors.general}</p>}
                                <div className="button-group right">
                                    <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                    <button type="submit" className="btn-next" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : (formData.role === 'company' ? 'Next Step' : 'Next: Verify')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 5: Finalization (Company) or Verification (Student/Admin) */}
                    {step === 5 && (
                        <div className="step-panel fade-in">
                            {formData.role === 'company' ? (
                                <>
                                    <h2>Brand & Context</h2>
                                    <p className="subtitle">Let's add some personality to your profile</p>
                                    <form onSubmit={nextStep}>
                                        <div className="input-row">
                                            <div className="input-group">
                                                <label>Company Size</label>
                                                <select name="company_size" value={formData.company_size} onChange={handleInputChange} className="auth-select">
                                                    <option value="">Select Size</option>
                                                    <option value="1-10">1-10 Employees</option>
                                                    <option value="11-50">11-50 Employees</option>
                                                    <option value="51-200">51-200 Employees</option>
                                                    <option value="200+">200+ Employees</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Company Logo</label>
                                                <div className="file-upload-wrapper">
                                                    <label htmlFor="logo-upload" className="file-upload-label">
                                                        <Upload size={18} />
                                                        <span>{formData.logo ? formData.logo.name : 'Square logo...'}</span>
                                                    </label>
                                                    <input id="logo-upload" type="file" accept="image/*" className="hidden-file-input" name="logo" onChange={handleFileChange} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Short Description</label>
                                            <textarea name="description" placeholder="Briefly describe your services..." value={formData.description} onChange={handleInputChange} rows="2" />
                                        </div>
                                        <div className="input-group">
                                            <label>How did you hear about us?</label>
                                            <input type="text" name="referral_source" placeholder="Ad, Social, Word of mouth..." value={formData.referral_source} onChange={handleInputChange} />
                                        </div>

                                        {errors.general && <p className="error-msg center" style={{ marginBottom: '15px' }}>{errors.general}</p>}
                                        <div className="button-group right">
                                            <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                            <button type="submit" className="btn-next" disabled={loading}>
                                                {loading ? <Loader2 className="animate-spin" /> : 'Next: Verify'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h2>Final Verification</h2>
                                    <p className="subtitle">Enter the 6-digit code sent to your email</p>
                                    <form onSubmit={nextStep}>
                                        <div className={`input-group center ${errors.code ? 'error' : ''}`}>
                                            <label>Verification Code</label>
                                            <input type="text" name="code" className="otp-input" placeholder="XXXXXX" maxLength="6" value={formData.code} onChange={handleInputChange} required />
                                            {errors.code && <span className="error-msg">{errors.code}</span>}
                                        </div>
                                        <div className={`checkbox-group ${errors.terms ? 'error' : ''}`}>
                                            <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                                            <label htmlFor="terms">Accept <a href="/terms">Terms</a> & <a href="/privacy">Privacy</a></label>
                                        </div>
                                        {errors.terms && <span className="error-msg center">{errors.terms}</span>}
                                        <div className="button-group center">
                                            <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                            <button type="submit" className="btn-next" disabled={loading}>
                                                {loading ? <Loader2 className="animate-spin" /> : 'Verify & Complete'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 6: Company Verification */}
                    {step === 6 && formData.role === 'company' && (
                        <div className="step-panel fade-in">
                            <h2>Email Verification</h2>
                            <p className="subtitle">Enter the 6-digit code sent to {formData.email}</p>
                            <form onSubmit={nextStep}>
                                <div className={`input-group center ${errors.code ? 'error' : ''}`}>
                                    <label>Confirmation Code</label>
                                    <input type="text" name="code" className="otp-input" placeholder="XXXXXX" maxLength="6" value={formData.code} onChange={handleInputChange} required />
                                    {errors.code && <span className="error-msg">{errors.code}</span>}
                                </div>
                                <div className={`checkbox-group ${errors.terms ? 'error' : ''}`}>
                                    <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                                    <label htmlFor="terms">Accept <a href="/terms">Terms</a> & <a href="/privacy">Privacy</a></label>
                                </div>
                                {errors.terms && <span className="error-msg center">{errors.terms}</span>}
                                <div className="button-group center">
                                    <button type="button" className="btn-prev" onClick={prevStep}>Back</button>
                                    <button type="submit" className="btn-next" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : 'Finalize Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Final Step: Success Message */}
                    {((step === 6 && formData.role !== 'company') || (step === 7 && formData.role === 'company')) && (
                        <div className="success-overlay fade-in">
                            <div className="success-card">
                                <div className="icon-circle">✓</div>
                                <h2>Registration Successful!</h2>
                                <div className="success-content">
                                    {formData.role === 'admin' ? (
                                        <p>Your Administration request has been submitted. Our team will validate your credentials shortly.</p>
                                    ) : formData.role === 'company' ? (
                                        <p>Your Company profile is created and pending validation by the University Administration. You will be notified once approved.</p>
                                    ) : (
                                        <p>Welcome to the platform! Your student account is ready. You can now start searching for internships.</p>
                                    )}
                                </div>
                                <button className="btn-next full" style={{ marginTop: '30px' }} onClick={() => {
                                    setUserRole(formData.role);
                                    navigate('/');
                                }}>Enter Portal</button>
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
