import React, { useEffect, useRef, useState } from 'react';

/* Typewriter hook — cycles through a list of words */
const useTypewriter = (words, speed = 90, pause = 1800) => {
    const [display, setDisplay] = useState('');
    const [wordIdx, setWordIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const current = words[wordIdx];
        let timeout;
        if (!deleting && charIdx <= current.length) {
            timeout = setTimeout(() => {
                setDisplay(current.slice(0, charIdx));
                setCharIdx(c => c + 1);
            }, speed);
        } else if (!deleting && charIdx > current.length) {
            timeout = setTimeout(() => setDeleting(true), pause);
        } else if (deleting && charIdx >= 0) {
            timeout = setTimeout(() => {
                setDisplay(current.slice(0, charIdx));
                setCharIdx(c => c - 1);
            }, speed / 2);
        } else {
            setDeleting(false);
            setWordIdx(i => (i + 1) % words.length);
            setCharIdx(0);
        }
        return () => clearTimeout(timeout);
    }, [charIdx, deleting, wordIdx, words, speed, pause]);

    return display;
};

/* Animated count-up hook */
const useCountUp = (target, duration = 1800, suffix = '') => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            let start = 0;
            const step = Math.ceil(target / (duration / 16));
            const timer = setInterval(() => {
                start += step;
                if (start >= target) { setCount(target); clearInterval(timer); }
                else setCount(start);
            }, 16);
        }, { threshold: 0.4 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);
    return [count, ref];
};

const StatCounter = ({ target, suffix, label }) => {
    const [count, ref] = useCountUp(target);
    return (
        <div className="stat-item" ref={ref}>
            <div className="stat-item-number">{count}{suffix}</div>
            <div className="stat-item-label">{label}</div>
        </div>
    );
};

/* ───── Feature data ───── */
const features = [
    { icon: '📊', title: 'Live Operations Dashboard', desc: 'Centralised KPIs covering fleet utilisation, active dispatches, and fuel burn — updated without a page reload.' },
    { icon: '🚚', title: 'Smart Trip Dispatch', desc: 'Enforce cargo-weight limits, validate driver licences, and move trips through Draft → Dispatched → Completed in seconds.' },
    { icon: '🔧', title: 'Automated Maintenance Sync', desc: 'Log a service job and the vehicle status flips to In-Shop instantly. Closing the log auto-creates the expense record.' },
    { icon: '👤', title: 'Driver Compliance Engine', desc: 'Safety scores visualised in real time. Expired licences surface immediately in the compliance panel so nothing slips through.' },
    { icon: '💳', title: 'Expense Ledger', desc: 'Record fuel fills, road tolls, insurance, and other costs per vehicle. Litre-level fuel accuracy built in.' },
    { icon: '📈', title: 'ROI & CSV Analytics', desc: 'Per-vehicle ROI calculated from revenue, fuel, maintenance, and acquisition cost. One-click CSV export in the browser.' },
];

/* ───── Workflow steps ───── */
const steps = [
    { num: '01', title: 'Register Fleet', desc: 'Add vehicles with capacity, odometer and acquisition cost.' },
    { num: '02', title: 'Enrol Drivers', desc: 'Attach licence class, expiry and compliance score to each driver.' },
    { num: '03', title: 'Dispatch Trips', desc: 'Validate cargo, assign assets and send the trip live — in one form.' },
    { num: '04', title: 'Track & Analyse', desc: 'Complete trips, log costs, and review ROI on the reports panel.' },
];

/* ───── Role cards ───── */
const roles = [
    { icon: '🏢', role: 'Fleet Manager', color: '#818cf8', desc: 'Full access to every module — CRUD tools, dispatches, reports, maintenance.' },
    { icon: '🚘', role: 'Driver', color: '#34d399', desc: 'Monitor assigned trips, trigger completions, and review your own schedule.' },
    { icon: '🛡️', role: 'Safety Officer', color: '#fbbf24', desc: 'Inspect licence status, adjust safety scores, and resolve compliance issues.' },
    { icon: '💹', role: 'Financial Analyst', color: '#22d3ee', desc: 'Dive into expense ledgers, fuel efficiency data, and ROI breakdowns.' },
];

/* ───── Marquee items ───── */
const ticker = ['Vehicle Registry', 'Trip Dispatching', 'Driver Compliance', 'Maintenance Sync', 'Fuel Tracking', 'Expense Ledger', 'ROI Analytics', 'CSV Export', 'Role-Based Access', 'Smart KPI Dashboard'];

