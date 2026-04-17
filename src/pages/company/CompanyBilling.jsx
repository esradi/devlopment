import React, { useState } from 'react';
import CompanySidebar from '../../components/CompanySidebar';
import { Check, CheckCircle2, CreditCard } from 'lucide-react';
import './CompanyBilling.css';

const CompanyBilling = () => {
    const [billingPeriod, setBillingPeriod] = useState('monthly');

    return (
        <div className="company-billing-dashboard">
            {/* Sidebar */}
            <CompanySidebar activePath="billing" />

            {/* Main Content */}
            <main className="billing-main-content">
                <header className="billing-header">
                    <h1>Billing & Plans</h1>
                    <p>Choose the plan that fits your hiring needs.</p>
                </header>

                <div className="current-plan-banner border-glow">
                    <div className="banner-left">
                        <h2>CURRENT PLAN: FREE <span className="dot"></span></h2>
                        <p>You can post up to 2 active offers and receive up to 50 applications per month.</p>
                    </div>
                    <div className="banner-right">
                        <button className="btn-recommend">Recommended: Upgrade to Premium for high-volume hiring.</button>
                    </div>
                </div>

                <div className="billing-grid">
                    {/* Free Plan Card */}
                    <div className="pricing-card free-plan">
                        <span className="plan-level">ESSENTIAL</span>
                        <h2 className="plan-name">Free</h2>
                        <div className="plan-price">
                            <span className="price-val">0 DA</span> <span className="price-period">/ month</span>
                        </div>
                        <button className="btn-current-plan"><Check size={14} /> Current plan</button>

                        <div className="plan-features">
                            <div className="feature"><Check size={16} className="text-gray" /> <span>Up to 2 active offers</span></div>
                            <div className="feature"><Check size={16} className="text-gray" /> <span>50 applications/month</span></div>
                            <div className="feature"><Check size={16} className="text-gray" /> <span>Basic messaging</span></div>
                            <div className="feature"><Check size={16} className="text-gray" /> <span>Standard filtering</span></div>
                        </div>

                        <button className="btn-disabled" disabled>Current plan</button>
                    </div>

                    {/* Premium Plan Card */}
                    <div className="pricing-card premium-plan premium-glow">
                        <div className="premium-header">
                            <span className="plan-level">GROWTH</span>
                            <span className="most-popular-badge">MOST POPULAR</span>
                        </div>
                        <h2 className="plan-name">Premium</h2>
                        
                        <div className="price-and-toggle">
                            <div className="plan-price">
                                <span className="price-val">{billingPeriod === 'monthly' ? '1,500' : '15,000'} DA</span> 
                                <span className="price-period">/ {billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                            </div>
                            <div className="billing-toggle">
                                <button 
                                    className={`toggle-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
                                    onClick={() => setBillingPeriod('monthly')}
                                >Monthly</button>
                                <button 
                                    className={`toggle-btn ${billingPeriod === 'yearly' ? 'active' : ''}`}
                                    onClick={() => setBillingPeriod('yearly')}
                                >Yearly</button>
                            </div>
                        </div>

                        <div className="plan-features premium-features">
                            <div className="feature"><CheckCircle2 size={16} className="text-pink" fill="#ff1b90" color="#13151a" /> <span>Unlimited offers</span></div>
                            <div className="feature"><CheckCircle2 size={16} className="text-pink" fill="#ff1b90" color="#13151a" /> <span>Unlimited applications</span></div>
                            <div className="feature"><CheckCircle2 size={16} className="text-pink" fill="#ff1b90" color="#13151a" /> <span>Priority filtering</span></div>
                            <div className="feature"><CheckCircle2 size={16} className="text-pink" fill="#ff1b90" color="#13151a" /> <span>Advanced search</span></div>
                            <div className="feature"><CheckCircle2 size={16} className="text-pink" fill="#ff1b90" color="#13151a" /> <span>Featured profile</span></div>
                        </div>

                        <button className="btn-upgrade-premium">UPGRADE TO PREMIUM</button>
                    </div>

                    {/* Billing Summary */}
                    <div className="billing-summary-card">
                        <h3 className="summary-title"><CreditCard size={18} /> Billing Summary</h3>
                        
                        <div className="summary-row">
                            <span className="summary-label">Plan</span>
                            <span className="summary-value text-purple">Premium</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Billing period</span>
                            <span className="summary-value" style={{ textTransform: 'capitalize' }}>{billingPeriod}</span>
                        </div>

                        <div className="summary-section">
                            <div className="summary-label small">NEXT PAYMENT</div>
                            <div className="summary-bold">{billingPeriod === 'monthly' ? '1,500' : '15,000'} DA <span>on 15 May 2026</span></div>
                        </div>

                        <div className="summary-section">
                            <div className="summary-label small">PAYMENT METHOD</div>
                            <div className="payment-method-box">
                                <div className="card-icon"><CreditCard size={16} /></div>
                                <div className="card-details">
                                    <div className="card-number">**** 4242</div>
                                    <div className="card-expiry">Visa · Expires 12/28</div>
                                </div>
                            </div>
                        </div>

                        <button className="btn-view-invoice">View invoice history</button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default CompanyBilling;
