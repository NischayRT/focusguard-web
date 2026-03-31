'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'How It Works', href: '#how' },
  { label: 'The AI', href: '#ai' },
  { label: 'Safety', href: '#safety' },
  { label: 'Technology', href: '#tech' },
  { label: 'Contact', href: '#contact' },
  { label: 'Dashboard', href: '/dashboard' },
]

const TECH_STACK = [
  { name: 'MediaPipe FaceMesh', role: 'Face landmark detection', detail: '468 facial landmarks mapped in real time at ~30ms per frame. Runs entirely on your machine — no cloud.' },
  { name: 'OpenCV', role: 'Frame processing', detail: 'Decodes webcam frames, converts color spaces, and feeds processed images to the gaze estimator.' },
  { name: 'Flask + Python', role: 'Local AI server', detail: 'A lightweight HTTP server (localhost:5000) that Electron spawns silently. Receives frames, returns gaze data.' },
  { name: 'Electron', role: 'Desktop shell', detail: 'Wraps the Next.js renderer in a native window. Handles OS notifications, IPC, and the Python process lifecycle.' },
  { name: 'Next.js 15', role: 'UI framework', detail: 'React-based UI running inside Electron. Same codebase powers this website and the desktop app UI.' },
  { name: 'Supabase', role: 'Auth + database', detail: 'Google OAuth and Postgres for session history. Row-level security ensures users can only access their own data.' },
]

const SAFETY_POINTS = [
  {
    title: 'No video is ever stored',
    icon: '○',
    body: 'Drsti never saves, uploads, or transmits your webcam feed. Frames are captured, analyzed in under 200ms, then discarded immediately. Nothing persists beyond the analysis window.',
  },
  {
    title: 'Entirely local inference',
    icon: '○',
    body: 'The face detection model (MediaPipe FaceMesh) runs on your own hardware inside a PyInstaller-bundled binary. Your webcam data never leaves your machine — not to our servers, not to Google, not anywhere.',
  },
  {
    title: 'No biometric data stored',
    icon: '○',
    body: 'Drsti does not store facial geometry, embeddings, or any biometric identifiers. The only data saved per session is: duration, focused seconds, away seconds, and a per-minute focus percentage — no face data.',
  },
  {
    title: 'Open detection thresholds',
    icon: '○',
    body: 'The distraction thresholds (head yaw > 25°, pitch > 20°, eye aspect ratio < 0.18) are documented and adjustable. You can set sensitivity to strict, balanced, or relaxed in settings.',
  },
  {
    title: 'You control the camera',
    icon: '○',
    body: 'The webcam only activates when your focus timer is running. It stops the moment you pause or the session ends. The OS camera indicator light will always reflect this accurately.',
  },
  {
    title: 'Row-level security on all data',
    icon: '○',
    body: 'Every Supabase query is protected by RLS policies. Users can only read, write, and delete their own session rows. Even with a leaked anon key, no cross-user data access is possible.',
  },
]

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const CodeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
)

