import { useState } from 'react'
import { donors } from '../data'

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    'Available': 'bg-green-100 text-green-700',
    'Under Review': 'bg-amber-100 text-amber-700',
    'Not Available': 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

export default function DonorDatabase() {
  const [search, setSearch] = useState('')
  const [organFilter, setOrganFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 7

  const filtered = donors.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()) || d.hospital.toLowerCase().includes(search.toLowerCase())
    const matchOrgan = !organFilter || d.organ === organFilter
    const matchStatus = !statusFilter || d.status === statusFilter
    return matchSearch && matchOrgan && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const organs = [...new Set(donors.map(d => d.organ))]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, ID, or hospital..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select value={organFilter} onChange={e => { setOrganFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Organs</option>
            {organs.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Statuses</option>
            <option>Available</option>
            <option>Under Review</option>
            <option>Not Available</option>
          </select>
          <div className="text-xs text-slate-400 ml-auto">{filtered.length} records found</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Donor ID', 'Name', 'Blood Group', 'Organ', 'Hospital', 'HLA Score', 'Status', 'Doctor Verified', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{d.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{d.name}</div>
                  <div className="text-xs text-slate-400">{d.age}y · {d.gender} · {d.city}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">{d.bloodGroup}</span>
                </td>
                <td className="px-4 py-3 text-slate-700 font-medium">{d.organ}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{d.hospital}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${d.hlaScore}%` }}/>
                    </div>
                    <span className="text-xs text-slate-700 font-medium">{d.hlaScore}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={d.status}/></td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${d.doctorVerified ? 'text-green-600' : 'text-red-500'}`}>
                    {d.doctorVerified ? '✓ Verified' : '✗ Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="px-2.5 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors font-medium">View</button>
                    <button className="px-2.5 py-1 text-xs bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-medium">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paged.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <svg className="mx-auto mb-3 text-slate-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <p className="text-sm font-medium">No donors found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
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
