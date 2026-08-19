import { useEffect, useState, type ReactNode } from 'react'
import { Activity, Building2, Mail, Stethoscope, UserRound } from 'lucide-react'
import { getApiErrorMessage, getCurrentUser, getDatasetOverview, type AuthenticatedUser, type DatasetOverview } from '../api/api'
import { PageHeader, PortalButton, StatCard } from '../components/PortalPrimitives'
import { useNav } from '../context'

const unavailable: DatasetOverview = { total_donors: 0, total_recipients: 0, total_matches: 0, donors_by_organ: [], recipients_by_organ: [], recipients_by_urgency: [], prediction_history_available: false }

export default function DoctorDashboard() {
  const { navigate } = useNav()
  const [profile, setProfile] = useState<AuthenticatedUser | null>(null)
  const [overview, setOverview] = useState<DatasetOverview>(unavailable)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getCurrentUser(), getDatasetOverview()])
      .then(([user, data]) => { setProfile(user); setOverview(data) })
      .catch(error => setError(getApiErrorMessage(error, 'Unable to load the authenticated profile.')))
  }, [])

  const name = profile?.name || 'Doctor'
  return <div className="space-y-5">
    <PageHeader title={`Welcome, ${name}`} subtitle={profile ? `${profile.specialization || 'Not available'} · ${profile.hospital || 'Not available'}` : 'Loading your authenticated profile…'} actions={<PortalButton onClick={() => navigate('ai-match-prediction')}><Activity size={14} />Run Prediction</PortalButton>} />
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <section className="portal-card p-5"><div className="flex items-center gap-2 text-portal-primary"><UserRound size={18}/><h2 className="text-base font-semibold text-portal-ink">My Profile</h2></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><ProfileItem icon={<UserRound size={15}/>} label="Doctor name" value={profile?.name || 'Not available'}/><ProfileItem icon={<Mail size={15}/>} label="Email" value={profile?.email || 'Not available'}/><ProfileItem icon={<Building2 size={15}/>} label="Hospital" value={profile?.hospital || 'Not available'}/><ProfileItem icon={<Stethoscope size={15}/>} label="Specialization" value={profile?.specialization || 'Not available'}/></div></section>
    <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Dataset donors" value={String(overview.total_donors)} helper="current backend dataset" icon="users"/><StatCard label="Dataset recipients" value={String(overview.total_recipients)} helper="current backend dataset" icon="users"/><StatCard label="Stored matches" value={String(overview.total_matches)} helper="current backend dataset" icon="circle-check"/></div>
    <section className="portal-card p-5"><h2 className="text-base font-semibold text-portal-ink">Clinical activity</h2><p className="mt-2 text-sm text-portal-muted">Doctor-specific statistics and report history are not persisted, so they are not estimated. Use a live prediction or matching workflow to generate a printable report with current data.</p></section>
  </div>
}

function ProfileItem({ icon, label, value }: { icon: ReactNode, label: string, value: string }) {
  return <div className="rounded-xl border border-portal-border p-3"><div className="flex items-center gap-2 text-portal-muted">{icon}<span className="text-[11px]">{label}</span></div><p className="mt-2 break-words text-sm font-semibold text-portal-ink">{value}</p></div>
}