export default function Home({ onNavigate }) {
    const typed = useTypewriter(['Fleet Operations', 'Driver Compliance', 'Fuel Analytics', 'Trip Dispatches', 'ROI Management'], 80, 2000);

    return (
        <div className="landing-page-root">
            {/* ── Ambient orb FX ── */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* ── Sticky Nav ── */}
            <header className="landing-navbar">
                <div className="landing-nav-logo">
                    <span className="logo-icon">📦</span>
                    <span>TransitOps</span>
                </div>

                <nav className="landing-nav-links">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how" className="nav-link">How It Works</a>
                    <a href="#roles" className="nav-link">Roles</a>
                </nav>

                <div className="landing-nav-actions">
                    <button className="btn-ghost" onClick={() => onNavigate('login')}>Sign In</button>
                    <button className="btn btn-primary" onClick={() => onNavigate('signup')}>Get Started →</button>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="hero-section">
                <div className="hero-badge">🚀 v2.0 — Now with Live ROI Tracking</div>
                <h1 className="hero-heading">
                    Digitize your<br />
                    <span className="hero-typed">{typed}<span className="cursor">|</span>
                    </span>
                </h1>
                <p className="hero-sub">
                    A unified glassmorphic platform for transport companies to orchestrate fleets,
                    validate dispatches, enforce compliance, and compute vehicle-level ROI — all in one workspace.
                </p>

                <div className="hero-cta-row">
                    <button className="btn-primary-lg" onClick={() => onNavigate('signup')}>
                        Start Free Today
                    </button>
                    <button className="btn-outline-lg" onClick={() => onNavigate('login')}>
                        Enter Workspace ➔
                    </button>
                </div>

                <div className="hero-trust">
                    <span className="trust-dot" /> Runs on local MongoDB &nbsp;·&nbsp;
                    <span className="trust-dot" /> Zero external UI libraries &nbsp;·&nbsp;
                    <span className="trust-dot" /> JWT-secured RBAC
                </div>

                {/* Dashboard preview card */}
                <div className="hero-preview-card">
                    <div className="preview-bar">
                        <span className="preview-dot red" /><span className="preview-dot yellow" /><span className="preview-dot green" />
                        <span className="preview-url">localhost:3000 — Dashboard</span>
                    </div>
                    <div className="preview-kpis">
                        {[
                            { label: 'Active Vehicles', val: '12', color: '#34d399' },
                            { label: 'Trips Today', val: '8', color: '#818cf8' },
                            { label: 'Utilization', val: '94%', color: '#22d3ee' },
                            { label: 'Fleet ROI', val: '18%', color: '#fbbf24' },
                        ].map(k => (
                            <div className="preview-kpi-item" key={k.label}>
                                <span className="preview-kpi-val" style={{ color: k.color }}>{k.val}</span>
                                <span className="preview-kpi-label">{k.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="preview-bars">
                        {[75, 50, 88, 62, 94, 41].map((w, i) => (
                            <div className="preview-bar-row" key={i}>
                                <div className="preview-bar-fill" style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="landing-stats-bar">
                <div className="stats-bar-container">
                    <StatCounter target={1200} suffix="+" label="Vehicles Managed" />
                    <StatCounter target={40000} suffix="+" label="Trips Completed" />
                    <StatCounter target={98} suffix="%" label="Fleet Utilization" />
                    <StatCounter target={18} suffix="%" label="Average ROI Gain" />
                    <StatCounter target={4} suffix=" Roles" label="Access Tiers" />
                </div>
            </section>

            {/* ── Marquee ticker ── */}
            <div className="marquee-wrapper">
                <div className="marquee-track">
                    {[...ticker, ...ticker].map((t, i) => (
                        <span className="marquee-item" key={i}>
                            <span className="marquee-dot" />
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Features ── */}
            <section id="features" className="section-container">
                <div className="section-label">Platform Capabilities</div>
                <h2 className="section-title">Everything your fleet needs — in one place</h2>
                <p className="section-sub">Six tightly integrated modules that cover the entire transport operations lifecycle.</p>

                <div className="landing-features-grid">
                    {features.map((f, i) => (
                        <div className="feature-glass-card" key={i} style={{ '--delay': `${i * 0.08}s` }}>
                            <div className="feature-icon-box">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                            <div className="feature-arrow">→</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how" className="section-container" style={{ background: 'rgba(0,0,0,0.2)', padding: '5rem 8%', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                <div className="section-label">Process</div>
                <h2 className="section-title">Up and running in four steps</h2>

                <div className="steps-grid">
                    {steps.map((s, i) => (
                        <div className="step-card" key={i}>
                            <div className="step-num">{s.num}</div>
                            <div className="step-connector" style={{ display: i < steps.length - 1 ? 'block' : 'none' }} />
                            <h3 className="step-title">{s.title}</h3>
                            <p className="step-desc">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Role Cards ── */}
            <section id="roles" className="section-container">
                <div className="section-label">Access Control</div>
                <h2 className="section-title">Four roles, perfectly scoped</h2>
                <p className="section-sub">JWT-secured RBAC ensures every user sees exactly what they need — nothing more, nothing less.</p>

                <div className="roles-grid">
                    {roles.map((r, i) => (
                        <div className="role-card" key={i} style={{ '--role-color': r.color }}>
                            <div className="role-icon">{r.icon}</div>
                            <h3 className="role-name" style={{ color: r.color }}>{r.role}</h3>
                            <p className="role-desc">{r.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="cta-banner">
                <div className="cta-glow" />
                <h2 className="cta-title">Ready to digitize your fleet?</h2>
                <p className="cta-sub">Create an account in seconds. No credit card, no subscriptions — just your local MongoDB and your browser.</p>
                <div className="hero-cta-row" style={{ justifyContent: 'center', marginTop: '2.5rem' }}>
                    <button className="btn-primary-lg" onClick={() => onNavigate('signup')}>Create Free Account</button>
                    <button className="btn-outline-lg" onClick={() => onNavigate('login')}>Already have one? Sign in</button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div className="landing-nav-logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                    <span>📦</span> TransitOps
                </div>
                <p>&copy; {new Date().getFullYear()} TransitOps Logistics Systems Inc. All rights reserved.</p>
                <p style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>
                    Built with React, Node.js, Express &amp; MongoDB · Custom Glassmorphic CSS · No external UI libraries
                </p>
            </footer>
        </div>
    );
}
