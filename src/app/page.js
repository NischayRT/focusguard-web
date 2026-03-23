'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'How It Works', href: '#how' },
  { label: 'The AI', href: '#ai' },
  { label: 'Safety', href: '#safety' },
  { label: 'Technology', href: '#tech' },
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
    body: 'FocusGuard never saves, uploads, or transmits your webcam feed. Frames are captured, analyzed in under 200ms, then discarded immediately. Nothing persists beyond the analysis window.',
  },
  {
    title: 'Entirely local inference',
    icon: '○',
    body: 'The face detection model (MediaPipe FaceMesh) runs on your own hardware inside a PyInstaller-bundled binary. Your webcam data never leaves your machine — not to our servers, not to Google, not anywhere.',
  },
  {
    title: 'No biometric data stored',
    icon: '○',
    body: 'FocusGuard does not store facial geometry, embeddings, or any biometric identifiers. The only data saved per session is: duration, focused seconds, away seconds, and a per-minute focus percentage — no face data.',
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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        background: scrolled ? 'rgba(8,8,8,0.98)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}/>
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.14em', color: 'var(--text)' }}>FOCUSGUARD</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} style={{
              fontSize: 14, color: 'var(--muted)', letterSpacing: '0.06em',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >{l.label}</a>
          ))}
        </div>

        <a href="https://github.com/NischayRT/focusguard" target="_blank" rel="noreferrer" style={{
          fontSize: 14, color: 'var(--accent)', letterSpacing: '0.12em',
          textDecoration: 'none', padding: '7px 18px',
          border: '1px solid var(--accent)', borderRadius: 8,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.background = 'var(--accent)'; e.target.style.color = '#080808' }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--accent)' }}
        >
          DOWNLOAD
        </a>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 40px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}/>

        {/* Glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,240,74,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div className="fade-up-1" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 20,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          marginBottom: 32,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }}/>
          <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.12em' }}>
            AI GAZE DETECTION · LOCAL · PRIVATE
          </span>
        </div>

        <h1 className="fade-up-2" style={{
          fontSize: 'clamp(48px, 8vw, 96px)',
          fontWeight: 300, lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          maxWidth: 900,
          marginBottom: 28,
        }}>
          Your focus,<br/>
          <span style={{ color: 'var(--accent)' }}>under surveillance.</span>
        </h1>

        <p className="fade-up-3" style={{
          fontSize: 20, fontWeight: 300, color: 'var(--muted)',
          maxWidth: 560, lineHeight: 1.7, marginBottom: 36,
        }}>
          FocusGuard uses real-time AI gaze detection to measure exactly when you're
          working and when you drift — down to the second. No guesswork. No self-reporting.
        </p>

        <div className="fade-up-4" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <a href="#download" style={{
            padding: '12px 28px', borderRadius: 10, fontSize: 16,
            background: 'var(--accent)', color: '#080808', fontWeight: 500,
            textDecoration: 'none', letterSpacing: '0.08em',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.target.style.boxShadow = '0 0 32px rgba(200,240,74,0.35)'}
            onMouseLeave={e => e.target.style.boxShadow = 'none'}
          >
            Download for Windows
          </a>
          <a href="#how" style={{
            padding: '12px 28px', borderRadius: 10, fontSize: 16,
            border: '1px solid var(--border)', color: 'var(--muted)',
            textDecoration: 'none', letterSpacing: '0.08em',
            transition: 'color 0.2s',
            backdropFilter: 'blur(16px)',
          }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
          >
            See how it works →
          </a>
        </div>

        {/* Stat bar */}
        <div style={{
          marginTop: 80, display: 'flex', gap: 60,
          padding: '28px 48px',
          border: '1px solid var(--border)', borderRadius: 16,
          background: 'var(--surface)',
        }}>
          {[
            { val: '2s', label: 'Analysis interval' },
            { val: '468', label: 'Face landmarks tracked' },
            { val: '0ms', label: 'Data sent to cloud' },
            { val: '100%', label: 'Local processing' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 300, color: 'var(--accent)', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 64 }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 44, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15, maxWidth: 500 }}>
            Six steps from<br/>webcam to insight
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          {HOW_STEPS.map(({ step, title, body }) => (
            <div key={step} style={{
              padding: '32px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div className="mono" style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.12em', marginBottom: 16 }}>{step}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.01em' }}>{title}</div>
              <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The AI ── */}
      <section id="ai" style={{ padding: '100px 40px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>THE AI AGENT</div>
            <h2 style={{ fontSize: 44, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15, maxWidth: 600 }}>
              What is the AI actually doing?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 28 }}>
                FocusGuard's AI is not a black box. It is a deterministic, rule-based system built on top of
                MediaPipe FaceMesh — Google's open-source face landmark detection library. It does not learn
                from your data, does not adapt over time, and does not make probabilistic inferences about
                your emotional state or cognitive load.
              </p>
              <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 28 }}>
                Every two seconds while your timer is running, a single JPEG frame is captured from your
                webcam and sent to a local Flask server running on your machine at <span className="mono" style={{ color: 'var(--text)', fontSize: 15 }}>localhost:5000</span>.
                The server runs MediaPipe FaceMesh on the frame, which identifies 468 facial landmark
                coordinates in normalized (0–1) space.
              </p>
              <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.8 }}>
                From those 468 points, FocusGuard extracts three specific signals: <strong style={{ color: 'var(--text)', fontWeight: 500 }}>head yaw</strong> (left/right
                rotation), <strong style={{ color: 'var(--text)', fontWeight: 500 }}>head pitch</strong> (up/down tilt), and <strong style={{ color: 'var(--text)', fontWeight: 500 }}>eye aspect ratio</strong> (detecting closed
                eyes). If any threshold is exceeded, that second is marked as "away."
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
                { label: 'Inference time', val: '< 200ms', note: 'Per frame, on CPU, no GPU needed' },
                { label: 'Model size', val: '~29MB', note: 'face_landmarker.task, float16' },
              ].map(({ label, val, note }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--dim)', marginTop: 2 }}>{note}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 300, flexShrink: 0, marginLeft: 24 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What it cannot do */}
          <div style={{
            marginTop: 60, padding: '36px 40px',
            border: '1px solid var(--border)', borderRadius: 12,
            background: 'var(--surface)',
          }}>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 20, color: 'var(--text)' }}>
              What FocusGuard's AI cannot and does not do
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {[
                'Read emotions or expressions',
                'Identify who you are',
                'Store or transmit video',
                'Train on your data',
                'Access any other app',
                'Run when timer is off',
                'Connect to the internet',
                'Infer cognitive load',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--dim)', flexShrink: 0 }}/>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Safety ── */}
      <section id="safety" style={{ padding: '100px 40px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>SAFETY & PRIVACY</div>
            <h2 style={{ fontSize: 44, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Six safety guarantees
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 2 }}>
            {SAFETY_POINTS.map(({ title, body }) => (
              <div key={title} style={{
                padding: '36px 32px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}/>
                </div>
                <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)', marginBottom: 14, lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.75 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology ── */}
      <section id="tech" style={{ padding: '100px 40px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>TECHNOLOGY</div>
            <h2 style={{ fontSize: 44, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Full stack, open architecture
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 2, marginBottom: 60 }}>
            {TECH_STACK.map(({ name, role, detail }) => (
              <div key={name} style={{
                padding: '32px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 10 }}>{role.toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>{name}</div>
                <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7 }}>{detail}</div>
              </div>
            ))}
          </div>

          {/* Architecture diagram text */}
          <div style={{
            padding: '40px',
            border: '1px solid var(--border)', borderRadius: 12,
            background: 'var(--surface)',
          }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.12em', marginBottom: 24 }}>ARCHITECTURE FLOW</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
              {[
                { label: 'Webcam', sub: 'OS capture' },
                { label: 'Canvas', sub: 'JPEG frame' },
                { label: 'Flask API', sub: 'localhost:5000' },
                { label: 'MediaPipe', sub: '468 landmarks' },
                { label: 'Gaze Engine', sub: 'yaw + pitch + EAR' },
                { label: 'Score', sub: '0–100 rolling' },
                { label: 'React UI', sub: 'live display' },
                { label: 'Supabase', sub: 'on save only' },
              ].map(({ label, sub }, i, arr) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>{sub}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ fontSize: 18, color: 'var(--dim)', padding: '0 4px' }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Download CTA ── */}
      <section id="download" style={{
        padding: '100px 40px', borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 24 }}>GET STARTED</div>
          <h2 style={{ fontSize: 48, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 24 }}>
            Start measuring your focus
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 40 }}>
            Download FocusGuard for Windows. No subscription, no account required to use the timer.
            Sign in with Google to save and view your session history.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#" style={{
              padding: '16px 40px', borderRadius: 10, fontSize: 15,
              background: 'var(--accent)', color: '#080808', fontWeight: 500,
              textDecoration: 'none', letterSpacing: '0.08em',
            }}>
              Download for Windows
            </a>
            <Link href="/dashboard" style={{
              padding: '16px 40px', borderRadius: 10, fontSize: 15,
              border: '1px solid var(--border)', color: 'var(--muted)',
              textDecoration: 'none', letterSpacing: '0.08em',
            }}>
              View Dashboard
            </Link>
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--dim)' }}>
            Windows 10+ · ~250MB installer · Python bundled
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
          </div>
          <span className="mono" style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.12em' }}>FOCUSGUARD</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--dim)' }}>
          Built by Nischay Reddy Thigulla · {new Date().getFullYear()}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['GitHub', 'Privacy', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: 'var(--dim)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--muted)'}
              onMouseLeave={e => e.target.style.color = 'var(--dim)'}
            >{l}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}