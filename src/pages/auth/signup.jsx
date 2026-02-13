// import React from 'react';
// import { User, Mail, Lock, Upload } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import './signup.css';

// const SignUp = () => {
//     return (
//         <div className="page-wrapper">
//             <div className="auth-card signup-card">

//                 {/* LEFT SIDE: Purple Slant with Stepper Content */}
//                 <div className="info-section signup-info">
//                     <div className="stepper-container">
//                         <div className="stepper-header">
//                             <h1>Étape 01</h1>
//                             <p>Veuillez entrer des informations correctes et précises.</p>
//                         </div>

//                         <div className="steps-list">
//                             <div className="step active">
//                                 <div className="step-number">1</div>
//                                 <span className="step-label">Infos Personel</span>
//                             </div>

//                             <div className="step">
//                                 <div className="step-number">2</div>
//                                 <span className="step-label">Inscription</span>
//                             </div>

//                             <div className="step">
//                                 <div className="step-number">3</div>
//                                 <span className="step-label">Confirmation</span>
//                             </div>

//                             <div className="step">
//                                 <div className="step-number">4</div>
//                                 <span className="step-label">Infos Professional</span>
//                             </div>
//                         </div>

//                         <div className="stepper-footer">
//                             <p>© Toutes les informations sont conservées</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* RIGHT SIDE: Form */}
//                 <div className="form-section signup-form">
//                     <h2 className="title" style={{ textAlign: 'right' }}>Sign Up</h2>
//                     <form>
//                         <div className="input-group">
//                             <label>Firstname</label>
//                             <div className="input-field">
//                                 <input type="text" placeholder="Username" />
//                                 <User size={18} className="icon" />
//                             </div>
//                         </div>
//                         <div className="input-group">
//                             <label>Lastname</label>
//                             <div className="input-field">
//                                 <input type="email" placeholder="Email" />
//                                 <Mail size={18} className="icon" />
//                             </div>
//                         </div>
//                         <div className="input-group">
//                             <label>Profile Photo</label>
//                             <div className="input-field">
//                                 <input type="file" placeholder="photo" />
//                                 <Upload size={18} className="icon" />
//                             </div>
//                         </div>
//                         <button type="submit" className="submit-btn">Contunie</button>
//                         <button type="submit" className="submit-btn">Contunie</button>
//                     </form>
//                     <p className="toggle-text">
//                         Already have an account? <Link to="/login" className="link">Login</Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SignUp;
import React, { useState } from 'react';
import { User, Mail, Lock, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import './signup.css';

function App() {
    const [step, setStep] = useState(1);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        code: '',
        role: '',
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="signup-page">
            <div className="signup-container">
                {/* Sidebar */}
                <div className="sidebar">
                    <div className="logo-section">
                        <h2>Stag.io</h2>
                    </div>
                    <p className='p'>create your account to access a platform that connect students and Companies, providing skills-based training opportunities.</p>

                    <div className="stepper">
                        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number" >1</div>
                            <div className="step-label">Personal information</div>
                        </div>
                        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Email & Password</div>
                        </div>
                        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <div className="step-label">Verification</div>
                        </div>
                        <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
                            <div className="step-number">4</div>
                            <div className="step-label">Completion</div>
                        </div>
                    </div>

                    <p className="footer-text">© All data is securely stored</p>
                </div>

                {/* Form Content */}
                <div className="form-content">

                    {/* Step 1: Signup */}
                    {step === 1 && (
                        <div className="step-panel fade-in">
                            <h2>Create Account</h2>
                            <p className="subtitle">Please enter your personal information</p>

                            <div className="input-group">
                                <label>Full Name</label>
                                <input type="name" placeholder="firstname" />
                                {/* <Lock size={18} className="icon" fill="currentColor" /> */}
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <input type="name" placeholder="lastname" />
                                </div>
                                <div className="input-group">
                                    <label>Profile Photo</label>
                                    <input type="file" placeholder="up your p" />
                                </div>
                            </div>

                            <div className="button-group right">
                                <button className="btn-next" onClick={nextStep}>Next Step</button>
                            </div>
                            <div className="social-separator">
                                <span>Or register with</span>
                            </div>

                            <button className="btn-google" onClick={() => console.log("Google Login Clicked")}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" />
                                Google
                            </button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="step-panel fade-in">
                            <h2>Create Account</h2>
                            <p className="subtitle">Please enter your email and create a password</p>

                            <div className="input-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="yourname@email.com" />
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>Password</label>
                                    <input type="password" placeholder="••••••••" />
                                </div>
                                <div className="input-group">
                                    <label>Confirm Password</label>
                                    <input type="password" placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="button-group right">
                                <button className="btn-prev" onClick={prevStep}>Back</button>
                                <button className="btn-next" onClick={nextStep}>Next Step</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Email Confirmation */}
                    {step === 3 && (


                        <div className="step-panel fade-in">
                            <h2>Confirm Email</h2>
                            <p className="subtitle">Please enter the 6-digit code sent to your inbox</p>

                            <div className="input-group center">
                                <label>Verification Code</label>
                                <input type="text" className="otp-input" placeholder="XXXXXX" maxLength="6" />
                            </div>

                            <div className="button-group">
                                <button className="btn-prev" onClick={prevStep}>Back</button>
                                <button className="btn-next" onClick={nextStep}>Next Step</button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Professional Info */}
                    {step === 4 && (
                        <div className="step-panel fade-in">
                            <h2>Detail information</h2>
                            <p className="subtitle">Tell us about your background and role</p>

                            <div className="input-group">
                                <label>Select Your Role</label>
                                <select>
                                    <option value="">Choose a role...</option>
                                    <option value="Company">Company</option>
                                    <option value="Student">Student</option>
                                    <option value=".........">........</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Research Domain</label>
                                <input type="text" placeholder="Briefly describe your field" />
                            </div>

                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                />
                                <label htmlFor="terms">
                                    I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>
                                </label>
                            </div>

                            <div className="button-group">
                                <button className="btn-prev" onClick={prevStep}>Back</button>
                                <button className="btn-next" onClick={nextStep}>Finish Signup</button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Success Message */}
                    {step === 5 && (
                        <div className="success-overlay fade-in">
                            <div className="success-card">
                                <div className="icon-circle">✓</div>
                                <h2>Congratulations!</h2>
                                <p>Your account has been successfully created. You can now complete the tests to start working with us.</p>
                                <button className="btn-next full" onClick={() => window.location.reload()}>Go to Dashboard</button>
                            </div>
                        </div>
                    )}
                    <p className="toggle-text">
                        Already have an account? <Link to="/login" className="link">Login</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default App;
