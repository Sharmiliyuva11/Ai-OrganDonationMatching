import { useMemo, useState } from 'react'
import { Building2, Filter, MapPin, Phone, RotateCcw, Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import { donors, recipients, type DonorRecommendation } from '../data'
import MatchCard from '../components/MatchCard'
import { DetailModal, EmptyState, FilterField, PageHeader, PortalButton, ScoreBar, StatusBadge } from '../components/PortalPrimitives'
import { findMatchingDonors, type MatchingDonor } from '../api/api'

const organs = ['Kidney', 'Liver', 'Heart', 'Cornea', 'Lung']
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const hospitals = [...new Set(donors.map(donor => donor.hospital))]
const cities = [...new Set(donors.map(donor => donor.city))]

export default function FindMatchingDonor() {
  const [filters, setFilters] = useState({ recipientId: '', bloodGroup: '', organ: '', hospital: '', city: '' })
  const [applied, setApplied] = useState(filters)
  const [sort, setSort] = useState('compatibility')
  const [selected, setSelected] = useState<DonorRecommendation | null>(null)
  const [feedback, setFeedback] = useState('')

  // Backend integration state
  const [backendLoading, setBackendLoading] = useState(false)
  const [backendError, setBackendError] = useState('')
  const [backendRecipient, setBackendRecipient] = useState<Record<string, any> | null>(null)
  const [backendDonors, setBackendDonors] = useState<MatchingDonor[] | null>(null)
  const [backendTotal, setBackendTotal] = useState<number | null>(null)

  const results = useMemo(() => {
    const recipient = recipients.find(item => item.id.toLowerCase() === applied.recipientId.toLowerCase())
    const ranked = donors.filter(donor => donor.status === 'Available' && (!applied.bloodGroup || donor.bloodGroup === applied.bloodGroup) && (!applied.organ || donor.organ === applied.organ) && (!applied.hospital || donor.hospital === applied.hospital) && (!applied.city || donor.city === applied.city) && (!recipient || donor.organ === recipient.requiredOrgan)).map(donor => {
      const compatibility = recipient ? Math.round((donor.organ === recipient.requiredOrgan ? 42 : 10) + (donor.bloodGroup === recipient.bloodGroup ? 30 : 16) + donor.hlaScore * 0.2 + (donor.doctorVerified ? 8 : 0)) : Math.round(76 + donor.hlaScore * 0.16)
      return { id: donor.id, name: donor.name, age: donor.age, bloodGroup: donor.bloodGroup, organ: donor.organ, hospital: donor.hospital, city: donor.city, compatibility: Math.min(99, compatibility), aiConfidence: Math.min(99, compatibility - 2 + (donor.doctorVerified ? 4 : 0)), hlaScore: donor.hlaScore, organCondition: donor.organCondition, infectionStatus: donor.infectionStatus, verification: donor.doctorVerified ? 'Doctor Verified' : 'Verification Pending', status: compatibility >= 72 ? 'Suitable Match' : 'Pending Review' } satisfies DonorRecommendation
    })
    return ranked.sort((a, b) => sort === 'compatibility' ? b.compatibility - a.compatibility : a.name.localeCompare(b.name))
  }, [applied, sort])

  const update = (key: keyof typeof filters, value: string) => setFilters(previous => ({ ...previous, [key]: value }))
  const showFeedback = (message: string) => { setFeedback(message); window.setTimeout(() => setFeedback(''), 2300) }

  // Call backend to find matching donors by recipient id
  const fetchMatchingDonors = async () => {
    const recipientId = filters.recipientId?.trim()
    setBackendError('')
    setBackendDonors(null)
    setBackendRecipient(null)
    setBackendTotal(null)

    if (!recipientId) {
      setBackendError('Please enter a recipient ID.')
      return
    }

    setBackendLoading(true)
    try {
      const resp = await findMatchingDonors({ recipient_id: recipientId })
      setBackendRecipient(resp.recipient)
      setBackendDonors(resp.matching_donors)
      setBackendTotal(resp.total_matches)
      if (!resp.matching_donors || resp.matching_donors.length === 0) {
        showFeedback('No matching donors found for this recipient.')
      }
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? err?.message ?? 'Unable to reach matching service.'
      setBackendError(String(message))
    } finally {
      setBackendLoading(false)
    }
  }

  return <div className="space-y-5">
    {feedback && <div role="status" className="fixed bottom-5 right-5 z-30 rounded-xl border border-[#b9e8dd] bg-white px-4 py-3 text-xs font-semibold text-portal-primary shadow-lg">{feedback}</div>}
    <PageHeader title="Find Matching Donor" subtitle="Search and review donors compatible with your recipients" actions={<PortalButton onClick={() => showFeedback('New prediction workflow is ready.')}><SlidersHorizontal size={14} />New Prediction</PortalButton>} />

    <section className="portal-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Filter size={16} className="text-portal-primary" />
        <div>
          <h3 className="text-sm font-semibold text-portal-ink">Search filters</h3>
          <p className="mt-1 text-[11px] text-portal-muted">Narrow the donor pool using clinical and location criteria.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <FilterField label="Recipient ID" icon={<Search size={14} />} className="xl:col-span-1"><input value={filters.recipientId} onChange={event => update('recipientId', event.target.value)} placeholder="e.g. R001" className="portal-input w-full pl-9 pr-3 text-sm" /></FilterField>
        <FilterField label="Blood Group"><select value={filters.bloodGroup} onChange={event => update('bloodGroup', event.target.value)} className="portal-input w-full px-3 text-sm"><option value="">All groups</option>{bloodGroups.map(group => <option key={group}>{group}</option>)}</select></FilterField>
        <FilterField label="Organ Needed"><select value={filters.organ} onChange={event => update('organ', event.target.value)} className="portal-input w-full px-3 text-sm"><option value="">All organs</option>{organs.map(organ => <option key={organ}>{organ}</option>)}</select></FilterField>
        <FilterField label="Hospital" icon={<Building2 size={14} />}><select value={filters.hospital} onChange={event => update('hospital', event.target.value)} className="portal-input w-full px-3 text-sm"><option value="">All hospitals</option>{hospitals.map(hospital => <option key={hospital}>{hospital}</option>)}</select></FilterField>
        <FilterField label="City" icon={<MapPin size={14} />}><select value={filters.city} onChange={event => update('city', event.target.value)} className="portal-input w-full px-3 text-sm"><option value="">All cities</option>{cities.map(city => <option key={city}>{city}</option>)}</select></FilterField>

        <div className="flex items-end gap-2">
          <PortalButton onClick={() => setApplied(filters)} className="flex-1"><Search size={14} />Search</PortalButton>
          <PortalButton variant="secondary" onClick={() => { const empty = { recipientId: '', bloodGroup: '', organ: '', hospital: '', city: '' }; setFilters(empty); setApplied(empty); }}><RotateCcw size={14} />Reset</PortalButton>
          <PortalButton variant="ghost" onClick={() => { void fetchMatchingDonors() }} className="hidden sm:inline-flex">{backendLoading ? <><Loader2 size={14} className="animate-spin" /> Finding...</> : 'Find Matching Donors'}</PortalButton>
        </div>
      </div>
    </section>

    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-portal-ink">Matching Donors</h3>
          <p className="mt-1 text-[11px] text-portal-muted">{backendDonors ? `${backendTotal ?? backendDonors.length} matching donors found` : (backendError ? '' : `${results.length} available donor${results.length === 1 ? '' : 's'} found`)}</p>
        </div>
        <label className="flex items-center gap-2 text-[11px] text-portal-muted">Sort by<select value={sort} onChange={event => setSort(event.target.value)} className="portal-input h-9 px-3 text-xs"><option value="compatibility">Compatibility</option><option value="name">Donor name</option></select></label>
      </div>

      {backendError && <div className="portal-card p-4 text-sm text-portal-ink text-red-600">{backendError}</div>}

      {backendDonors !== null ? (
        // Backend was used: render exactly what backend returned (or empty state)
        backendDonors.length ? <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{backendDonors.map(d => <article key={d.donor_id} className="portal-card p-4"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-portal-mint text-xs font-bold text-portal-primary">{d.match_score}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-[10px] font-semibold text-portal-muted">{d.donor_id}</span><StatusBadge status={d.donor_type} /></div><h3 className="mt-1 truncate text-sm font-semibold text-portal-ink">{d.donor_id}</h3><p className="truncate text-[11px] text-portal-muted">{d.age} years · {d.organ_available}</p></div><div className="text-right"><div className="text-xs text-portal-muted">Score</div><div className="text-xl font-semibold text-portal-ink">{d.match_score}</div></div></div><div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-portal-muted"><div>Blood <strong className="text-portal-ink">{d.blood_group}</strong></div><div>HLA <strong className="text-portal-ink">{d.hla_type}</strong></div><div>Condition <strong className="text-portal-ink">{d.organ_condition}</strong></div><div>Infection <strong className="text-portal-ink">{d.infection_status ?? 'No'}</strong></div></div><div className="mt-4 flex flex-wrap items-center gap-2"><span className="text-[10px] text-portal-muted">{d.city} · {d.hospital}</span><PortalButton variant="secondary" onClick={() => showFeedback(`Contact request prepared for ${d.hospital}.`)}><Phone size={13} />Contact Hospital</PortalButton></div></div></div></article>)}</div> : <div className="portal-card"><EmptyState title="No matching donors" description="No donors matched the recipient criteria." /></div>
      ) : backendLoading ? (
        <div className="grid gap-3 lg:grid-cols-2">{[1, 2].map(i => <div key={i} className="portal-card h-40 animate-pulse bg-white" />)}</div>
      ) : backendError ? (
        // When there was an error calling the backend, show only the error (no fallback cards)
        <div />
      ) : (
        // Fallback to local results when backend not used at all
        results.length ? <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{results.map(donor => <MatchCard key={donor.id} donor={donor} variant="detailed" onView={() => setSelected(donor)} onContact={() => showFeedback(`Contact request prepared for ${donor.hospital}.`)} onGenerate={() => showFeedback(`Report generation started for ${donor.id}.`)} />)}</div> : <div className="portal-card"><EmptyState title="No matching donors" description="Try a broader organ, blood group, hospital, or city filter." /></div>
      )}

    </section>

    {selected && <DetailModal title="Donor details" description={`${selected.id} · ${selected.name}`} onClose={() => setSelected(null)}><div className="space-y-5"><div className="grid grid-cols-2 gap-3 rounded-xl bg-portal-mint-soft p-4 sm:grid-cols-4"><div><span className="text-[10px] text-portal-muted">Compatibility</span><p className="mt-1 text-xl font-semibold text-portal-primary">{selected.compatibility}%</p></div><div><span className="text-[10px] text-portal-muted">AI confidence</span><p className="mt-1 text-xl font-semibold text-portal-ink">{selected.aiConfidence}%</p></div><div><span className="text-[10px] text-portal-muted">Organ</span><p className="mt-1 text-sm font-semibold text-portal-ink">{selected.organ}</p></div><div><span className="text-[10px] text-portal-muted">Blood group</span><p className="mt-1 text-sm font-semibold text-portal-ink">{selected.bloodGroup}</p></div></div><div className="space-y-3 rounded-xl border border-portal-border p-4"><ScoreBar label="Compatibility" value={selected.compatibility} /><ScoreBar label="AI confidence" value={selected.aiConfidence} tone="info" /><ScoreBar label="HLA score" value={selected.hlaScore} /></div><div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge status={selected.verification} /><PortalButton onClick={() => { setSelected(null); showFeedback(`Contact request prepared for ${selected.hospital}.`) }}><Phone size={14} />Contact Hospital</PortalButton></div></div></DetailModal>}
  </div>
}
