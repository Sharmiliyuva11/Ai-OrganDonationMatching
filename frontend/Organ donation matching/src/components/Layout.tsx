import { useEffect, useState, type ReactNode } from 'react'
import { useNav } from '../context'
import type { Page } from '../context'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  'ai-match-prediction': 'AI Match Prediction',
  'find-matching-donor': 'Find Matching Donor',
  'prediction-history': 'Prediction History',
  'clinical-reports': 'Clinical Reports',
  'donor-registration': 'Donor Registration',
  'recipient-registration': 'Recipient Registration',
  analytics: 'Analytics',
  'ai-matching-queue': 'AI Matching Queue',
  'find-matching-recipient': 'Find Matching Recipient',
  'recommended-matches': 'Recommended Matches',
  'donor-database': 'Donor Database',
  'recipient-database': 'Recipient Database',
  reports: 'Reports',
}

export default function Layout({ page, children }: { page: Page; children: ReactNode }) {
  const { navigate, logout } = useNav()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return <div className="min-h-screen bg-portal-canvas">
    <Sidebar activePage={page} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={navigate} onLogout={logout} />
    <Navbar onMenu={() => setSidebarOpen(true)} />
    <main className="min-h-screen px-4 pb-8 pt-20 sm:px-6 lg:ml-[224px] lg:px-7" aria-label={`${pageTitles[page]} page`}>
      <div className="mx-auto w-full max-w-[1440px]">{children}</div>
    </main>
  </div>
}
