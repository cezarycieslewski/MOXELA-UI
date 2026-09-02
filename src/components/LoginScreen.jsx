import React, { useState } from 'react'
import { ASSET_BASE } from '../config'
import { API_BASE } from '../api/client'

function MoxelaWordmark({ height = 24 }) {
  return (
    <svg height={height} viewBox="396 332 125 32" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(397,332.052)">
        <path d="M13.1896 12.4977 21.9924 21.2076 22.0388 21.2076 30.8416 12.4977 30.8416 30.7536 27.5435 30.7536 27.5667 20.1391 27.4737 20.1391 22.0156 25.667 16.5574 20.1391 16.4644 20.1391 16.4877 30.7536 13.1896 30.7536Z" fill="white"/>
        <path d="M42.1055 31.1484C36.9259 31.1484 32.7685 27.1999 32.7685 22.0437 32.7685 16.8874 36.9259 12.9389 42.1055 12.9389 47.2617 12.9389 51.4425 16.8874 51.4425 22.0437 51.4425 27.1999 47.2617 31.1484 42.1055 31.1484ZM42.1055 16.028C38.8306 16.028 36.206 18.7687 36.206 22.0437 36.206 25.3419 38.8306 28.0592 42.1055 28.0592 45.4036 28.0592 48.005 25.3419 48.005 22.0437 48.005 18.7687 45.4036 16.028 42.1055 16.028Z" fill="white"/>
        <path d="M66.5527 30.7536 62.6043 30.7536 58.9114 24.8773 58.8184 24.8773 55.1021 30.7536 51.1536 30.7536 56.7746 22.0437 51.1536 13.3337 55.1021 13.3337 58.8184 19.2332 58.9114 19.2332 62.6043 13.3337 66.5527 13.3337 60.932 22.0437Z" fill="white"/>
        <path d="M80.4902 27.5947 80.4902 30.7536 67.6924 30.7536 67.6924 13.3337 80.4902 13.3337 80.4902 16.4926 70.9908 16.4926 70.9908 20.4411 78.8877 20.4411 78.8877 23.5998 70.9908 23.5998 70.9908 27.5947Z" fill="white"/>
        <path d="M94.4371 30.7536 82.4523 30.7536 82.4523 13.3337 85.7504 13.3337 85.7504 27.5947 94.4371 27.5947Z" fill="white"/>
        <path d="M107.085 28.2916 99.9085 28.2916 98.84 30.7536 95.0541 30.7536 103.508 12.4977 111.94 30.7536 108.154 30.7536 107.085 28.2916ZM101.256 25.2025 105.738 25.2025 103.555 20.1391 103.462 20.1391Z" fill="white"/>
      </g>
    </svg>
  )
}

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const inp = {
    width:'100%', background:'rgba(10,18,32,0.85)',
    border:'1px solid rgba(120,190,32,0.25)', borderRadius:6,
    padding:'10px 14px', fontSize:13, color:'#d0e4ff', outline:'none', marginBottom:14,
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/about`, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`)
      const info = await res.json()
      setLoading(false)
      onLogin({ username, serverVersion: info.version })
    } catch (err) {
      setLoading(false)
      setError(err.name === 'TimeoutError' ? 'Connection timed out' : `Cannot reach backend: ${err.message}`)
    }
  }

  return (
    <div style={{ width:'100vw', height:'100vh', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
      <img src={`${ASSET_BASE}login-bg.png`} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.55)' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(5,10,20,0.65) 0%,rgba(10,20,40,0.45) 100%)' }} />

      {/* Login card */}
      <div style={{ position:'relative', zIndex:2, width:380, background:'rgba(10,18,32,0.93)', border:'1px solid rgba(120,190,32,0.3)', borderRadius:12, backdropFilter:'blur(18px)', boxShadow:'0 24px 80px rgba(0,0,0,0.75)', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'28px 32px 20px', borderBottom:'2px solid #78BE20', background:'linear-gradient(180deg,rgba(120,190,32,0.09) 0%,transparent 100%)', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <img src={`${ASSET_BASE}moxela-icon.png`} alt="MOXELA" width={54} height={54} style={{ objectFit:'contain' }} />
          <MoxelaWordmark height={24} />
          <div style={{ fontSize:10, color:'#3a6050', letterSpacing:'0.14em', textTransform:'uppercase' }}>Workflow Designer</div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ padding:'24px 32px 20px' }}>
          <label style={{ fontSize:10, color:'#3a6050', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Username</label>
          <input style={inp} value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />

          <label style={{ fontSize:10, color:'#3a6050', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Password</label>
          <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />

          <div style={{ background:'rgba(120,190,32,0.06)', border:'1px solid rgba(120,190,32,0.15)', borderRadius:5, padding:'7px 10px', marginBottom:14, display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#78BE20', flexShrink:0 }} />
            <span style={{ fontSize:10, color:'#3a6050' }}>Backend: </span>
            <span style={{ fontSize:10, color:'#5a8060', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>stark.oslo.nevion.com</span>
          </div>

          {error && (
            <div style={{ background:'rgba(200,40,40,0.15)', border:'1px solid rgba(200,40,40,0.4)', borderRadius:5, padding:'8px 12px', fontSize:11, color:'#e08080', marginBottom:14 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width:'100%', background: loading ? '#3a5a20' : '#78BE20', border:'none', borderRadius:6, padding:'11px 0', fontSize:13, fontWeight:700, color:'#0a1208', cursor: loading ? 'wait' : 'pointer', letterSpacing:'0.04em' }}>
            {loading ? 'Connecting…' : 'Sign In'}
          </button>
        </form>

        {/* Footer — Nevion logo properly sized */}
        <div style={{ padding:'10px 32px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(120,190,32,0.1)' }}>
          <img src={`${ASSET_BASE}nevion-logo-white.png`} alt="Nevion" style={{ height:26, width:"auto", minWidth:145, opacity:0.75, display:"block" }} />
          <span style={{ fontSize:9, color:'#1a3028' }}>v1.1.0</span>
        </div>
      </div>
    </div>
  )
}
