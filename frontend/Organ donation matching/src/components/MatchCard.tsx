import { Building2, CheckCircle2, Download, Eye, HeartPulse, MapPin, Phone } from 'lucide-react'
import type { DonorRecommendation } from '../data'
import { PortalButton, ScoreBar, StatusBadge } from './PortalPrimitives'

type MatchCardProps = {
  donor: DonorRecommendation
  variant?: 'compact' | 'detailed'
  onView?: () => void
  onGenerate?: () => void
  onContact?: () => void
}

export default function MatchCard({ donor, variant = 'compact', onView, onGenerate, onContact }: MatchCardProps) {
  const compact = variant === 'compact'
  return <article className={`portal-card min-w-0 p-4 transition-shadow hover:shadow-md ${compact ? '' : 'p-5'}`}>
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-portal-mint text-xs font-bold text-portal-primary">{donor.compatibility}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] font-semibold text-portal-muted">{donor.id}</span><StatusBadge status={donor.status} /></div><h3 className="mt-1 truncate text-sm font-semibold text-portal-ink">{donor.name}</h3><p className="truncate text-[11px] text-portal-muted">{donor.age} years · {donor.organ}</p></div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-portal-mint px-2 py-1 text-[10px] font-semibold text-portal-success"><CheckCircle2 size={12} />Suitable Match</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-portal-muted">
          <span className="flex min-w-0 items-center gap-1.5"><HeartPulse size={13} className="shrink-0 text-portal-primary" />Blood <strong className="truncate text-portal-ink">{donor.bloodGroup}</strong></span>
          <span className="flex min-w-0 items-center gap-1.5"><Building2 size={13} className="shrink-0 text-portal-primary" />Organ <strong className="truncate text-portal-ink">{donor.organ}</strong></span>
          <span className="flex min-w-0 items-center gap-1.5"><Building2 size={13} className="shrink-0 text-portal-primary" />{donor.hospital}</span>
          <span className="flex min-w-0 items-center gap-1.5"><MapPin size={13} className="shrink-0 text-portal-primary" />{donor.city}</span>
        </div>
        <div className="mt-4 space-y-2"><ScoreBar label="Compatibility" value={donor.compatibility} /><ScoreBar label="AI Confidence" value={donor.aiConfidence} tone="info" /></div>
        <div className="mt-3 flex flex-wrap items-center gap-2"><StatusBadge status={donor.verification} /><span className="text-[10px] text-portal-muted">HLA {donor.hlaScore} · {donor.organCondition} · Infection {donor.infectionStatus}</span></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <PortalButton variant="secondary" onClick={onView}><Eye size={13} />View Details</PortalButton>
          {onContact && <PortalButton variant="secondary" onClick={onContact}><Phone size={13} />Contact Hospital</PortalButton>}
          <PortalButton variant="primary" onClick={onGenerate}><Download size={13} />Generate Report</PortalButton>
        </div>
      </div>
    </div>
  </article>
}
