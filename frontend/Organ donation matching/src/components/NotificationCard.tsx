import { Bell } from 'lucide-react'
import type { NotificationItem } from '../data'

type NotificationCardProps = { items: NotificationItem[] }

const tones: Record<NotificationItem['tone'], string> = { success: 'bg-portal-success', danger: 'bg-red-500', info: 'bg-[#3c82c4]', warning: 'bg-amber-500' }

export default function NotificationCard({ items }: NotificationCardProps) {
  return <section className="portal-card overflow-hidden" aria-labelledby="notifications-heading"><div className="portal-section-header flex items-center gap-2 px-4 py-3"><Bell size={15} className="text-portal-primary" /><h3 id="notifications-heading" className="text-sm font-semibold text-portal-ink">Recent Notifications</h3></div><div className="space-y-3 p-4">{items.map(item => <div key={item.id} className="flex items-start gap-2.5"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${tones[item.tone]}`} /><div className="min-w-0"><p className="text-[11px] leading-snug text-portal-ink">{item.message}</p><p className="mt-0.5 text-[10px] text-portal-muted">{item.timestamp}</p></div></div>)}</div></section>
}
