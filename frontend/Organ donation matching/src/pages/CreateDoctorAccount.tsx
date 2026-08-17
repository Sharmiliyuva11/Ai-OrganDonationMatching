import { useState } from 'react'
import { CircleCheck, ShieldCheck, UserRoundPlus } from 'lucide-react'
import { createDoctor, getApiErrorMessage } from '../api/api'
import { PageHeader, PortalButton } from '../components/PortalPrimitives'

export default function CreateDoctorAccount() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [hospital, setHospital] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdEmail, setCreatedEmail] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setCreatedEmail('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      const doctor = await createDoctor({ email, password, name, hospital, specialization })
      setCreatedEmail(doctor.email)
      setEmail('')
      setName('')
      setHospital('')
      setSpecialization('')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create doctor account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Create Doctor Account"
        subtitle="Add authenticated doctor access for prediction and matching workflows."
      />

      <section className="portal-card max-w-2xl overflow-hidden">
        <div className="portal-section-header flex items-center gap-3 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-portal-mint text-portal-primary">
            <UserRoundPlus size={18} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-portal-ink">Doctor Credentials</h3>
            <p className="mt-0.5 text-[11px] text-portal-muted">The password is hashed before it is stored.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {createdEmail && (
            <div role="status" className="flex items-center gap-2 rounded-xl border border-[#b9e8dd] bg-portal-mint-soft px-4 py-3 text-sm font-semibold text-portal-primary">
              <CircleCheck size={16} aria-hidden="true" />
              Doctor account created for {createdEmail}.
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-portal-muted">Doctor Name</span>
            <input value={name} onChange={event => setName(event.target.value)} required className="portal-input w-full" placeholder="Dr. Priya Sharma" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-portal-muted">Email Address</span>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
              className="portal-input w-full"
              placeholder="doctor@example.com"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-portal-muted">Hospital</span>
              <input value={hospital} onChange={event => setHospital(event.target.value)} required className="portal-input w-full" placeholder="Hospital name" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-portal-muted">Specialization</span>
              <input value={specialization} onChange={event => setSpecialization(event.target.value)} required className="portal-input w-full" placeholder="Transplant Surgery" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-portal-muted">Temporary Password</span>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
              minLength={8}
              className="portal-input w-full"
              placeholder="Minimum 8 characters"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-portal-muted">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="portal-input w-full"
              placeholder="Re-enter temporary password"
            />
          </label>

          <div className="flex items-center justify-between gap-3 border-t border-portal-border pt-4">
            <div className="flex items-center gap-2 text-xs text-portal-muted">
              <ShieldCheck size={15} className="text-portal-primary" aria-hidden="true" />
              Admin-only account creation
            </div>
            <PortalButton type="submit" disabled={loading}>
              <UserRoundPlus size={14} aria-hidden="true" />
              {loading ? 'Creating...' : 'Create Doctor Account'}
            </PortalButton>
          </div>
        </form>
      </section>
    </div>
  )
}
