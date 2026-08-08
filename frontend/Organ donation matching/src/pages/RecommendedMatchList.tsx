import { useState } from 'react'
import { recommendedMatches } from '../data'

function PriorityBadge({ level }: { level: string }) {
  const cls: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-700 border border-red-200',
    'High': 'bg-orange-100 text-orange-700 border border-orange-200',
    'Medium': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'Low': 'bg-green-100 text-green-700 border border-green-200',
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cls[level] || ''}`}>{level}</span>
}

function CircularScore({ value, size = 72 }: { value: number; size?: number }) {
  const sw = 6
  const r = (size - sw) / 2
  const circ = r * 2 * Math.PI
  const dash = (value / 100) * circ
  const color = value >= 90 ? '#16a34a' : value >= 80 ? '#2563EB' : value >= 70 ? '#d97706' : '#dc2626'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#e2e8f0" strokeWidth={sw} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw} fill="none" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div className="absolute text-center">
        <div className="text-base font-bold" style={{ color }}>{value}%</div>
      </div>
    </div>
  )
}

function ProgressBar({ value, label, color = 'bg-blue-500' }: { value: number; label: string; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${value}%` }}/>
      </div>
    </div>
  )
}

type Match = typeof recommendedMatches[0]

function CompatibilityModal({ match, onClose }: { match: Match; onClose: () => void }) {
  const bloodScore = match.bloodCompatibility === 'Exact Match' ? 100 : 80
  const organScore = match.organCompatibility === 'Compatible' ? 100 : 60
  const hlaNum = parseInt(match.hlaMatch.split('/')[0])
  const hlaScore = Math.round((hlaNum / 6) * 100)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-500 font-mono">{match.recipientId} ↔ {match.donorId}</span>
              <PriorityBadge level={match.urgency}/>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Compatibility Analysis</h3>
            <p className="text-xs text-slate-400 mt-0.5">{match.recipientName} · {match.donorName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Top scores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-slate-50 rounded-xl p-4">
              <CircularScore value={match.compatibilityScore}/>
              <p className="text-xs font-semibold text-slate-600 mt-2">Compatibility Score</p>
            </div>
            <div className="text-center bg-slate-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-600 font-display mt-2">{match.aiPriorityScore}</div>
              <p className="text-xs text-slate-400 mt-0.5">/100</p>
              <p className="text-xs font-semibold text-slate-600 mt-2">AI Priority Score</p>
            </div>
            <div className="bg-blue-600 rounded-xl p-4 text-white text-center">
              <div className="text-lg font-bold font-display">Highly</div>
              <div className="text-lg font-bold font-display">Recommended</div>
              <div className="text-xs opacity-75 mt-1">AI Recommendation</div>
            </div>
          </div>

          {/* Compatibility bars */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Medical Compatibility Factors</h4>
            <ProgressBar label="Blood Compatibility" value={bloodScore} color={bloodScore === 100 ? 'bg-green-500' : 'bg-amber-400'}/>
            <ProgressBar label="Organ Compatibility" value={organScore} color="bg-blue-500"/>
            <ProgressBar label="HLA Match Score" value={hlaScore} color="bg-indigo-500"/>
            <ProgressBar label="Age Compatibility" value={Math.max(0, 100 - match.ageDiff * 3)} color="bg-teal-500"/>
          </div>

          {/* Status chips */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Blood Type', value: `${match.recipientBlood} ↔ ${match.donorBlood}`, ok: match.bloodCompatibility === 'Exact Match', chip: match.bloodCompatibility },
              { label: 'HLA Antigen Match', value: match.hlaMatch, ok: hlaNum >= 4, chip: `${hlaNum >= 4 ? 'Good' : 'Partial'} Match` },
              { label: 'Hospital', value: match.sameHospital ? 'Same Hospital' : 'Different Hospital', ok: match.sameHospital, chip: match.sameHospital ? 'Match' : 'Different' },
              { label: 'City', value: match.sameCity ? 'Same City' : 'Different City', ok: match.sameCity, chip: match.sameCity ? 'Match' : 'Different' },
              { label: 'Doctor Verification', value: match.doctorVerified ? 'Verified' : 'Pending', ok: match.doctorVerified, chip: match.doctorVerified ? 'Verified' : 'Pending' },
              { label: 'Organ Condition', value: match.organCondition, ok: match.organCondition === 'Excellent' || match.organCondition === 'Good', chip: match.organCondition },
              { label: 'Infection Status', value: match.infectionStatus, ok: match.infectionStatus === 'Negative', chip: match.infectionStatus },
              { label: 'Urgency Level', value: match.urgency, ok: true, chip: match.urgency },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3">
                <div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-900">{item.value}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${item.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {item.chip}
                </span>
              </div>
            ))}
          </div>

          {/* Waiting time */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Waiting Time</p>
              <p className="text-sm text-slate-700 mt-0.5">Recipient has been waiting for <strong>{match.waitingDays} days</strong></p>
            </div>
            <div className="text-3xl font-bold text-amber-600 font-display">{match.waitingDays}d</div>
          </div>

          {/* Final recommendation */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="text-sm font-bold text-green-700">Final AI Recommendation: APPROVE</span>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              Based on comprehensive analysis — blood compatibility, HLA matching, organ condition, urgency level, and waiting time — the AI system strongly recommends proceeding with this transplant match. Compatibility score of <strong>{match.compatibilityScore}%</strong> exceeds the clinical threshold.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Approve Match
            </button>
            <button className="flex-1 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors">
              Reject Match
            </button>
            <button onClick={onClose} className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecommendedMatchList() {
  const [activeModal, setActiveModal] = useState<Match | null>(null)
  const [matchStatuses, setMatchStatuses] = useState<Record<number, string>>(
    Object.fromEntries(recommendedMatches.map(m => [m.rank, m.status]))
  )

  const updateStatus = (rank: number, status: string) =>
    setMatchStatuses(s => ({ ...s, [rank]: status }))

  return (
    <div className="space-y-4 max-w-5xl">
      {activeModal && <CompatibilityModal match={activeModal} onClose={() => setActiveModal(null)}/>}

      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
        <span className="text-sm font-semibold text-purple-800">AI Recommended Match List</span>
        <span className="text-purple-600 text-sm">— Ranked by compatibility score and urgency</span>
      </div>

      {recommendedMatches.map((match) => {
        const isTop = match.rank === 1
        const status = matchStatuses[match.rank]
        return (
          <div
            key={match.rank}
            className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${
              isTop
                ? 'border-blue-300 ring-2 ring-blue-100 shadow-md'
                : 'border-slate-200 hover:shadow-md'
            }`}
          >
            {isTop && (
              <div className="flex items-center gap-2 mb-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg w-fit">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                #1 Top AI Recommendation
              </div>
            )}

            <div className="flex items-start gap-5">
              {/* Rank + Score */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-display ${isTop ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}>
                  #{match.rank}
                </div>
                <div>
                  <div className="text-center">
                    <div className="text-lg font-bold font-display" style={{ color: match.compatibilityScore >= 90 ? '#16a34a' : '#2563EB' }}>{match.compatibilityScore}%</div>
                    <div className="text-[10px] text-slate-400">compat.</div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Recipient</p>
                      <p className="text-sm font-bold text-slate-900">{match.recipientName}</p>
                      <p className="font-mono text-xs text-slate-400">{match.recipientId}</p>
                    </div>
                    <div className="flex items-center text-slate-300 mt-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Donor</p>
                      <p className="text-sm font-bold text-slate-900">{match.donorName}</p>
                      <p className="font-mono text-xs text-slate-400">{match.donorId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge level={match.urgency}/>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      status === 'Approved' ? 'bg-green-100 text-green-700' :
                      status === 'Rejected' ? 'bg-red-100 text-red-600' :
                      status === 'Under Review' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{status}</span>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-6 gap-3 mb-4">
                  {[
                    { label: 'AI Priority', value: match.aiPriorityScore, unit: '' },
                    { label: 'Waiting Days', value: match.waitingDays, unit: 'd' },
                    { label: 'Blood', value: match.bloodCompatibility === 'Exact Match' ? '100%' : '80%', unit: '' },
                    { label: 'HLA Match', value: match.hlaMatch, unit: '' },
                    { label: 'Organ', value: match.organCompatibility, unit: '' },
                    { label: 'Rec. Blood', value: match.recipientBlood, unit: '' },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-400">{m.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{m.value}{m.unit}</p>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveModal(match)} className="px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors border border-blue-200">
                    View Compatibility
                  </button>
                  {status !== 'Approved' && status !== 'Rejected' && (
                    <>
                      <button onClick={() => updateStatus(match.rank, 'Approved')} className="px-4 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold rounded-lg transition-colors border border-green-200">
                        Approve Match
                      </button>
                      <button onClick={() => updateStatus(match.rank, 'Rejected')} className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg transition-colors border border-red-200">
                        Reject Match
                      </button>
                    </>
                  )}
                  {(status === 'Approved' || status === 'Rejected') && (
                    <button onClick={() => updateStatus(match.rank, 'Pending')} className="px-4 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-medium rounded-lg transition-colors border border-slate-200">
                      Reset Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
