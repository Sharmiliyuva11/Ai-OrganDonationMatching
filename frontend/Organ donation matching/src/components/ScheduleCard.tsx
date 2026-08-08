import { CalendarClock } from 'lucide-react'
import type { ScheduleItem } from '../data'

type ScheduleCardProps = { items: ScheduleItem[] }

export default function ScheduleCard({ items }: ScheduleCardProps) {
  return <section className="portal-card overflow-hidden" aria-labelledby="schedule-heading"><div className="portal-section-header flex items-center gap-2 px-4 py-3"><CalendarClock size={15} className="text-portal-primary" /><h3 id="schedule-heading" className="text-sm font-semibold text-portal-ink">Today's Schedule</h3></div><div className="space-y-4 p-4">{items.map(item => <div key={`${item.time}-${item.title}`} className="flex gap-3"><span className="w-10 shrink-0 text-[11px] font-semibold text-portal-primary">{item.time}</span><div className="min-w-0"><p className="text-[11px] font-medium leading-snug text-portal-ink">{item.title}</p><p className="mt-0.5 truncate text-[10px] text-portal-muted">{item.location}</p></div></div>)}</div></section>
}
