import { useState } from 'react'
import { donors, recipients } from '../data'

function ScoreBar({ label, value, color = 'bg-blue-500' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${value}%` }}/>
      </div>
      <span className="text-xs font-semibold text-slate-700 w-10 text-right">{value}%</span>
    </div>
  )
}

const rankRecipients = (donor: typeof donors[0]) => {
  return recipients
    .filter(r => r.status === 'Active' && r.requiredOrgan === donor.organ)
    .map(r => {
      const bloodMatch = r.bloodGroup === donor.bloodGroup ? 100 : 60
      const hlaScore = Math.round((donor.hlaScore + r.hlaScore) / 2)
      const urgencyScore = r.urgencyLevel === 'Critical' ? 100 : r.urgencyLevel === 'High' ? 80 : r.urgencyLevel === 'Medium' ? 60 : 40
      const waitScore = Math.min(100, Math.round(r.waitingDays / 4))
      const compatibility = Math.round((bloodMatch * 0.35 + hlaScore * 0.3 + urgencyScore * 0.2 + waitScore * 0.15))
      return { ...r, compatibility, bloodMatch, hlaScore, urgencyScore, waitScore }
    })
    .sort((a, b) => b.compatibility - a.compatibility)
}

export default function FindMatchingRecipient() {
  const [searchId, setSearchId] = useState('')
  const [donor, setDonor] = useState<typeof donors[0] | null>(null)
  const [results, setResults] = useState<ReturnType<typeof rankRecipients>>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const found = donors.find(d => d.id.toLowerCase() === searchId.toLowerCase())
    if (found) {
      setDonor(found)
      setResults(rankRecipients(found))
    } else {
      setDonor(null)
      setResults([])
    }
    setSearched(true)
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900 font-display mb-4">Search by Donor ID</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="e.g. D001, D002..."
            className="flex-1 max-w-md px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
            Find Matching Recipients
          </button>
          <button type="button" onClick={() => { setSearchId('D001'); setDonor(donors[0]); setResults(rankRecipients(donors[0])); setSearched(true) }} className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm rounded-lg transition-colors">
            Try D001
          </button>
        </form>
      </div>

      {donor && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded">{donor.id}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${donor.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{donor.status}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">{donor.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{donor.age} years · {donor.gender} · {donor.city}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">HLA Score</p>
              <p className="text-3xl font-bold text-slate-900 font-display">{donor.hlaScore}</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-green-200">
            {[
              { label: 'Organ', value: donor.organ },
              { label: 'Blood Group', value: donor.bloodGroup },
              { label: 'Organ Condition', value: donor.organCondition },
              { label: 'Infection', value: donor.infectionStatus },
              { label: 'Hospital', value: donor.hospital },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs text-slate-500">{f.label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center text-slate-400">
          <p className="text-sm font-medium">No matching recipients found</p>
          <p className="text-xs mt-1">{donor ? 'No active recipients need this organ type' : 'Donor ID not found'}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 font-display">{results.length} Compatible Recipients Found — Ranked by AI Priority</h3>
          {results.map((r, idx) => (
            <div key={r.id} className={`bg-white rounded-xl border shadow-sm p-5 ${idx === 0 ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold font-display flex-shrink-0 ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{r.id}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-700' : r.urgencyLevel === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.urgencyLevel}</span>
                        {idx === 0 && <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">Best Match</span>}
                      </div>
                      <h4 className="text-base font-semibold text-slate-900 mt-0.5">{r.name}</h4>
                      <p className="text-xs text-slate-500">{r.age}y · {r.gender} · {r.city} · Waiting {r.waitingDays} days</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-display" style={{ color: r.compatibility >= 90 ? '#16a34a' : r.compatibility >= 75 ? '#2563EB' : '#d97706' }}>{r.compatibility}%</div>
                      <div className="text-xs text-slate-400">AI Score</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <ScoreBar label="Blood Compatibility" value={r.bloodMatch} color={r.bloodMatch === 100 ? 'bg-green-500' : 'bg-amber-400'}/>
                    <ScoreBar label="HLA Score Match" value={r.hlaScore} color="bg-blue-500"/>
                    <ScoreBar label="Medical Urgency" value={r.urgencyScore} color="bg-red-500"/>
                    <ScoreBar label="Waiting Time Score" value={r.waitScore} color="bg-purple-500"/>
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-1">
                      <span>Blood: <strong className="text-slate-700">{r.bloodGroup}</strong></span>
                      <span>Needs: <strong className="text-slate-700">{r.requiredOrgan}</strong></span>
                      <span>HLA: <strong className="text-slate-700">{r.hlaScore}</strong></span>
                      <span>Hospital: <strong className="text-slate-700">{r.hospital}</strong></span>
                    </div>
                    <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">Approve Match</button>
                    <button className="px-4 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-lg transition-colors">View Details</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
