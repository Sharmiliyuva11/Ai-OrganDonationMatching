import { useState } from 'react'
import { RotateCcw, Search, Loader2 } from 'lucide-react'
import { findMatchingRecipients, getApiErrorMessage, type FindMatchingRecipientsResponse, type MatchingRecipient } from '../api/api'
import { PortalButton, StatusBadge } from '../components/PortalPrimitives'
import { openPrintableReport } from '../utils/reportUtils'

export default function FindMatchingRecipient() {
  const [searchId, setSearchId] = useState('')
  const [backendLoading, setBackendLoading] = useState(false)
  const [backendError, setBackendError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [backendDonor, setBackendDonor] = useState<FindMatchingRecipientsResponse['donor'] | null>(null)
  const [backendRecipients, setBackendRecipients] = useState<MatchingRecipient[]>([])
  const [backendTotal, setBackendTotal] = useState<number | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const donorId = searchId.trim()
    setValidationError('')
    setBackendError('')
    setBackendDonor(null)
    setBackendRecipients([])
    setBackendTotal(null)
    setSearched(true)

    if (!donorId) {
      setValidationError('Please enter a donor ID.')
      return
    }

    setBackendLoading(true)
    try {
      const resp = await findMatchingRecipients({ donor_id: donorId })
      setBackendDonor(resp.donor)
      setBackendRecipients(resp.matching_recipients)
      setBackendTotal(resp.total_matches)
    } catch (err: unknown) {
      setBackendError(getApiErrorMessage(err, 'Unable to reach matching service.'))
    } finally {
      setBackendLoading(false)
    }
  }

  const handleTryExample = async () => {
    setSearchId('D0001')
    setValidationError('')
    setBackendError('')
    setBackendDonor(null)
    setBackendRecipients([])
    setBackendTotal(null)
    setSearched(true)
    setBackendLoading(true)

    try {
      const resp = await findMatchingRecipients({ donor_id: 'D0001' })
      setBackendDonor(resp.donor)
      setBackendRecipients(resp.matching_recipients)
      setBackendTotal(resp.total_matches)
    } catch (err: unknown) {
      setBackendError(getApiErrorMessage(err, 'Unable to reach matching service.'))
    } finally {
      setBackendLoading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900 font-display mb-4">Search by Donor ID</h2>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="e.g. D0001"
            className="flex-1 min-w-[220px] max-w-md px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <PortalButton type="submit" className="min-w-[180px]">
            {backendLoading ? <><Loader2 size={14} className="animate-spin" /> Searching...</> : <><Search size={14} />Find Matching Recipients</>}
          </PortalButton>
          <PortalButton variant="secondary" type="button" onClick={handleTryExample}>
            <RotateCcw size={14} />Try D0001
          </PortalButton>
        </form>
      </div>

      {validationError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{validationError}</div>
      )}

      {backendError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{backendError}</div>
      )}

      {backendLoading && (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      )}

      {backendDonor && !backendLoading && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded">{backendDonor.donor_id}</span>
                  <StatusBadge status={backendDonor.donor_type} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Donor information</h3>
                <p className="text-sm text-slate-600 mt-1">{backendDonor.city} · {backendDonor.hospital}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 sm:grid-cols-4">
                <div><span className="text-xs text-slate-500">Type</span><p className="font-semibold text-slate-900">{backendDonor.donor_type}</p></div>
                <div><span className="text-xs text-slate-500">Age</span><p className="font-semibold text-slate-900">{backendDonor.age}</p></div>
                <div><span className="text-xs text-slate-500">Blood</span><p className="font-semibold text-slate-900">{backendDonor.blood_group}</p></div>
                <div><span className="text-xs text-slate-500">Organ</span><p className="font-semibold text-slate-900">{backendDonor.organ_available}</p></div>
              </div>
            </div>
            <div className="grid gap-4 mt-4 sm:grid-cols-2">
              <div><span className="text-xs text-slate-500">HLA Type</span><p className="font-semibold text-slate-900">{backendDonor.hla_type}</p></div>
              <div><span className="text-xs text-slate-500">Condition</span><p className="font-semibold text-slate-900">{backendDonor.organ_condition}</p></div>
              <div><span className="text-xs text-slate-500">City</span><p className="font-semibold text-slate-900">{backendDonor.city}</p></div>
              <div><span className="text-xs text-slate-500">Hospital</span><p className="font-semibold text-slate-900">{backendDonor.hospital}</p></div>
              <div className="sm:col-span-2"><span className="text-xs text-slate-500">Donation Date</span><p className="font-semibold text-slate-900">{backendDonor.donation_date}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Matching Recipients</h3>
                <p className="text-xs text-slate-500 mt-1">{backendTotal === null ? backendRecipients.length : backendTotal} total matches found</p>
              </div>
              <div className="flex items-center gap-3"><div className="text-xs text-slate-500">Search input: {searchId}</div><PortalButton variant="secondary" onClick={() => openPrintableReport('OrganAI Live Matching Recipients Report', [{ heading: 'Donor', rows: backendDonor }, { heading: 'Matching recipients', rows: Object.fromEntries(backendRecipients.map(item => [item.recipient_id, `Score ${item.match_score}; ${item.organ_needed}; blood ${item.blood_group}`])) }], sessionStorage.getItem('user_email') ?? localStorage.getItem('user_email') ?? undefined)}>Export report</PortalButton></div>
            </div>
          </div>

          {backendRecipients.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center text-slate-400">
              <p className="text-sm font-medium">No matching recipients found</p>
              <p className="text-xs mt-1">Try another donor ID or verify the donor details.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {backendRecipients.map(recipient => (
                <article key={recipient.recipient_id} className="portal-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{recipient.recipient_id}</span>
                        <StatusBadge status={recipient.urgency} />
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-portal-ink">Recipient {recipient.recipient_id}</h3>
                      <p className="text-sm text-portal-muted">{recipient.age} years · {recipient.blood_group} · {recipient.organ_needed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-portal-muted">Match score</p>
                      <p className="text-2xl font-semibold text-portal-ink">{recipient.match_score}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 mt-4 text-sm text-portal-muted sm:grid-cols-2">
                    <div><span className="block text-[11px] text-portal-muted">HLA type</span><span className="font-semibold text-portal-ink">{recipient.hla_type}</span></div>
                    <div><span className="block text-[11px] text-portal-muted">Urgency</span><span className="font-semibold text-portal-ink">{recipient.urgency}</span></div>
                    <div><span className="block text-[11px] text-portal-muted">Waiting days</span><span className="font-semibold text-portal-ink">{recipient.waiting_days}</span></div>
                    <div><span className="block text-[11px] text-portal-muted">Doctor verified</span><span className="font-semibold text-portal-ink">{recipient.doctor_verified}</span></div>
                    <div><span className="block text-[11px] text-portal-muted">Hospital</span><span className="font-semibold text-portal-ink">{recipient.hospital}</span></div>
                    <div><span className="block text-[11px] text-portal-muted">City</span><span className="font-semibold text-portal-ink">{recipient.city}</span></div>
                  </div>

                  {recipient.match_details && Object.keys(recipient.match_details).length > 0 && (
                    <div className="mt-4 rounded-2xl border border-portal-border bg-slate-50 p-4 text-sm text-portal-muted">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-portal-ink">Match details</h4>
                      <div className="grid gap-2 mt-3 sm:grid-cols-2">
                        {Object.entries(recipient.match_details).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs shadow-sm">
                            <span className="capitalize text-portal-muted">{key.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-portal-ink">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {!backendDonor && searched && !backendLoading && !backendError && validationError === '' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center text-slate-400">
          <p className="text-sm font-medium">No matching recipients found</p>
          <p className="text-xs mt-1">Enter a valid donor ID and try again.</p>
        </div>
      )}
    </div>
  )
}
