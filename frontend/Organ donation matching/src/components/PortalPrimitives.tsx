import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Check, CircleAlert, CircleCheck, Download, FileText, Search, UsersRound, X } from 'lucide-react'
import type { DonorRecommendation, RecipientRecord } from '../data'

export function PortalButton({ variant = 'primary', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; className?: string }) {
  const styles = {
    primary: 'bg-portal-primary text-white hover:bg-portal-primary-hover shadow-sm',
    secondary: 'border border-portal-border bg-white text-portal-ink hover:bg-portal-mint-soft',
    ghost: 'text-portal-primary hover:bg-portal-mint-soft',
  }
  return <button {...props} className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}>{children}</button>
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-portal-ink sm:text-2xl">{title}</h2>
      <p className="mt-1 text-xs text-portal-muted sm:text-sm">{subtitle}</p>
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
}

const statIcons = { users: UsersRound, bot: FileText, 'circle-check': CircleCheck, alert: CircleAlert }

export function StatCard({ label, value, trend, helper, icon, tone = 'mint' }: { label: string; value: string | number; trend?: string; helper?: string; icon?: keyof typeof statIcons; tone?: 'mint' | 'danger' }) {
  const Icon = icon ? statIcons[icon] : CircleCheck
  const isDanger = tone === 'danger'
  return <div className="portal-card min-w-0 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-portal-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">{value}</p>
        <p className={`mt-1 truncate text-[11px] ${isDanger ? 'text-[#d55757]' : 'text-portal-success'}`}><span className="font-semibold">{trend}</span> <span className="text-portal-muted">{helper}</span></p>
      </div>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDanger ? 'bg-red-50 text-portal-danger' : 'bg-portal-mint text-portal-primary'}`}><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></div>
    </div>
  </div>
}

const statusStyles: Record<string, string> = {
  Critical: 'bg-red-50 text-[#d55757] border-red-100',
  High: 'bg-amber-50 text-[#a86f13] border-amber-100',
  Moderate: 'bg-blue-50 text-portal-info border-blue-100',
  Medium: 'bg-blue-50 text-portal-info border-blue-100',
  Low: 'bg-slate-100 text-slate-500 border-slate-200',
  'Suitable Match': 'bg-portal-mint text-portal-success border-[#b9e8dd]',
  'Doctor Verified': 'bg-portal-mint text-portal-primary border-[#b9e8dd]',
  'Verification Pending': 'bg-slate-100 text-slate-500 border-slate-200',
  Completed: 'bg-portal-mint text-portal-success border-[#b9e8dd]',
  'Report Generated': 'bg-blue-50 text-portal-info border-blue-100',
  'Pending Review': 'bg-amber-50 text-[#a86f13] border-amber-100',
  Approved: 'bg-portal-mint text-portal-success border-[#b9e8dd]',
  Pending: 'bg-amber-50 text-[#a86f13] border-amber-100',
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold whitespace-nowrap ${statusStyles[status] ?? 'border-slate-200 bg-slate-50 text-slate-500'}`}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />{status}</span>
}

export function ScoreBar({ label, value, tone = 'primary' }: { label: string; value: number; tone?: 'primary' | 'info' }) {
  return <div className="space-y-1">
    <div className="flex items-center justify-between gap-3 text-[11px]"><span className="text-portal-muted">{label}</span><span className="font-semibold text-portal-primary">{value}%</span></div>
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-[width] duration-500 ${tone === 'info' ? 'bg-[#59b8c9]' : 'bg-portal-primary'}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
  </div>
}

