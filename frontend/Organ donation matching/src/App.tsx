import { useState } from 'react'
import { BrowserRouter, useLocation, useNavigate as useRouterNavigate } from 'react-router-dom'
import { NavContext } from './context'
import type { Page, UserRole } from './context'
import AdminLayout from './components/AdminLayout'
import DoctorLayout from './components/DoctorLayout'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AIMatchPrediction from './pages/AIMatchPrediction'
import FindMatchingDonor from './pages/FindMatchingDonor'
import FindMatchingRecipient from './pages/FindMatchingRecipient'
import PredictionHistory from './pages/PredictionHistory'
import ClinicalReports from './pages/ClinicalReports'
import RegisterDonor from './pages/RegisterDonor'
import RegisterRecipient from './pages/RegisterRecipient'
import DonorDatabase from './pages/DonorDatabase'
import RecipientDatabase from './pages/RecipientDatabase'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'

const pagePaths: Partial<Record<Page, string>> = {
  dashboard: '/dashboard',
  'ai-match-prediction': '/ai-match-prediction',
  'find-matching-donor': '/find-matching-donor',
  'prediction-history': '/prediction-history',
  'clinical-reports': '/clinical-reports',
  'donor-registration': '/register-donor',
  'recipient-registration': '/register-recipient',
  analytics: '/analytics',
  'donor-database': '/donor-database',
  'recipient-database': '/recipient-database',
  reports: '/reports',
  'ai-matching-queue': '/ai-matching-queue',
  'find-matching-recipient': '/find-matching-recipient',
  'recommended-matches': '/recommended-matches',
}

const pathToPage = (pathname: string): Page => {
  const normalizedPathname = pathname === '/' ? '/dashboard' : pathname
  const match = (Object.entries(pagePaths) as [Page, string][]).find(([, path]) => path === normalizedPathname)
  return match?.[0] ?? 'dashboard'
}

function PageRenderer({ page, role }: { page: Page; role: UserRole }) {
  switch (page) {
    case 'ai-match-prediction': return <AIMatchPrediction />
    case 'find-matching-donor': return <FindMatchingDonor />
    case 'find-matching-recipient': return <FindMatchingRecipient />
    case 'prediction-history': return <PredictionHistory />
    case 'clinical-reports': return <ClinicalReports />
    case 'donor-registration': return <RegisterDonor />
    case 'recipient-registration': return <RegisterRecipient />
    case 'donor-database': return <DonorDatabase />
    case 'recipient-database': return <RecipientDatabase />
    case 'analytics': return <Analytics />
    case 'reports': return <Reports />
    case 'dashboard':
    default: return role === 'admin' ? <AdminDashboard /> : <DoctorDashboard />
  }
}

function AppContent() {
  const routerNavigate = useRouterNavigate()
  const location = useLocation()
  const [role, setRole] = useState<UserRole | null>(null)
  const page = pathToPage(location.pathname)

  const navigate = (nextPage: Page) => routerNavigate(pagePaths[nextPage] ?? '/dashboard')
  const handleLogin = (selectedRole: UserRole) => { setRole(selectedRole); routerNavigate('/dashboard') }
  const handleLogout = () => { setRole(null); routerNavigate('/dashboard') }

  if (!role) return <Login onLogin={handleLogin} />

  const Layout = role === 'admin' ? AdminLayout : DoctorLayout

  return <NavContext.Provider value={{ navigate, role, logout: handleLogout }}><Layout page={page}><PageRenderer page={page} role={role} /></Layout></NavContext.Provider>
}

export default function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>
}
