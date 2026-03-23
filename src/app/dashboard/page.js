'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserSessions, deleteSession } from '../../lib/supabase'

function fmt(sec) {
  if (!sec || sec === 0) return '0s'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`
  return `${s}s`
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
function gradeColor(pct) {
  if (pct >= 90) return '#c8f04a'
  if (pct >= 70) return '#4af0d4'
  if (pct >= 50) return '#f0c84a'
  return '#f06a4a'
}
function gradeLabel(pct) {
  if (pct >= 90) return 'Excellent'
  if (pct >= 70) return 'Good'
  if (pct >= 50) return 'Fair'
  return 'Keep going'
}

export default function DashboardPage() {
  const [user,     setUser]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [sessions, setSessions] = useState([])
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [filter,   setFilter]   = useState('all') // all | week | month

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) loadSessions()
      else setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadSessions()
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadSessions() {
    setLoading(true)
    const { data } = await getUserSessions(200)
    setSessions(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    setDeleting(id)
    await deleteSession(id)
    setSessions(s => s.filter(x => x.id !== id))
    if (selected?.id === id) setSelected(null)
    setDeleting(null)
  }

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    })
  }

  // Filter sessions
  const now = new Date()
  const filtered = sessions.filter(s => {
    const d = new Date(s.created_at)
    if (filter === 'week') return (now - d) < 7 * 86400000
    if (filter === 'month') return (now - d) < 30 * 86400000
    return true
  })

  // Stats
  const totalSessions = filtered.length
  const totalFocus    = filtered.reduce((a, s) => a + (s.focus_time || 0), 0)
  const avgFocusPct   = totalSessions > 0 ? Math.round(filtered.reduce((a, s) => a + (s.focus_pct || 0), 0) / totalSessions) : 0
  const bestSession   = filtered.reduce((best, s) => (!best || s.focus_pct > best.focus_pct) ? s : best, null)

  // Group by date
  const grouped = filtered.reduce((acc, s) => {
    const day = new Date(s.created_at).toDateString()
    if (!acc[day]) acc[day] = []
    acc[day].push(s)
    return acc
  }, {})

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, background: 'var(--bg)', padding: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}/>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.18em' }}>Focusguard</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em', textAlign: 'center' }}>Your session dashboard</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', textAlign: 'center', maxWidth: 400, lineHeight: 1.7 }}>
          Sign in with the same Google account you use in the desktop app to view your focus history.
        </p>
        <button onClick={signIn} style={{
          padding: '14px 36px', borderRadius: 10, fontSize: 15,
          background: 'var(--accent)', color: '#080808', fontWeight: 500,
          border: 'none', cursor: 'pointer', letterSpacing: '0.08em',
        }}>
          Sign in with Google
        </button>
        <Link href="/" style={{ fontSize: 14, color: 'var(--dim)', textDecoration: 'none' }}>← Back to home</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Navbar */}
      <nav style={{
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', borderBottom: '1px solid var(--border)',
        background: 'rgba(8,8,8,0.95)', position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}/>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.18em', color: 'var(--text)' }}>Focusguard</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user.user_metadata?.avatar_url
            ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: 30, height: 30, borderRadius: 8 }}/>
            : <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#080808', fontWeight: 600 }}>
                {user.email?.[0].toUpperCase()}
              </div>
          }
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
          <button onClick={() => supabase.auth.signOut()} style={{
            padding: '6px 14px', borderRadius: 7, fontSize: 12,
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--dim)', cursor: 'pointer', letterSpacing: '0.1em',
            fontFamily: 'var(--font-mono)',
          }}>
            SIGN OUT
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 8 }}>Session History</h1>
            <p style={{ fontSize: 15, color: 'var(--muted)' }}>{totalSessions} sessions recorded</p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['all', 'week', 'month'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13,
                background: filter === f ? 'var(--surface)' : 'transparent',
                border: `1px solid ${filter === f ? '#2a2a2a' : 'var(--border)'}`,
                color: filter === f ? 'var(--text)' : 'var(--dim)',
                cursor: 'pointer', letterSpacing: '0.08em',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.15s',
              }}>
                {f === 'all' ? 'ALL TIME' : f === 'week' ? 'THIS WEEK' : 'THIS MONTH'}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'Total Sessions',  val: totalSessions || '—' },
            { label: 'Total Focus Time', val: fmt(totalFocus) },
            { label: 'Avg Focus Score',  val: totalSessions ? `${avgFocusPct}%` : '—', color: avgFocusPct ? gradeColor(avgFocusPct) : undefined },
            { label: 'Best Session',     val: bestSession ? `${bestSession.focus_pct}%` : '—', color: bestSession ? gradeColor(bestSession.focus_pct) : undefined },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ padding: '24px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 300, color: color || 'var(--accent)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{val}</div>
            </div>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--dim)', fontSize: 14, letterSpacing: '0.14em', fontFamily: 'var(--font-mono)' }}>
            LOADING...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <p style={{ fontSize: 16, color: 'var(--dim)' }}>No sessions found for this period.</p>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginTop: 8 }}>Complete a focus session in the desktop app to see it here.</p>
          </div>
        )}

        {/* Session list + detail panel */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

            {/* List */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {Object.entries(grouped).map(([day, daySessions]) => (
                <div key={day} style={{ marginBottom: 32 }}>
                  <div style={{
                    fontSize: 12, color: 'var(--dim)', letterSpacing: '0.16em',
                    marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {day.toUpperCase()}
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
                    <span style={{ color: '#1e1e1e' }}>{daySessions.length} session{daySessions.length > 1 ? 's' : ''}</span>
                  </div>

                  {daySessions.map(s => {
                    const isSelected = selected?.id === s.id
                    return (
                      <div key={s.id} onClick={() => setSelected(isSelected ? null : s)} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 20px', marginBottom: 6, borderRadius: 12, cursor: 'pointer',
                        background: isSelected ? '#111' : 'var(--surface)',
                        border: `1px solid ${isSelected ? '#222' : 'var(--border)'}`,
                        transition: 'all 0.15s',
                      }}>
                        {/* Score circle */}
                        <div style={{
                          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${gradeColor(s.focus_pct)}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: 14, color: gradeColor(s.focus_pct), fontFamily: 'var(--font-mono)', fontWeight: 300 }}>
                            {s.focus_pct}%
                          </span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>
                            {fmt(s.duration)} session
                          </div>
                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, color: '#c8f04a' }}>{fmt(s.focus_time)} focused</span>
                            <span style={{ fontSize: 13, color: 'var(--dim)' }}>{fmtTime(s.created_at)}</span>
                            {s.breaks_taken > 0 && (
                              <span style={{ fontSize: 13, color: 'var(--dim)' }}>{s.breaks_taken} break{s.breaks_taken > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>

                        <div style={{ fontSize: 13, color: gradeColor(s.focus_pct), flexShrink: 0 }}>
                          {gradeLabel(s.focus_pct)}
                        </div>

                        <button onClick={e => { e.stopPropagation(); handleDelete(s.id) }}
                          disabled={deleting === s.id}
                          style={{
                            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                            background: 'transparent', border: '1px solid var(--border)',
                            color: 'var(--dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f06a4a40'; e.currentTarget.style.color = '#f06a4a' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div style={{ width: 280, flexShrink: 0, position: 'sticky', top: 80 }}>
              {selected ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>DETAILS</div>
                    <div style={{ fontSize: 14, color: 'var(--muted)' }}>{fmtDate(selected.created_at)}</div>
                    <div style={{ fontSize: 13, color: 'var(--dim)' }}>{fmtTime(selected.created_at)}</div>
                  </div>

                  <div style={{ padding: '24px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 52, color: gradeColor(selected.focus_pct), fontWeight: 300, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                      {selected.focus_pct}%
                    </div>
                    <div style={{ fontSize: 13, color: gradeColor(selected.focus_pct), marginTop: 8, letterSpacing: '0.1em' }}>
                      {gradeLabel(selected.focus_pct).toUpperCase()}
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px' }}>
                    {[
                      { label: 'DURATION',  val: fmt(selected.duration) },
                      { label: 'FOCUSED',   val: fmt(selected.focus_time),  color: '#c8f04a' },
                      { label: 'AWAY',      val: fmt(Math.max(0, selected.duration - selected.focus_time)), color: '#f06a4a' },
                      { label: 'BREAKS',    val: selected.breaks_taken || 0 },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 0', borderBottom: '1px solid #0f0f0f',
                      }}>
                        <span style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>{label}</span>
                        <span style={{ fontSize: 15, color: color || 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 300 }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline chart */}
                  {selected.timeline?.length > 0 && (
                    <div style={{ padding: '16px 20px 24px' }}>
                      <div style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>MINUTE BY MINUTE</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
                        {selected.timeline.map(({ minute, focus_pct }) => (
                          <div key={minute} title={`Min ${minute + 1}: ${focus_pct}%`} style={{
                            flex: 1, borderRadius: 2, minWidth: 4,
                            height: `${Math.max(focus_pct, 5)}%`,
                            background: gradeColor(focus_pct),
                            opacity: 0.85,
                          }}/>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: 28, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.8 }}>Select a session<br/>to see details</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}