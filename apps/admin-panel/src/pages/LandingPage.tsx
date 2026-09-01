import { useState } from 'react';
import {
  Store,
  User,
  ShieldCheck,
  Zap,
  Clock,
  QrCode,
  TrendingUp,
  Award,
  ChevronRight,
  Flame,
  ArrowRight,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Utensils,
  MapPin
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import '../landing.css';


export default function LandingPage() {
  const { openSignIn } = useClerk();

  // Interactive Tabs
  const [activeRoleTab, setActiveRoleTab] = useState<'customer' | 'vendor' | 'admin'>('customer');
  
  // Interactive Walk-to-Cook ETA Simulator
  const [walkMinutes, setWalkMinutes] = useState(5);

  // Interactive ROI Calculator for Vendors
  const [dailyRushOrders, setDailyRushOrders] = useState(120);
  const avgDishPrice = 120;
  const extraRevenue = Math.round(dailyRushOrders * 0.35 * avgDishPrice * 26);

  const getAppBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://wukway-app.vercel.app';
    }
    return import.meta.env.VITE_APP_URL || 'http://localhost:8081';
  };


  const handleLaunchRole = (role: 'admin' | 'customer' | 'vendor') => {
    if (role === 'admin') {
      openSignIn({ forceRedirectUrl: '/admin' });
    } else {
      const baseUrl = getAppBaseUrl();
      window.location.href = `${baseUrl}/${role}`;
    }
  };


  return (
    <div className="landing-wrapper">
      {/* Top Ambient Glow */}
      <div className="ambient-glow top-left-glow" />
      <div className="ambient-glow top-right-glow" />

      {/* Sticky Glass Navbar */}
      <header className="startup-navbar">
        <div className="nav-brand">
          <div className="brand-logo-badge">
            <Flame className="flame-icon" size={22} />
          </div>
          <span className="brand-name">WukWay</span>
          <span className="brand-tag">CAMPUS LIVE</span>
        </div>

        <nav className="nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#roles">Platform Portals</a>
          <a href="#calculator">Vendor ROI</a>
          <a href="#features">Innovation</a>
        </nav>

        <div className="nav-actions">
          <button className="btn-secondary" onClick={() => handleLaunchRole('vendor')}>
            <Store size={16} /> Stall Login
          </button>
          <button className="btn-primary" onClick={() => handleLaunchRole('customer')}>
            <User size={16} /> Order Food ➔
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-announcement">
          <Sparkles size={15} className="sparkle-icon" />
          <span>Next-Gen Campus Food Tech · Zero Queue, Timed Pickups</span>
          <ChevronRight size={14} />
        </div>

        <h1 className="hero-headline">
          Your Food, <span className="text-gradient">Ready When You Arrive.</span><br />
          Zero Waiting.
        </h1>

        <p className="hero-subtext">
          WukWay connects campus students with local food stalls using timed cooking algorithms.
          Pick by walking distance, sync the kitchen fire to your footsteps, and grab your meal piping hot with a 1-tap pickup token.
        </p>

        {/* Hero CTAs */}
        <div className="hero-cta-group">
          <button className="hero-btn-primary" onClick={() => handleLaunchRole('customer')}>
            <Utensils size={18} />
            <span>Launch Customer App</span>
            <ArrowRight size={18} />
          </button>

          <button className="hero-btn-secondary" onClick={() => handleLaunchRole('vendor')}>
            <Store size={18} />
            <span>Vendor Kitchen Display</span>
          </button>

          <button className="hero-btn-admin" onClick={() => handleLaunchRole('admin')}>
            <ShieldCheck size={18} />
            <span>Admin Operations</span>
          </button>
        </div>

        {/* Key Metrics Banner */}
        <div className="hero-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrap"><Clock size={20} /></div>
            <div className="metric-val">0 min</div>
            <div className="metric-label">Counter Waiting Queue</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-wrap"><Zap size={20} /></div>
            <div className="metric-val">3.5x</div>
            <div className="metric-label">Faster Stall Turnover</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-wrap"><Award size={20} /></div>
            <div className="metric-val">100%</div>
            <div className="metric-label">Fresh & Steaming Handoffs</div>
          </div>
        </div>

        {/* 3D Visual Centerpiece */}
        <div className="hero-3d-wrapper">
          <div className="hero-3d-card">
            <img
              src="/hero-3d.jpg"
              alt="WukWay 3D Startup Product Visual"
              className="hero-3d-image"
            />
            <div className="glass-overlay-badge badge-top-left">
              <span className="live-pulse" />
              <span>Live Token: <strong>#WW-4821</strong></span>
            </div>
            <div className="glass-overlay-badge badge-bottom-right">
              <MapPin size={14} color="#FFC22E" />
              <span>North Campus Food Court · 3 min walk</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Walk-to-Cook Simulator */}
      <section className="interactive-simulator-section">
        <div className="section-intro">
          <span className="section-pill">TIMED COOKING ENGINE</span>
          <h2>Experience the Walk-to-Cook Algorithm</h2>
          <p>Drag your walking distance below to see how WukWay coordinates cooking to your exact arrival.</p>
        </div>

        <div className="simulator-card">
          <div className="slider-control-row">
            <label>🚶 Your Walking Distance from Class/Hostel:</label>
            <span className="slider-value-pill">{walkMinutes} Minutes Walk</span>
          </div>
          <input
            type="range"
            min="2"
            max="15"
            value={walkMinutes}
            onChange={(e) => setWalkMinutes(parseInt(e.target.value))}
            className="styled-range-slider"
          />

          <div className="simulator-timeline">
            <div className="timeline-step done">
              <div className="step-circle">1</div>
              <div className="step-info">
                <h4>Order Placed</h4>
                <p>Minute 0 · Token #WW-{walkMinutes * 314} issued</p>
              </div>
            </div>

            <div className="timeline-step active">
              <div className="step-circle">2</div>
              <div className="step-info">
                <h4>Kitchen Fires Order</h4>
                <p>At Minute {Math.max(0, walkMinutes - 4)} · Food starts sizzling</p>
              </div>
            </div>

            <div className="timeline-step highlight">
              <div className="step-circle">3</div>
              <div className="step-info">
                <h4>Steaming Hot Pickup</h4>
                <p>Minute {walkMinutes} · Grab from counter with 0 wait</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Role Platform Showcase */}
      <section id="roles" className="roles-showcase-section">
        <div className="section-intro">
          <span className="section-pill">FULL PIPELINE INTEGRATION</span>
          <h2>Built for the Entire Food Ecosystem</h2>
          <p>Every role has a tailored, high-speed interface designed to eliminate bottlenecks.</p>
        </div>

        {/* Role Tabs */}
        <div className="role-tabs-bar">
          <button
            className={`role-tab-btn ${activeRoleTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveRoleTab('customer')}
          >
            <User size={18} /> For Students (Customer App)
          </button>
          <button
            className={`role-tab-btn ${activeRoleTab === 'vendor' ? 'active' : ''}`}
            onClick={() => setActiveRoleTab('vendor')}
          >
            <Store size={18} /> For Food Stalls (Kitchen Display)
          </button>
          <button
            className={`role-tab-btn ${activeRoleTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveRoleTab('admin')}
          >
            <ShieldCheck size={18} /> For Campus Ops (Admin Hub)
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="role-tab-content-card">
          {activeRoleTab === 'customer' && (
            <div className="role-panel-grid">
              <div className="role-text-side">
                <div className="role-badge-tag">STUDENT & CUSTOMER EXPERIENCE</div>
                <h3>Order ahead, skip the crowd, eat hot.</h3>
                <p>Designed like Swiggy & Zomato with hyper-local campus food court precision:</p>
                <ul className="role-features-list">
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Walk-Time Distance Sorting:</strong> See stalls ordered by physical walking minutes.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Timed Cooking ETA Selector:</strong> Choose ~5m, ~10m, or ~15m arrival slots.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Live 4-Step Pickup Stepper:</strong> Track order from kitchen grill to counter.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Token #WW-XXXX:</strong> High-visibility flash token for instant handoff.</li>
                </ul>
                <button className="btn-primary-large" onClick={() => handleLaunchRole('customer')}>
                  <Smartphone size={18} /> Open Customer App (Port 8081) ➔
                </button>
              </div>

              <div className="role-mockup-side">
                <div className="app-preview-card">
                  <div className="app-preview-header">
                    <span>📱 WukWay Customer App</span>
                    <span className="live-dot" />
                  </div>
                  <div className="app-preview-body">
                    <div className="preview-dish-card">
                      <div className="dish-img-mock">🥟</div>
                      <div>
                        <h5>Steamed Chicken Momos</h5>
                        <p>Momo House · 2 min walk · ₹99</p>
                      </div>
                      <span className="badge-best">BESTSELLER</span>
                    </div>
                    <div className="preview-ticket-mock">
                      <span className="ticket-label">ACTIVE PICKUP TOKEN</span>
                      <div className="ticket-code">#WW-4821</div>
                      <span className="ticket-eta">⏱️ Ready in ~4 mins · Walk now!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'vendor' && (
            <div className="role-panel-grid">
              <div className="role-text-side">
                <div className="role-badge-tag vendor-tag">FOOD STALL & KITCHEN POS</div>
                <h3>A zero-hardware Kitchen Display for local stalls.</h3>
                <p>Turn any tablet, smartphone, or laptop into a commercial kitchen management system:</p>
                <ul className="role-features-list">
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Smart Cooking Queue:</strong> Grouped into Needs Cooking, Ready for Pickup, and Completed.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Customer Arrival ETA Badges:</strong> Cook orders according to customer walk time.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>1-Tap Verification:</strong> Verify the #WW token and hand over food with zero arguments.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Stall Availability Switch:</strong> Pause or resume accepting orders in 1 second.</li>
                </ul>
                <button className="btn-primary-large" onClick={() => handleLaunchRole('vendor')}>
                  <Store size={18} /> Open Kitchen Display POS (Port 8081) ➔
                </button>
              </div>

              <div className="role-mockup-side">
                <div className="app-preview-card vendor-card-bg">
                  <div className="app-preview-header">
                    <span>📟 Kitchen Display System</span>
                    <span className="status-open">● ACCEPTING</span>
                  </div>
                  <div className="app-preview-body">
                    <div className="vendor-order-mock">
                      <div className="v-order-top">
                        <span>Order #ORD-82 · <strong>WW-9557</strong></span>
                        <span className="eta-badge-pill">10 min walk</span>
                      </div>
                      <p className="v-order-items">2x Tibetan Momos · 1x Crispy Roll</p>
                      <button className="v-cook-btn">🔥 Start Cooking</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'admin' && (
            <div className="role-panel-grid">
              <div className="role-text-side">
                <div className="role-badge-tag admin-tag">CAMPUS OPERATIONS COMMAND</div>
                <h3>Complete governance, stall approvals & GMV metrics.</h3>
                <p>University admins and food court managers monitor real-time platform velocity:</p>
                <ul className="role-features-list">
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>1-Click Stall Approvals:</strong> Review and verify new vendor applications instantly.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Real-Time GMV & Orders:</strong> Live revenue tracking, avg pickup metrics, and peak volume alerts.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Live Order Streaming Feed:</strong> Monitor every ticket across all campus stalls.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> <strong>Menu Catalog Governance:</strong> Add, edit, or adjust pricing and dish tags on the fly.</li>
                </ul>
                <button className="btn-primary-large" onClick={() => handleLaunchRole('admin')}>
                  <ShieldCheck size={18} /> Open Admin Operations Hub ➔
                </button>
              </div>

              <div className="role-mockup-side">
                <div className="app-preview-card admin-card-bg">
                  <div className="app-preview-header">
                    <span>💻 Admin Operations Portal</span>
                    <span className="badge-admin-live">LIVE FEED</span>
                  </div>
                  <div className="app-preview-body">
                    <div className="admin-stats-mock">
                      <div className="a-stat">
                        <span>Total GMV</span>
                        <h4>₹1,48,200</h4>
                      </div>
                      <div className="a-stat">
                        <span>Active Stalls</span>
                        <h4>8 Verified</h4>
                      </div>
                    </div>
                    <div className="admin-approval-mock">
                      <span>🏪 Royal Biryani · Science Block</span>
                      <button className="admin-approve-btn">Approve Stall</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Vendor ROI Calculator */}
      <section id="calculator" className="calculator-section">
        <div className="section-intro">
          <span className="section-pill">VENDOR BUSINESS IMPACT</span>
          <h2>Calculate Your Revenue Boost During Lunch Rush</h2>
          <p>See how eliminating queue friction directly translates to more orders served per hour.</p>
        </div>

        <div className="calculator-card">
          <div className="calc-slider-box">
            <div className="calc-label-row">
              <label>Daily Lunch Rush Order Volume:</label>
              <span className="calc-value">{dailyRushOrders} orders / day</span>
            </div>
            <input
              type="range"
              min="30"
              max="400"
              step="10"
              value={dailyRushOrders}
              onChange={(e) => setDailyRushOrders(parseInt(e.target.value))}
              className="styled-range-slider"
            />
          </div>

          <div className="calc-results-grid">
            <div className="calc-result-item">
              <span className="calc-res-label">Queue Abandonment Prevented</span>
              <h3 className="calc-res-val">+35%</h3>
              <p className="calc-res-sub">Students who skip long lines will now order ahead</p>
            </div>
            <div className="calc-result-item highlight-card">
              <span className="calc-res-label">Estimated Extra Monthly Revenue</span>
              <h3 className="calc-res-val-big text-gradient">₹{extraRevenue.toLocaleString('en-IN')}</h3>
              <p className="calc-res-sub">Direct bottom-line growth from faster throughput</p>
            </div>
            <div className="calc-result-item">
              <span className="calc-res-label">Stall Setup Cost</span>
              <h3 className="calc-res-val text-green">₹0</h3>
              <p className="calc-res-sub">No proprietary POS hardware needed. Runs in browser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Bento Grid */}
      <section id="features" className="bento-section">
        <div className="section-intro">
          <span className="section-pill">CORE INNOVATIONS</span>
          <h2>Engineered for Campus Speed & Precision</h2>
          <p>Everything we built is optimized for 3-tap ordering and instant food handoffs.</p>
        </div>

        <div className="bento-grid">
          <div className="bento-card bento-wide">
            <div className="bento-icon"><Zap size={24} color="#FFC22E" /></div>
            <h3>Dynamic Arrival Coordination</h3>
            <p>
              Unlike traditional food delivery apps where food sits cold on a counter for 20 minutes, WukWay calculates your walking route and signals the kitchen so your dish finishes cooking within 60 seconds of your arrival.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon"><QrCode size={24} color="#E13328" /></div>
            <h3>Anti-Fraud Pickup Tokens</h3>
            <p>
              Every ticket gets a cryptographically generated high-contrast `#WW-XXXX` token code, preventing mix-ups and false pickups at crowded stalls.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon"><TrendingUp size={24} color="#4CAF50" /></div>
            <h3>Zero Surge & Zero Penalty</h3>
            <p>
              Students get transparent pricing with zero delivery fees, and local vendors keep 100% of their hard-earned menu revenue.
            </p>
          </div>

          <div className="bento-card bento-wide">
            <div className="bento-icon"><Utensils size={24} color="#FFC22E" /></div>
            <h3>Dietary & Allergen Precision</h3>
            <p>
              Clear Pure-Veg, Non-Veg, and Spice-Level indicators across every campus menu, with instant 1-tap filtering for quick decision-making between classes.
            </p>
          </div>
        </div>
      </section>

      {/* Launch CTA Banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <h2>Ready to Skip the Line Today?</h2>
          <p>Join hundreds of students and local food stalls transforming campus dining.</p>
          <div className="cta-banner-buttons">
            <button className="hero-btn-primary" onClick={() => handleLaunchRole('customer')}>
              <User size={18} /> Launch Customer App ➔
            </button>
            <button className="hero-btn-secondary" onClick={() => handleLaunchRole('vendor')}>
              <Store size={18} /> Register Food Stall
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="startup-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-logo-badge">
              <Flame className="flame-icon" size={20} />
            </div>
            <span className="brand-name">WukWay</span>
            <p className="footer-tagline">Order ahead. Skip the queue. Collect hot.</p>
          </div>

          <div className="footer-links-group">
            <h5>Portals</h5>
            <a href="https://wukway-app.vercel.app/customer">Customer App</a>
            <a href="https://wukway-app.vercel.app/vendor">Vendor Kitchen Display</a>
            <a href="/admin">Admin Operations</a>
          </div>


          <div className="footer-links-group">
            <h5>Product</h5>
            <a href="#how-it-works">How It Works</a>
            <a href="#calculator">ROI Calculator</a>
            <a href="#features">Innovation Bento</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} WukWay Technologies. Built for Next-Gen Campus Dining.</p>
          <div className="footer-status">
            <span className="live-dot" /> All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
