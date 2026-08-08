import { useState } from 'react'
import { ArrowUpRight, CalendarDays, FileText, RefreshCw, Search, Sparkles, Stethoscope, UserRoundPlus, Zap } from 'lucide-react'
import { useNav } from '../context'
import { dashboardCases, dashboardStats, donorRecommendations, notifications, upcomingSurgeries, scheduleItems, quickActions } from '../data'
import DataTable from '../components/DataTable'
import MatchCard from '../components/MatchCard'
import NotificationCard from '../components/NotificationCard'
import ScheduleCard from '../components/ScheduleCard'
import { PageHeader, PortalButton, StatCard, StatusBadge } from '../components/PortalPrimitives'

const quickIcons = { zap: Zap, search: Search, file: FileText, calendar: CalendarDays }

export default function DoctorDashboard() {
  const { navigate } = useNav()
  const [feedback, setFeedback] = useState('')
  const [refreshed, setRefreshed] = useState(false)

  const showFeedback = (message: string) => {
    setFeedback(message)
    window.setTimeout(() => setFeedback(''), 2500)
  }

  return <div className="space-y-5">
    {feedback && <div role="status" className="fixed bottom-5 right-5 z-30 rounded-xl border border-[#b9e8dd] bg-white px-4 py-3 text-xs font-semibold text-portal-primary shadow-lg">{feedback}</div>}
    <PageHeader
      title="Good morning, Dr. Ayesha Raza"
      subtitle="Transplant Surgeon · St. Mary Institute of Transplant Medicine"
      actions={<><PortalButton variant="secondary" onClick={() => showFeedback('New case workflow is ready to connect.') }><UserRoundPlus size={14} />New Case</PortalButton><PortalButton onClick={() => navigate('ai-match-prediction')}><Sparkles size={14} />Run AI Prediction</PortalButton></>}
    />

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{dashboardStats.map(stat => <div key={stat.label}><StatCard {...stat} /></div>)}</div>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.82fr)]">
      <div className="min-w-0 space-y-5">
        <section className="portal-card overflow-hidden" aria-labelledby="cases-heading">
          <div className="portal-section-header flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5"><div><h3 id="cases-heading" className="text-sm font-semibold text-portal-ink">Recent Patient Cases</h3><p className="mt-0.5 text-[11px] text-portal-muted">Latest recipients registered under your care</p></div><button onClick={() => showFeedback('Showing all recipient cases.')} className="inline-flex items-center gap-1 text-xs font-semibold text-portal-muted hover:text-portal-primary">View all <ArrowUpRight size={14} /></button></div>
          <DataTable
            ariaLabel="Recent recipient cases"
            rows={dashboardCases}
            rowKey={row => row.id}
            columns={[
              { key: 'id', header: 'Recipient ID', render: row => <span className="font-mono font-semibold text-portal-primary">{row.id}</span> },
              { key: 'name', header: 'Patient Name', render: row => <span className="font-medium">{row.name}</span> },
              { key: 'requiredOrgan', header: 'Required Organ' },
              { key: 'bloodGroup', header: 'Blood Group', render: row => <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold">{row.bloodGroup}</span> },
              { key: 'urgency', header: 'Urgency', render: row => <StatusBadge status={row.urgency} /> },
              { key: 'status', header: 'Status', render: row => <span className="whitespace-nowrap text-[11px] text-portal-muted">{row.status}</span> },
            ]}
          />
        </section>

        <section className="portal-card overflow-hidden" aria-labelledby="matches-heading">
          <div className="portal-section-header flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5"><div><h3 id="matches-heading" className="text-sm font-semibold text-portal-ink">AI Recommended Matches</h3><p className="mt-0.5 text-[11px] text-portal-muted">Top donor candidates ranked by the matching engine</p></div><button onClick={() => { setRefreshed(true); window.setTimeout(() => setRefreshed(false), 1400) }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-portal-muted hover:text-portal-primary"><RefreshCw size={13} className={refreshed ? 'animate-spin' : ''} />{refreshed ? 'Refreshing' : 'Refresh'}</button></div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">{donorRecommendations.map(donor => <MatchCard key={donor.id} donor={donor} onView={() => showFeedback(`${donor.id} details opened.`)} onGenerate={() => showFeedback(`Report generation started for ${donor.id}.`)} />)}</div>
        </section>
      </div>

      <aside className="min-w-0 space-y-5"><ScheduleCard items={scheduleItems} /><NotificationCard items={notifications} />
        <section className="portal-card overflow-hidden" aria-labelledby="surgeries-heading"><div className="portal-section-header flex items-center gap-2 px-4 py-3"><Stethoscope size={15} className="text-portal-primary" /><h3 id="surgeries-heading" className="text-sm font-semibold text-portal-ink">Upcoming Surgeries</h3></div><div className="space-y-2 p-3">{upcomingSurgeries.map(surgery => <div key={surgery.patient} className="flex items-center justify-between gap-2 rounded-xl border border-portal-border px-3 py-2.5"><div className="min-w-0"><p className="truncate text-[11px] font-semibold text-portal-ink">{surgery.patient}</p><p className="truncate text-[10px] text-portal-muted">{surgery.organ} · {surgery.dateLabel}</p></div><span className="shrink-0 rounded-full bg-portal-mint px-2 py-1 text-[10px] font-semibold text-portal-primary">{surgery.operatingTheatre}</span></div>)}</div></section>
        <section className="portal-card overflow-hidden" aria-labelledby="quick-actions-heading"><div className="portal-section-header flex items-center gap-2 px-4 py-3"><Zap size={15} className="text-portal-primary" /><h3 id="quick-actions-heading" className="text-sm font-semibold text-portal-ink">Quick Actions</h3></div><div className="grid grid-cols-2 gap-2 p-3">{quickActions.map(action => { const Icon = quickIcons[action.icon as keyof typeof quickIcons]; return <button key={action.label} onClick={() => navigate(action.page)} className="group rounded-xl border border-portal-border p-3 text-left transition-colors hover:border-[#b9e8dd] hover:bg-portal-mint-soft"><Icon size={15} className="text-portal-primary" /><p className="mt-3 text-[11px] font-semibold text-portal-ink">{action.label}</p><p className="mt-1 line-clamp-1 text-[10px] text-portal-muted">{action.description}</p><ArrowUpRight size={13} className="mt-2 text-portal-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></button> })}</div></section>
      </aside>
    </div>
  </div>
}

