import { useState } from 'react'
import { matchingQueue } from '../data'

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    'Pending': 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-amber-100 text-amber-700',
    'Approved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Completed': 'bg-slate-100 text-slate-600',
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls[status] || ''}`}>{status}</span>
}

function PriorityBadge({ level }: { level: string }) {
  const cls: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-700 border border-red-200',
    'High': 'bg-orange-100 text-orange-700 border border-orange-200',
    'Medium': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'Low': 'bg-green-100 text-green-700 border border-green-200',
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls[level] || ''}`}>{level}</span>
}

function ScoreRing({ value }: { value: number }) {
  const size = 44
  const sw = 4
  const r = (size - sw) / 2
  const circ = r * 2 * Math.PI
  const dash = (value / 100) * circ
  const color = value >= 90 ? '#16a34a' : value >= 75 ? '#2563EB' : '#d97706'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#e2e8f0" strokeWidth={sw} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw} fill="none" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>{value}%</span>
    </div>
  )
}

export default function AIMatchingQueue() {
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(matchingQueue.map(m => [m.id, m.status]))
  )
  const [filter, setFilter] = useState('')

  const updateStatus = (id: string, status: string) =>
    setStatuses(s => ({ ...s, [id]: status }))

  const filtered = matchingQueue.filter(m => !filter || statuses[m.id] === filter)

  const summaryCards = [
    { label: 'Pending Requests', value: matchingQueue.filter(m => statuses[m.id] === 'Pending').length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Critical Priority', value: matchingQueue.filter(m => m.urgency === 'Critical').length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'High Compatibility (≥90%)', value: matchingQueue.filter(m => m.compatibilityScore >= 90).length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Available Organs Today', value: 7, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Successful Matches', value: matchingQueue.filter(m => statuses[m.id] === 'Approved').length, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  ]

  return (
    <div className="space-y-5">
      {/* Live status indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
        <span className="text-slate-600 font-medium">AI Engine Live</span>
        <span className="text-slate-400">· Auto-refreshing every 30 seconds · Last updated 09:42 AM</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4`}>
            <p className={`text-3xl font-bold ${card.color} font-display`}>{card.value}</p>
            <p className="text-xs text-slate-600 mt-1 leading-tight">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-display">Live AI Matching Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">AI-ranked donor-recipient recommendations requiring clinical review</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option>Pending</option>
              <option>Under Review</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Recipient', 'Required Organ', 'Urgency', 'Waiting Days', 'Top Donor', 'Compatibility', 'AI Priority', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <span className="font-mono text-xs text-slate-400">{m.recipientId}</span>
                  <p className="font-medium text-slate-900 text-sm">{m.recipientName}</p>
                </td>
                <td className="px-4 py-4 font-medium text-slate-700">{m.requiredOrgan}</td>
                <td className="px-4 py-4"><PriorityBadge level={m.urgency}/></td>
                <td className="px-4 py-4">
                  <span className={`text-sm font-bold ${m.waitingDays > 250 ? 'text-red-600' : m.waitingDays > 150 ? 'text-amber-600' : 'text-slate-700'}`}>{m.waitingDays}d</span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-xs text-slate-400">{m.topDonorId}</span>
                  <p className="text-sm text-slate-700">{m.topDonorName}</p>
                </td>
                <td className="px-4 py-4">
                  <ScoreRing value={m.compatibilityScore}/>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${m.aiPriorityScore}%` }}/>
                    </div>
                    <span className="text-xs font-bold text-purple-700">{m.aiPriorityScore}</span>
                  </div>
                </td>
                <td className="px-4 py-4"><StatusBadge status={statuses[m.id]}/></td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    <button className="px-2.5 py-1 text-xs bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors border border-slate-200">View</button>
                    {statuses[m.id] === 'Pending' || statuses[m.id] === 'Under Review' ? (
                      <>
                        <button onClick={() => updateStatus(m.id, 'Approved')} className="px-2.5 py-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-md font-medium transition-colors border border-green-200">Approve</button>
                        <button onClick={() => updateStatus(m.id, 'Rejected')} className="px-2.5 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition-colors border border-red-200">Reject</button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
