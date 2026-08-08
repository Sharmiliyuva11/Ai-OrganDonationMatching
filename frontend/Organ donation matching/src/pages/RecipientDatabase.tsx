import { useState } from 'react'
import { recipients } from '../data'

function PriorityBadge({ level }: { level: string }) {
  const cls: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-700 border border-red-200',
    'High': 'bg-orange-100 text-orange-700 border border-orange-200',
    'Medium': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'Low': 'bg-green-100 text-green-700 border border-green-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls[level] || ''}`}>
      {level}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    'Active': 'bg-blue-100 text-blue-700',
    'Matched': 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

export default function RecipientDatabase() {
  const [search, setSearch] = useState('')
  const [organFilter, setOrganFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 7

  const filtered = recipients.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())
    const matchOrgan = !organFilter || r.requiredOrgan === organFilter
    const matchUrgency = !urgencyFilter || r.urgencyLevel === urgencyFilter
    return matchSearch && matchOrgan && matchUrgency
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const organs = [...new Set(recipients.map(r => r.requiredOrgan))]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name or ID..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select value={organFilter} onChange={e => { setOrganFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Organs</option>
            {organs.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={urgencyFilter} onChange={e => { setUrgencyFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Urgency</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <div className="text-xs text-slate-400 ml-auto">{filtered.length} records found</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Recipient ID', 'Name', 'Required Organ', 'Blood Group', 'Urgency', 'Waiting Days', 'Hospital', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">{r.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{r.name}</div>
                  <div className="text-xs text-slate-400">{r.age}y · {r.gender} · {r.city}</div>
                </td>
                <td className="px-4 py-3 text-slate-700 font-medium">{r.requiredOrgan}</td>
                <td className="px-4 py-3">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded">{r.bloodGroup}</span>
                </td>
                <td className="px-4 py-3"><PriorityBadge level={r.urgencyLevel}/></td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-semibold ${r.waitingDays > 200 ? 'text-red-600' : r.waitingDays > 100 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {r.waitingDays}d
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{r.hospital}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status}/></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors font-medium">View</button>
                    <button className="px-2.5 py-1 text-xs bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-medium">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paged.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm font-medium">No recipients found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} className={`px-3 py-1 text-xs rounded-md ${n === page ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-xs border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