export function ProfileCard({ recipient, compact = false }: { recipient: RecipientRecord; compact?: boolean }) {
  return <div className={`rounded-[14px] border border-[#b9e8dd] bg-portal-mint-soft ${compact ? 'p-4' : 'p-5'}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-portal-mint text-xs font-bold text-portal-primary">{recipient.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</div>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] font-semibold text-portal-primary">{recipient.id}</span><StatusBadge status={recipient.urgencyLevel} /></div><h3 className="mt-1 truncate text-sm font-semibold text-portal-ink">{recipient.name}</h3><p className="truncate text-[11px] text-portal-muted">{recipient.age} years · {recipient.gender} · {recipient.city}</p></div>
      </div>
      <div className="shrink-0 text-right"><p className="text-[10px] text-portal-muted">Waiting</p><p className="text-xl font-semibold text-portal-ink">{recipient.waitingDays}<span className="text-[10px] font-normal text-portal-muted"> days</span></p></div>
    </div>
    <div className={`mt-4 grid gap-3 border-t border-[#cceee7] pt-4 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
      {[['Organ Needed', recipient.requiredOrgan], ['Blood Group', recipient.bloodGroup], ['HLA Score', String(recipient.hlaScore)], ['Hospital', recipient.hospital]].map(([label, value]) => <div key={label} className="min-w-0"><p className="text-[9px] uppercase tracking-[0.08em] text-portal-muted">{label}</p><p className="mt-1 truncate text-xs font-semibold text-portal-ink">{value}</p></div>)}
    </div>
  </div>
}

export function FilterField({ label, icon, className = '', children }: { label: string; icon?: ReactNode; className?: string; children: ReactNode }) {
  return <label className={`block min-w-0 ${className}`}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-portal-muted">{label}</span><span className="relative block">{icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-portal-muted">{icon}</span>}{children}</span></label>
}

export function ChartCard({ title, description, children, className = '' }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return <div className={`portal-card min-w-0 overflow-hidden p-4 sm:p-5 ${className}`}><div className="mb-4"><h3 className="text-sm font-semibold text-portal-ink">{title}</h3>{description && <p className="mt-1 text-[11px] text-portal-muted">{description}</p>}</div>{children}</div>
}

export function EmptyState({ title, description, icon = <Search size={22} /> }: { title: string; description: string; icon?: ReactNode }) {
  return <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center text-portal-muted"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-portal-mint-soft text-portal-primary">{icon}</div><p className="text-sm font-semibold text-portal-ink">{title}</p><p className="mt-1 max-w-xs text-xs leading-relaxed">{description}</p></div>
}

export function DetailModal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[14px] bg-white shadow-xl" onClick={event => event.stopPropagation()}><div className="flex items-start justify-between border-b border-portal-border px-5 py-4"><div><h2 className="text-base font-semibold text-portal-ink">{title}</h2>{description && <p className="mt-1 text-xs text-portal-muted">{description}</p>}</div><button onClick={onClose} className="rounded-lg p-1.5 text-portal-muted hover:bg-portal-mint-soft hover:text-portal-ink" aria-label="Close dialog"><X size={17} /></button></div><div className="p-5">{children}</div></div></div>
}

export function DownloadButton({ onClick, label = 'Download PDF' }: { onClick?: () => void; label?: string }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-portal-border px-2.5 py-1.5 text-[11px] font-semibold text-portal-primary hover:bg-portal-mint-soft" title={label} aria-label={label}><Download size={13} />{label}</button>
}

export function RecipientMeta({ recipient }: { recipient: RecipientRecord }) {
  return <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4"><div><span className="text-[10px] text-portal-muted">Organ</span><p className="mt-1 font-semibold text-portal-ink">{recipient.requiredOrgan}</p></div><div><span className="text-[10px] text-portal-muted">Blood group</span><p className="mt-1 font-semibold text-portal-ink">{recipient.bloodGroup}</p></div><div><span className="text-[10px] text-portal-muted">HLA score</span><p className="mt-1 font-semibold text-portal-ink">{recipient.hlaScore}</p></div><div><span className="text-[10px] text-portal-muted">Status</span><p className="mt-1 font-semibold text-portal-primary">{recipient.status}</p></div></div>
}

export function VerificationIcon({ verified }: { verified: boolean }) {
  return verified ? <Check size={13} aria-hidden="true" /> : <X size={13} aria-hidden="true" />
}

export function IconForRecommendation({ donor }: { donor: DonorRecommendation }) {
  return <span className="sr-only">{donor.name}</span>
}
