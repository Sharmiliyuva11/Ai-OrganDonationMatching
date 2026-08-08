import { Activity, Bot, FileText, Grid2X2, History, LogOut, Search, Sparkles, UsersRound, X } from 'lucide-react'
import type { Page } from '../context'
import { doctorProfile } from '../data'

type SidebarProps = {
  activePage: Page
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: Page) => void
  onLogout: () => void
}

const items: { id: Page; label: string; icon: typeof Grid2X2 }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Grid2X2 },
  { id: 'ai-match-prediction', label: 'AI Match Prediction', icon: Bot },
  { id: 'find-matching-donor', label: 'Find Matching Donor', icon: Search },
  { id: 'prediction-history', label: 'Prediction History', icon: History },
  { id: 'clinical-reports', label: 'Clinical Reports', icon: FileText },
]

export default function Sidebar({ activePage, isOpen, onClose, onNavigate, onLogout }: SidebarProps) {
  return (
    <>
      {isOpen && <button aria-label="Close sidebar" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[224px] shrink-0 flex-col border-r border-portal-border bg-white transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-portal-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-portal-primary text-white">
            <Activity size={18} strokeWidth={2.2} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold tracking-tight text-portal-ink">OrganLink AI</div>
            <div className="text-[10px] text-portal-muted">Doctor Portal</div>
          </div>
          <button onClick={onClose} className="ml-auto rounded-lg p-1.5 text-portal-muted hover:bg-portal-mint-soft hover:text-portal-ink lg:hidden" aria-label="Close navigation">
            <X size={17} />
          </button>
        </div>

        <nav aria-label="Doctor portal navigation" className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-portal-muted">Clinical</p>
          <div className="space-y-1">
            {items.map(({ id, label, icon: Icon }) => {
              const active = activePage === id
              return (
                <button key={id} onClick={() => { onNavigate(id); onClose() }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${active ? 'bg-portal-mint font-semibold text-portal-primary' : 'font-medium text-portal-ink hover:bg-portal-mint-soft hover:text-portal-primary'}`}>
                  <Icon size={16} strokeWidth={1.9} className={active ? 'text-portal-primary' : 'text-portal-muted'} aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="space-y-3 border-t border-portal-border p-3">
          <div className="rounded-xl bg-portal-mint px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-portal-primary"><span className="h-2 w-2 rounded-full bg-portal-success" />AI Engine Online</div>
            <div className="mt-1 text-[10px] text-portal-muted">Model v3.2 · 94.6% accuracy</div>
          </div>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#d55757] hover:bg-red-50">
            <LogOut size={16} aria-hidden="true" />Logout
          </button>
          <div className="sr-only">Signed in as {doctorProfile.name}</div>
        </div>
      </aside>
    </>
  )
}
