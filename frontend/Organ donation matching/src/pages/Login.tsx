import { useState } from 'react'
import type { UserRole } from '../context'

const features = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
    title: 'AI Matching',
    desc: 'ML-powered donor-recipient compatibility scoring',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    title: 'Secure Clinical Access',
    desc: 'HIPAA-compliant hospital-grade security',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    title: 'Real-Time Compatibility',
    desc: 'Instant prediction scores across multiple factors',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    title: 'Clinical Decision Support',
    desc: 'Evidence-based recommendations for physicians',
  },
]

export default function Login({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('doctor')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin(role) }, 900)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left teal panel */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-12 relative overflow-hidden" style={{ background: '#0F766E' }}>
        {/* Subtle background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-20" style={{ background: '#2DD4BF' }}/>
          <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full opacity-15" style={{ background: '#14B8A6' }}/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5" style={{ background: '#2DD4BF' }}/>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold font-display">OrganAI</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white font-display leading-snug mb-5">
            AI-Powered Organ<br />Donation Matching<br />Platform
          </h1>
          <p className="text-white/75 text-base leading-relaxed max-w-sm">
            Helping healthcare professionals identify the most compatible organ donors using Artificial Intelligence and Machine Learning.
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {features.map((f) => (
            <div key={f.title} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-white mb-3">
                {f.icon}
              </div>
              <div className="text-white text-sm font-semibold mb-1">{f.title}</div>
              <div className="text-white/60 text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0F766E' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </div>
            <span className="font-bold font-display text-[#1F2937]">OrganAI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1F2937] font-display">Welcome back</h2>
            <p className="text-[#6B7280] text-sm mt-1">Sign in to your clinical dashboard</p>
          </div>

          {/* Role tabs */}
          <div className="flex bg-white border border-[#D1FAE5] rounded-xl p-1 mb-6">
            {(['doctor', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  role === r ? 'text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
                style={role === r ? { background: '#0F766E' } : {}}
              >
                {r === 'doctor' ? '👨‍⚕️ Doctor' : '🏥 Admin'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@hospital.pk' : 'doctor@hospital.pk'}
                  className="w-full pl-10 pr-4 py-3 border border-[#D1FAE5] rounded-xl text-sm text-[#1F2937] placeholder-[#9CA3AF] bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ '--tw-ring-color': '#0F766E' } as React.CSSProperties}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #0F766E33'}
                  onBlur={e => e.target.style.boxShadow = ''}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-[#D1FAE5] rounded-xl text-sm text-[#1F2937] placeholder-[#9CA3AF] bg-white focus:outline-none transition-all"
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #0F766E33'}
                  onBlur={e => e.target.style.boxShadow = ''}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded border-slate-300"/>
                <span className="text-sm text-[#6B7280]">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium" style={{ color: '#0F766E' }}>Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
              style={{ background: loading ? '#0F766E' : '#0F766E' }}
              onMouseEnter={e => !loading && ((e.target as HTMLElement).style.background = '#0a5c55')}
              onMouseLeave={e => ((e.target as HTMLElement).style.background = '#0F766E')}
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/></svg> Signing in...</>
              ) : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="text-center text-xs text-[#9CA3AF] mt-6">
            HIPAA-compliant · Encrypted · OrganAI v2.4.1
          </p>
        </div>
      </div>
    </div>
  )
}
