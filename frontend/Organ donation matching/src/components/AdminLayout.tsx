import { useEffect, useState, type ReactNode } from 'react'
import { useNav } from '../context'
import type { Page } from '../context'
import Navbar from './Navbar'
import AdminSidebar from './AdminSidebar'

const pageTitles: Partial<Record<Page, string>> = {
  dashboard: 'Dashboard',
  'donor-registration': 'Register Donor',
  'recipient-registration': 'Register Recipient',
  'donor-database': 'Donor Database',
  'recipient-database': 'Recipient Database',
  analytics: 'Analytics',
  reports: 'Reports',
}

export default function AdminLayout({ page, children }: { page: Page; children: ReactNode }) {
  const { navigate, logout } = useNav()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <div className="min-h-screen bg-portal-canvas">
      <AdminSidebar activePage={page} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={navigate} onLogout={logout} />
      <Navbar onMenu={() => setSidebarOpen(true)} />
      <main className="min-h-screen px-4 pb-8 pt-20 sm:px-6 lg:ml-[224px] lg:px-7" aria-label={`${pageTitles[page] ?? 'Dashboard'} page`}>
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  )
}
