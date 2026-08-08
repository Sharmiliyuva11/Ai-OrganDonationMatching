import { useMemo, useState } from 'react'
import { CalendarDays, Download, Search } from 'lucide-react'
import { predictionRecords, type PredictionRecord } from '../data'
import DataTable from '../components/DataTable'
import { FilterField, PageHeader, PortalButton, ScoreBar, StatCard, StatusBadge } from '../components/PortalPrimitives'

const perPage = 6

function downloadCsv(rows: PredictionRecord[]) {
  const headers = ['Prediction ID', 'Recipient', 'Donor', 'Organ', 'Compatibility', 'AI Confidence', 'Date', 'Status']
  const csv = [headers, ...rows.map(row => [row.id, `${row.recipient} (${row.recipientId})`, `${row.donor} (${row.donorId})`, row.organ, `${row.compatibility}%`, `${row.aiConfidence}%`, row.date, row.status])].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = 'organlink-prediction-history.csv'; link.click(); URL.revokeObjectURL(url)
}

export default function PredictionHistory() {
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [feedback, setFeedback] = useState('')

  const filtered = useMemo(() => predictionRecords.filter(row => { const query = search.toLowerCase(); const matchesSearch = !query || [row.id, row.recipient, row.recipientId, row.donor, row.donorId, row.organ].some(value => value.toLowerCase().includes(query)); return matchesSearch && (!date || row.date >= date) && (!status || row.status === status) }), [date, search, status])
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const rows = filtered.slice((page - 1) * perPage, page * perPage)
  const showFeedback = (message: string) => { setFeedback(message); window.setTimeout(() => setFeedback(''), 2300) }
  const setSearchAndReset = (value: string) => { setSearch(value); setPage(1) }

  return <div className="space-y-5">
    {feedback && <div role="status" className="fixed bottom-5 right-5 z-30 rounded-xl border border-[#b9e8dd] bg-white px-4 py-3 text-xs font-semibold text-portal-primary shadow-lg">{feedback}</div>}
    <PageHeader title="Prediction History" subtitle="Review previous donor-recipient compatibility predictions" actions={<PortalButton onClick={() => { downloadCsv(filtered); showFeedback('CSV export started.') }}><Download size={14} />Export CSV</PortalButton>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total Predictions" value="486" trend="+18%" helper="this quarter" icon="bot" /><StatCard label="Successful Matches" value="214" trend="+12%" helper="approved outcomes" icon="circle-check" /><StatCard label="Average Compatibility" value="88%" trend="+4%" helper="across predictions" icon="circle-check" /><StatCard label="AI Accuracy" value="94.6%" trend="+1.8%" helper="model confidence" icon="alert" /></div>
    <section className="portal-card p-4"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto] md:items-end"><FilterField label="Search predictions" icon={<Search size={14} />}><input value={search} onChange={event => setSearchAndReset(event.target.value)} placeholder="Search by ID, recipient, or donor..." className="portal-input w-full pl-9 pr-3 text-sm" /></FilterField><FilterField label="Date filter" icon={<CalendarDays size={14} />}><input type="date" value={date} onChange={event => { setDate(event.target.value); setPage(1) }} className="portal-input w-full px-3 text-xs" /></FilterField><FilterField label="Status"><select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }} className="portal-input w-full px-3 text-xs"><option value="">All statuses</option><option>Completed</option><option>Pending Review</option><option>Report Generated</option></select></FilterField><PortalButton variant="secondary" onClick={() => { setSearch(''); setDate(''); setStatus(''); setPage(1) }}>Reset</PortalButton></div></section>
    <DataTable ariaLabel="Prediction history" rows={rows} rowKey={row => row.id} columns={[{ key: 'id', header: 'Prediction ID', render: row => <span className="font-mono font-semibold text-portal-primary">{row.id}</span> }, { key: 'recipient', header: 'Recipient', render: row => <div><p className="font-medium">{row.recipient}</p><p className="mt-0.5 text-[10px] text-portal-muted">{row.recipientId}</p></div> }, { key: 'donor', header: 'Donor', render: row => <div><p className="font-medium">{row.donor}</p><p className="mt-0.5 text-[10px] text-portal-muted">{row.donorId}</p></div> }, { key: 'organ', header: 'Organ', render: row => <span className="font-medium">{row.organ}</span> }, { key: 'compatibility', header: 'Compatibility', render: row => <div className="flex min-w-28 items-center gap-2"><div className="flex-1"><ScoreBar label="" value={row.compatibility} /></div><span className="text-[10px] font-semibold">{row.compatibility}%</span></div> }, { key: 'aiConfidence', header: 'AI Confidence', render: row => <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-portal-info">{row.aiConfidence}%</span> }, { key: 'date', header: 'Date', render: row => <span className="whitespace-nowrap text-portal-muted">{row.date}</span> }, { key: 'status', header: 'Status', render: row => <StatusBadge status={row.status} /> }]} emptyDescription="Try adjusting your search or date/status filters." footer={<div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-[11px] text-portal-muted">Showing {filtered.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-1"><button onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-portal-border px-3 py-1.5 text-[11px] text-portal-muted disabled:opacity-40">Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map(number => <button key={number} onClick={() => setPage(number)} className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${number === page ? 'bg-portal-primary text-white' : 'border border-portal-border text-portal-muted hover:bg-portal-mint-soft'}`}>{number}</button>)}<button onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-lg border border-portal-border px-3 py-1.5 text-[11px] text-portal-muted disabled:opacity-40">Next</button></div></div>} />
  </div>
}
