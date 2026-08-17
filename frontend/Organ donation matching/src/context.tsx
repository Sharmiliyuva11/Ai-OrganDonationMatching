import { createContext, useContext } from 'react'

export type Page =
  | 'dashboard'
  | 'ai-match-prediction'
  | 'find-matching-donor'
  | 'prediction-history'
  | 'clinical-reports'
  | 'donor-registration'
  | 'recipient-registration'
  | 'create-doctor-account'
  | 'analytics'
  | 'ai-matching-queue'
  | 'find-matching-recipient'
  | 'recommended-matches'
  | 'donor-database'
  | 'recipient-database'
  | 'reports'

export type UserRole = 'admin' | 'doctor'

interface NavCtx {
  navigate: (page: Page) => void
  role: UserRole
  logout: () => void
}

export const NavContext = createContext<NavCtx>({
  navigate: () => {},
  role: 'doctor',
  logout: () => {},
})

export const useNav = () => useContext(NavContext)