const HOW_STEPS = [
  { step: '01', title: 'Start the timer', body: 'Hit play on a focus session. The webcam activates and the AI engine begins sampling.' },
  { step: '02', title: 'Frame sampling', body: 'Every 2 seconds, a JPEG frame is sent from your webcam to the local Python API at localhost:5000.' },
  { step: '03', title: 'Landmark detection', body: 'MediaPipe FaceMesh maps 468 facial landmarks in the frame and returns their normalized coordinates.' },
  { step: '04', title: 'Gaze estimation', body: 'Head yaw and pitch are calculated from nose-to-eye ratios. Eye aspect ratio detects closed eyes.' },
  { step: '05', title: 'Focus scoring', body: 'Each frame is classified as focused or away. A 30-sample rolling window produces your live focus score (0–100).' },
  { step: '06', title: 'Session report', body: 'When the timer ends, you get a detailed breakdown: focused time, away time, per-minute chart, and a save option.' },
]

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState('idle') 

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setFormStatus('submitting')
    
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbz3OPky4HfShXveekQkjmnTXDW8zIwupVhC5Nk7fKVmSjiiyP0v4_HqewNz9pMfbYTPRw/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        setFormStatus('success')
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => setFormStatus('idle'), 5000)
      } else {
        setFormStatus('error')
      }
    } catch (error) {
      setFormStatus('error')
      setTimeout(() => setFormStatus('idle'), 5000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Navbar ── */}
      <nav className="nav-pad" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'var(--bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}/>
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.14em', color: 'var(--text)' }}>Drsti</span>
        </div>

        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} style={{
              fontSize: 14, color: 'var(--text-3)', letterSpacing: '0.06em',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-3)'}
            >{l.label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a className="hide-on-mobile" href="https://github.com/NischayRT/Drsti" target="_blank" rel="noreferrer" title="View Source on GitHub" style={{
            color: 'var(--text-3)', display: 'flex', alignItems: 'center', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <GithubIcon />
          </a>
          <a href="https://github.com/NischayRT/Drsti/releases/download/v1.0.0/Drsti-Setup-1.0.0.exe" target="_blank" rel="noreferrer" style={{
            fontSize: 14, color: 'var(--accent)', letterSpacing: '0.12em',
            textDecoration: 'none', padding: '7px 18px',
            border: '1px solid var(--accent)', borderRadius: 8,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.background = 'var(--accent)'; e.target.style.color = 'var(--bg)' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--accent)' }}
          >
            DOWNLOAD
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-pad" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)', backgroundSize: '60px 60px' }}/>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div className="fade-up-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: 32 }}>
          <div style={{ minWidth: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }}/>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.12em' }}>
  AI GAZE DETECTION 
  <br className="min-[426px]:hidden" /> {/* Hides the break as soon as the screen is 426px or wider */}
  · LOCAL · PRIVATE
</span>
        </div>

        <h1 className="fade-up-2" style={{
          fontSize: 'clamp(36px, 8vw, 96px)', fontWeight: 300, lineHeight: 1.05,
          letterSpacing: '-0.03em', color: 'var(--text)', maxWidth: 900, marginBottom: 28,
        }}>
          Your focus,<br/>
          <span style={{ color: 'var(--accent)' }}>under surveillance.</span>
        </h1>

        <p className="fade-up-3" style={{ fontSize: 18, fontWeight: 300, color: 'var(--text-3)', maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
          Drsti uses real-time AI gaze detection to measure exactly when you're
          working and when you drift — down to the second. No guesswork. No self-reporting.
        </p>

        <div className="fade-up-4 flex-col-mobile" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="https://github.com/NischayRT/Drsti/releases/download/v1.0.0/Drsti-Setup-1.0.0.exe" style={{
            padding: '12px 24px', borderRadius: 10, fontSize: 16, background: 'var(--accent)', color: 'var(--bg)', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.08em', transition: 'all 0.2s',
          }} onMouseEnter={e => e.target.style.boxShadow = '0 0 32px var(--accent-dim)'} onMouseLeave={e => e.target.style.boxShadow = 'none'}>
            Download for Windows
          </a>
          
          <a href="https://github.com/NischayRT/Drsti" target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '12px 24px', borderRadius: 10, fontSize: 16, border: '1px solid var(--border)', color: 'var(--text)', background: 'var(--surface)', textDecoration: 'none', letterSpacing: '0.08em', transition: 'border-color 0.2s', backdropFilter: 'blur(40px)',
          }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-3)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <GithubIcon />
            Source Code
          </a>

          <a href="#how" style={{
            padding: '12px 24px', borderRadius: 10, fontSize: 16, color: 'var(--text-3)', textDecoration: 'none', letterSpacing: '0.08em', transition: 'color 0.2s', backdropFilter: 'blur(40px)',
          }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-3)'}>
            See how it works →
          </a>
        </div>

        {/* Stat bar */}
        <div className="stat-row" style={{
          marginTop: 80, display: 'flex', gap: 60, flexWrap: 'wrap', justifyContent: 'center',
          padding: '28px 48px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)',
        }}>
          {[
            { val: '2s', label: 'Analysis interval' },
            { val: '468', label: 'Face landmarks tracked' },
            { val: '0ms', label: 'Data sent to cloud' },
            { val: '100%', label: 'Local processing' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 300, color: 'var(--accent)', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6, letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="section-pad" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 64 }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15, maxWidth: 500 }}>
            Six steps from<br/>webcam to insight
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
          {HOW_STEPS.map(({ step, title, body }) => (
            <div key={step} style={{
              padding: '32px', border: '1px solid var(--border)', background: 'var(--surface)', transition: 'border-color 0.2s',
            }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-3)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div className="mono" style={{ fontSize: 12, color: 'var(--text-4)', letterSpacing: '0.12em', marginBottom: 16 }}>{step}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.01em' }}>{title}</div>
              <div style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The AI ── */}
      <section id="ai" className="section-pad" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>THE AI AGENT</div>
            <h2 style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15, maxWidth: 600 }}>
              What is the AI actually doing?
            </h2>
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 16, color: 'var(--text-3)', lineHeight: 1.8, marginBottom: 28 }}>
                Drsti's AI is not a black box. It is a deterministic, rule-based system built on top of MediaPipe FaceMesh — Google's open-source face landmark detection library. It does not learn from your data, does not adapt over time, and does not make probabilistic inferences.
              </p>
              <p style={{ fontSize: 16, color: 'var(--text-3)', lineHeight: 1.8, marginBottom: 28 }}>
                Every two seconds while your timer is running, a single JPEG frame is captured from your webcam and sent to a local Flask server running on your machine at <span className="mono" style={{ color: 'var(--text)', fontSize: 14 }}>localhost:5000</span>. The server runs MediaPipe FaceMesh on the frame, which identifies 468 facial landmark coordinates in normalized (0–1) space.
              </p>
              <p style={{ fontSize: 16, color: 'var(--text-3)', lineHeight: 1.8 }}>
                From those 468 points, Drsti extracts three specific signals: <strong style={{ color: 'var(--text)', fontWeight: 500 }}>head yaw</strong> (left/right rotation), <strong style={{ color: 'var(--text)', fontWeight: 500 }}>head pitch</strong> (up/down tilt), and <strong style={{ color: 'var(--text)', fontWeight: 500 }}>eye aspect ratio</strong> (detecting closed eyes). If any threshold is exceeded, that second is marked as "away."
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { label: 'Head yaw threshold', val: '±25°', note: 'Turned more than 25° sideways' },
                { label: 'Head pitch threshold', val: '±20°', note: 'Looking more than 20° up or down' },
                { label: 'Eye aspect ratio', val: '< 0.18', note: 'Eyes closed or nearly closed' },
                { label: 'No face detected', val: '—', note: 'Face not found in frame = away' },
                { label: 'Sample interval', val: '2s', note: 'One frame analyzed every 2 seconds' },
                { label: 'Rolling window', val: '30 frames', note: 'Score based on last 60 seconds' },
              ].map(({ label, val, note }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 2 }}>{note}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 300, flexShrink: 0, marginLeft: 24 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 60, padding: '36px 40px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)' }}>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 20, color: 'var(--text)' }}>
              What Drsti's AI cannot and does not do
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {['Read emotions or expressions', 'Identify who you are', 'Store or transmit video', 'Train on your data', 'Access any other app', 'Run when timer is off', 'Connect to the internet', 'Infer cognitive load'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-4)', flexShrink: 0 }}/>
                  <span style={{ fontSize: 14, color: 'var(--text-3)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Safety ── */}
      <section id="safety" className="section-pad" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>SAFETY & PRIVACY</div>
            <h2 style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Six safety guarantees</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
            {SAFETY_POINTS.map(({ title, body }) => (
              <div key={title} style={{ padding: '36px 32px', border: '1px solid var(--border)', background: 'var(--bg)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}/>
                </div>
                <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)', marginBottom: 14, lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.75 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology ── */}
      <section id="tech" className="section-pad" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>TECHNOLOGY</div>
            <h2 style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Full stack, open architecture</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, marginBottom: 60 }}>
            {TECH_STACK.map(({ name, role, detail }) => (
              <div key={name} style={{ padding: '32px', border: '1px solid var(--border)', background: 'var(--surface)', transition: 'border-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-3)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 10 }}>{role.toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>{name}</div>
                <div style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7 }}>{detail}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '40px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)' }}>
            <div className="max-md:justify-self-center mono" style={{ fontSize: 12, color: 'var(--text-4)', letterSpacing: '0.12em', marginBottom: 24 }}>ARCHITECTURE FLOW</div>
            <div className="tech-flow content-center" style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
              {[
                { label: 'Webcam', sub: 'OS capture' },
                { label: 'Canvas', sub: 'JPEG frame' },
                { label: 'Flask API', sub: 'localhost:5000' },
                { label: 'MediaPipe', sub: '468 landmarks' },
                { label: 'Gaze Engine', sub: 'yaw + pitch + EAR' },
                { label: 'Score', sub: '0–100 rolling' },
                { label: 'React UI', sub: 'live display' },
              ].map(({ label, sub }, i, arr) => (
                <div key={label} className='max-md:flex-col' style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>{sub}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="tech-arrow" style={{ fontSize: 18, color: 'var(--text-4)', padding: '0 4px' }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact & Connect ── */}
      <section id="contact" className="section-pad" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 60 }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>CONNECT</div>
            <h2 style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 20 }}>
              Get in touch
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 40 }}>
              Have questions about the architecture? Found a bug? Just want to connect? Send a message or reach out on my socials.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {[
                { icon: <LinkedinIcon />, label: "LinkedIn", link: "https://www.linkedin.com/in/nischayrt/" },
                { icon: <GithubIcon />, label: "GitHub", link: "https://github.com/NischayRT" },
                { icon: <CodeIcon />, label: "LeetCode", link: "https://leetcode.com/u/user0322sl/" },
                { icon: <CodeIcon />, label: "CodeChef", link: "https://www.codechef.com/users/nischayreddy" },
                { icon: null, label: "Portfolio", link: "http://nischay-reddy.vercel.app/" },
              ].map((pill) => {
                const isPortfolio = pill.label === 'Portfolio';

                return (
                  <a key={pill.label} href={pill.link} target="_blank" rel="noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: isPortfolio ? '10px 20px' : '10px 16px', borderRadius: 30,
                    background: isPortfolio ? 'var(--accent)' : 'var(--surface)', 
                    border: `1px solid ${isPortfolio ? 'var(--accent)' : 'var(--border)'}`,
                    color: isPortfolio ? 'var(--bg)' : 'var(--text)', 
                    textDecoration: 'none', fontSize: 14, fontWeight: isPortfolio ? 600 : 500,
                    boxShadow: isPortfolio ? '0 0 20px var(--accent-dim)' : 'none',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { 
                      if(isPortfolio) { 
                        e.currentTarget.style.transform = 'translateY(-2px)'; 
                        e.currentTarget.style.boxShadow = '0 6px 24px var(--accent-dim)'; 
                      } else { 
                        e.currentTarget.style.borderColor = 'var(--accent)'; 
                        e.currentTarget.style.color = 'var(--accent)';
                      }
                    }}
                    onMouseLeave={e => { 
                      if(isPortfolio) { 
                        e.currentTarget.style.transform = 'translateY(0)'; 
                        e.currentTarget.style.boxShadow = '0 0 20px var(--accent-dim)'; 
                      } else { 
                        e.currentTarget.style.borderColor = 'var(--border)'; 
                        e.currentTarget.style.color = 'var(--text)';
                      }
                    }}
                  >
                    {isPortfolio ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    ) : pill.icon}
                    {pill.label}
                  </a>
                )
              })}
            </div>
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <form onSubmit={handleContactSubmit} style={{
              display: 'flex', flexDirection: 'column', gap: 16,
              padding: '36px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16
            }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Send a Message</div>
              <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontFamily: 'inherit', outline: 'none' }} />
              <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontFamily: 'inherit', outline: 'none' }} />
              <textarea placeholder="Message" required rows="4" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: 8, background: 'var(--bg-3)', resize: 'vertical', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontFamily: 'inherit', outline: 'none' }} />
              <button type="submit" disabled={formStatus === 'submitting'} style={{ padding: '16px', borderRadius: 8, fontSize: 15, marginTop: 8, cursor: formStatus === 'submitting' ? 'default' : 'pointer', background: 'var(--accent)', color: 'var(--bg)', fontWeight: 600, letterSpacing: '0.08em', border: 'none', transition: 'opacity 0.2s', opacity: formStatus === 'submitting' ? 0.7 : 1 }}>
                {formStatus === 'submitting' ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
              {formStatus === 'success' && <div style={{ fontSize: 13, color: 'var(--accent)', textAlign: 'center', marginTop: 4 }}>✓ Message sent successfully!</div>}
              {formStatus === 'error' && <div style={{ fontSize: 13, color: 'var(--red)', textAlign: 'center', marginTop: 4 }}>Failed to send. Please try again later.</div>}
            </form>
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer-pad" style={{
        borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
          </div>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-4)', letterSpacing: '0.12em' }}>Drsti</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-4)' }}>Built by Nischay Reddy Thigulla · {new Date().getFullYear()}</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="https://github.com/NischayRT/Drsti" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--text-4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-4)'}>GitHub</a>
          {['Privacy', 'Contact'].map(l => (
            <a key={l} href={l === 'Contact' ? '#contact' : '#'} style={{ fontSize: 13, color: 'var(--text-4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-4)'}>{l}</a>
          ))}
        </div>
      </footer>

      {/* ── Global Mobile Responsive Overrides ── */}
      <style>{`
        .section-pad { padding: 100px 40px; }
        .hero-pad { padding: 120px 40px 80px; }
        .nav-pad { padding: 0 40px; }
        .footer-pad { padding: 40px; }

        @media (max-width: 768px) {
          .section-pad { padding: 60px 20px !important; }
          .hero-pad { padding: 100px 20px 60px !important; }
          .nav-pad { padding: 0 20px !important; }
          .footer-pad { padding: 30px 20px !important; flex-direction: column; align-items: flex-start !important; gap: 20px; }
          
          .hide-on-mobile { display: none !important; }
          .flex-col-mobile { flex-direction: column !important; width: 100%; }
          .flex-col-mobile > a { width: 100%; justify-content: center; }
          
          .grid-2 { grid-template-columns: 1fr !important; gap: 40px !important; }
          .stat-row { flex-direction: column !important; gap: 30px !important; padding: 24px !important; }
          
          .tech-flow { flex-direction: column !important; gap: 8px !important; }
          .tech-arrow { transform: rotate(90deg); margin: 6px 0; }
        }
      `}</style>
    </div>
  )
}