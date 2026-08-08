import { Bell, Menu, Search } from 'lucide-react'
import { doctorProfile } from '../data'

type NavbarProps = { onMenu: () => void }

export default function Navbar({ onMenu }: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center border-b border-portal-border bg-white lg:left-[224px]">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 sm:px-6">
        <button onClick={onMenu} className="rounded-lg p-2 text-portal-muted hover:bg-portal-mint-soft hover:text-portal-primary lg:hidden" aria-label="Open navigation">
          <Menu size={19} />
        </button>
        <div className="hidden min-w-0 sm:block">
          <h1 className="truncate text-sm font-semibold text-portal-ink">AI Powered Organ Donation Matching Platform</h1>
          <p className="text-[10px] text-portal-muted">Thursday, Aug 6, 2026</p>
        </div>
        <div className="relative ml-auto hidden w-full max-w-[280px] md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-portal-muted" aria-hidden="true" />
          <input aria-label="Search patients, donors, predictions" placeholder="Search patients, donors, predictions..." className="portal-input h-9 w-full pl-9 pr-3 text-xs placeholder:text-slate-400" />
        </div>
        <button className="relative rounded-lg p-2 text-portal-muted hover:bg-portal-mint-soft hover:text-portal-primary" aria-label="View notifications" title="Notifications">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <div className="hidden items-center gap-2 border-l border-portal-border pl-3 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-portal-primary text-[11px] font-bold text-white">{doctorProfile.initials}</div>
          <div className="max-w-[205px]">
            <div className="truncate text-xs font-semibold text-portal-ink">{doctorProfile.name}</div>
            <div className="truncate text-[10px] text-portal-muted">{doctorProfile.hospital}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
