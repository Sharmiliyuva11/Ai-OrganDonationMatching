import { useState, type FormEvent } from 'react'
import { Activity, ClipboardCheck, LoaderCircle, Search } from 'lucide-react'
import { donors, recipients, type RecipientRecord } from '../data'
import { EmptyState, FilterField, PageHeader, PortalButton, ProfileCard, ScoreBar, StatusBadge } from '../components/PortalPrimitives'
import { getApiErrorMessage, predictMatch, type MatchPredictionResponse } from '../api/api'
import { useMetadataOptions } from '../hooks/useMetadataOptions'
import { openPrintableReport } from '../utils/reportUtils'

function mapUrgency(urgency: RecipientRecord['urgencyLevel']) {
  switch (urgency) {
    case 'Critical':
      return 'Critical'
    case 'High':
      return 'High'
    case 'Moderate':
    case 'Medium':
      return 'Medium'
    default:
      return 'Low'
  }
}

function mapOrganCondition(condition: string) {
  if (condition === 'Excellent') return 'Excellent'
  if (condition === 'Good' || condition === 'Satisfactory') return 'Good'
  return 'Average'
}

function formatValue(value: number | string) {
  return typeof value === 'number' ? value.toString() : value
}

function resolveDonor(recipient: RecipientRecord) {
  const sameOrgan = donors.find(donor => donor.status === 'Available' && donor.organ === recipient.requiredOrgan)
  if (sameOrgan) return sameOrgan
  return donors.find(donor => donor.status === 'Available') ?? donors[0]
}

export default function AIMatchPrediction() {
  const { options } = useMetadataOptions()
  const [recipientId, setRecipientId] = useState('')
  const [recipient, setRecipient] = useState<RecipientRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [prediction, setPrediction] = useState<MatchPredictionResponse | null>(null)
  const [predictionError, setPredictionError] = useState('')

  // Form state for manual editing
  const [recipientAge, setRecipientAge] = useState<number | ''>('')
  const [recipientBloodGroup, setRecipientBloodGroup] = useState('')
  const [organNeeded, setOrganNeeded] = useState('')
  const [recipientHla, setRecipientHla] = useState('')
  const [recipientCity, setRecipientCity] = useState('')
  const [recipientHospital, setRecipientHospital] = useState('')
  const [urgency, setUrgency] = useState('')
  const [waitingDays, setWaitingDays] = useState<number | ''>('')

  const [donorAge, setDonorAge] = useState<number | ''>('')
  const [donorBloodGroup, setDonorBloodGroup] = useState('')
  const [organAvailable, setOrganAvailable] = useState('')
  const [donorHla, setDonorHla] = useState('')
  const [donorCity, setDonorCity] = useState('')
  const [donorHospital, setDonorHospital] = useState('')
  const [donorType, setDonorType] = useState('')

  const [doctorVerified, setDoctorVerified] = useState('No')
  const [organCondition, setOrganCondition] = useState('Good')
  const [infectionStatus, setInfectionStatus] = useState('No')
  const predict = async (id: string) => {
    // If an ID is provided, try to load that recipient and populate form fields.
    const found = id ? recipients.find(item => item.id.toLowerCase() === id.trim().toLowerCase()) : null

    let chosenDonor = null
    if (found) {
      chosenDonor = resolveDonor(found)
      // populate form fields from found and chosen donor
      setRecipient(found)
      setRecipientAge(found.age)
      setRecipientBloodGroup(found.bloodGroup)
      setOrganNeeded(found.requiredOrgan)
      setRecipientHla(String(found.hlaScore))
      setRecipientCity(found.city)
      setRecipientHospital(found.hospital)
      setUrgency(mapUrgency(found.urgencyLevel))
      setWaitingDays(found.waitingDays)

      if (chosenDonor) {
        setDonorAge(chosenDonor.age)
        setDonorBloodGroup(chosenDonor.bloodGroup)
        setOrganAvailable(chosenDonor.organ)
        setDonorHla(String(chosenDonor.hlaScore))
        setDonorCity(chosenDonor.city)
        setDonorHospital(chosenDonor.hospital)
        setDonorType(chosenDonor.donorType)
        setDoctorVerified(chosenDonor.doctorVerified ? 'Yes' : 'No')
        setOrganCondition(mapOrganCondition(chosenDonor.organCondition))
        setInfectionStatus(chosenDonor.infectionStatus.toLowerCase().includes('positive') ? 'Yes' : 'No')
      }
    } else if (id) {
      setRecipient(null)
    }

    // Build payload from current form state (populated from sample or edited manually)
    const payload = {
      donor_age: typeof donorAge === 'number' ? donorAge : Number(donorAge) || 42,
      recipient_age: typeof recipientAge === 'number' ? recipientAge : Number(recipientAge) || 39,
      donor_blood_group: donorBloodGroup || options.blood_groups[0],
      recipient_blood_group: recipientBloodGroup || options.blood_groups[0],
      organ_available: organAvailable || options.organs_available[0],
      organ_needed: organNeeded || options.organs_needed[0],
      donor_hla: donorHla || options.hla_types[0],
      recipient_hla: recipientHla || options.hla_types[0],
      donor_city: donorCity || options.cities[0],
      recipient_city: recipientCity || options.cities[0],
      donor_hospital: donorHospital || options.hospitals[0],
      recipient_hospital: recipientHospital || options.hospitals[0],
      donor_type: donorType || options.donor_types[0],
      doctor_verified: doctorVerified || 'No',
      urgency: urgency || options.urgencies[0],
      waiting_days: typeof waitingDays === 'number' ? waitingDays : Number(waitingDays) || 0,
      organ_condition: organCondition || options.organ_conditions[0],
      infection_status: infectionStatus || options.infection_statuses[0],
    }

    setLoading(true)
    setPrediction(null)
    setPredictionError('')

    try {
      const response = await predictMatch(payload)
      setPrediction(response)
      setFeedback(found ? `Prediction completed for ${found.id}.` : 'Prediction completed.')
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Unable to reach the prediction service.')
      setPrediction(null)
      setPredictionError(message)
      setFeedback('Prediction failed. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void predict(recipientId)
  }

  const resultRows = prediction
    ? [
        { label: 'Prediction', value: prediction.prediction },
        { label: 'Model Prediction', value: prediction.model_prediction },
        { label: 'Blood Match', value: prediction.generated_features.blood_match },
        { label: 'Blood Compatibility', value: prediction.generated_features.blood_compatible },
        { label: 'Organ Match', value: prediction.generated_features.organ_match },
        { label: 'HLA Match', value: prediction.generated_features.hla_match },
        { label: 'Same City', value: prediction.generated_features.same_city },
        { label: 'Same Hospital', value: prediction.generated_features.same_hospital },
        { label: 'Urgency Score', value: prediction.generated_features.urgency_score },
        { label: 'Waiting Score', value: prediction.generated_features.waiting_score.toFixed(2) },
        { label: 'Organ Condition Score', value: prediction.generated_features.organ_condition_score },
        { label: 'Infection Score', value: prediction.generated_features.infection_score },
        { label: 'Age Difference', value: prediction.generated_features.age_difference },
        { label: 'Age Score', value: prediction.generated_features.age_score.toFixed(2) },
      ]
    : []

  return <div className="space-y-5">
    {feedback && <div role="status" className="fixed bottom-5 right-5 z-30 rounded-xl border border-[#b9e8dd] bg-white px-4 py-3 text-xs font-semibold text-portal-primary shadow-lg">{feedback}</div>}
    <PageHeader title="AI Match Prediction" subtitle="Predict donor-recipient compatibility using the AI matching engine" actions={<div className="flex gap-2"><PortalButton onClick={() => { void predict(recipientId) }} disabled={loading}><Activity size={14} />{loading ? 'Running...' : 'Run Prediction'}</PortalButton>{prediction && <PortalButton variant="secondary" onClick={() => openPrintableReport('OrganAI Live Prediction Report', [{ heading: 'Recipient and donor input', rows: { 'Recipient ID': recipientId || 'Not supplied', 'Recipient blood group': recipientBloodGroup, 'Organ needed': organNeeded, 'Donor blood group': donorBloodGroup, 'Organ available': organAvailable } }, { heading: 'Prediction result', rows: Object.fromEntries(resultRows.map(row => [row.label, row.value])) }], sessionStorage.getItem('user_email') ?? localStorage.getItem('user_email') ?? undefined)}>Export report</PortalButton>}</div>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)]">
      <section className="portal-card p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-portal-mint text-portal-primary"><Search size={17} /></div>
          <div>
            <h3 className="text-sm font-semibold text-portal-ink">Recipient Search</h3>
            <p className="mt-1 text-[11px] text-portal-muted">Select a recipient or manually edit inputs to generate a live AI prediction</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FilterField label="Patient ID" icon={<Search size={14} />} className="col-span-2"><input value={recipientId} onChange={event => setRecipientId(event.target.value)} placeholder="e.g. R00001" className="portal-input w-full pl-9 pr-3 text-sm" /></FilterField>

            <h4 className="col-span-2 mt-2 text-sm font-semibold text-portal-ink">Recipient Information</h4>
            <FilterField label="Recipient Age"><input type="number" value={recipientAge ?? ''} onChange={e => setRecipientAge(e.target.value === '' ? '' : Number(e.target.value))} className="portal-input" /></FilterField>
            <FilterField label="Recipient Blood Group"><select value={recipientBloodGroup} onChange={e => setRecipientBloodGroup(e.target.value)} className="portal-input"><option value="">Select</option>{options.blood_groups.map(group => <option key={group}>{group}</option>)}</select></FilterField>
            <FilterField label="Organ Needed"><select value={organNeeded} onChange={e => setOrganNeeded(e.target.value)} className="portal-input"><option value="">Select</option>{options.organs_needed.map(organ => <option key={organ}>{organ}</option>)}</select></FilterField>
            <FilterField label="Recipient HLA"><input value={recipientHla} onChange={e => setRecipientHla(e.target.value)} className="portal-input" /></FilterField>
            <FilterField label="Recipient City"><input value={recipientCity} onChange={e => setRecipientCity(e.target.value)} className="portal-input" /></FilterField>
            <FilterField label="Recipient Hospital"><input value={recipientHospital} onChange={e => setRecipientHospital(e.target.value)} className="portal-input" /></FilterField>
            <FilterField label="Urgency"><select value={urgency} onChange={e => setUrgency(e.target.value)} className="portal-input"><option value="">Select</option>{options.urgencies.map(value => <option key={value}>{value}</option>)}</select></FilterField>
            <FilterField label="Waiting Days"><input type="number" value={waitingDays ?? ''} onChange={e => setWaitingDays(e.target.value === '' ? '' : Number(e.target.value))} className="portal-input" /></FilterField>

            <h4 className="col-span-2 mt-2 text-sm font-semibold text-portal-ink">Donor Information</h4>
            <FilterField label="Donor Age"><input type="number" value={donorAge ?? ''} onChange={e => setDonorAge(e.target.value === '' ? '' : Number(e.target.value))} className="portal-input" /></FilterField>
            <FilterField label="Donor Blood Group"><select value={donorBloodGroup} onChange={e => setDonorBloodGroup(e.target.value)} className="portal-input"><option value="">Select</option>{options.blood_groups.map(group => <option key={group}>{group}</option>)}</select></FilterField>
            <FilterField label="Organ Available"><select value={organAvailable} onChange={e => setOrganAvailable(e.target.value)} className="portal-input"><option value="">Select</option>{options.organs_available.map(organ => <option key={organ}>{organ}</option>)}</select></FilterField>
            <FilterField label="Donor HLA"><input value={donorHla} onChange={e => setDonorHla(e.target.value)} className="portal-input" /></FilterField>
            <FilterField label="Donor City"><input value={donorCity} onChange={e => setDonorCity(e.target.value)} className="portal-input" /></FilterField>
            <FilterField label="Donor Hospital"><input value={donorHospital} onChange={e => setDonorHospital(e.target.value)} className="portal-input" /></FilterField>
            <FilterField label="Donor Type"><select value={donorType} onChange={e => setDonorType(e.target.value)} className="portal-input"><option value="">Select</option>{options.donor_types.map(value => <option key={value}>{value}</option>)}</select></FilterField>

            <h4 className="col-span-2 mt-2 text-sm font-semibold text-portal-ink">Medical Information</h4>
            <FilterField label="Doctor Verified"><select value={doctorVerified} onChange={e => setDoctorVerified(e.target.value)} className="portal-input"><option value="Yes">Yes</option><option value="No">No</option></select></FilterField>
            <FilterField label="Organ Condition"><select value={organCondition} onChange={e => setOrganCondition(e.target.value)} className="portal-input">{options.organ_conditions.map(value => <option key={value}>{value}</option>)}</select></FilterField>
            <FilterField label="Infection Status"><select value={infectionStatus} onChange={e => setInfectionStatus(e.target.value)} className="portal-input">{options.infection_statuses.map(value => <option key={value} value={value}>{value === 'No' ? 'Negative' : value === 'Yes' ? 'Positive' : value}</option>)}</select></FilterField>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <PortalButton type="submit" disabled={loading}>{loading ? <><LoaderCircle size={14} className="animate-spin" />Predicting</> : 'Predict Match'}</PortalButton>
          </div>
        </form>
      </section>
      {recipient ? <section className="space-y-4"><div><h3 className="mb-2 text-sm font-semibold text-portal-ink">Selected Recipient Summary</h3><ProfileCard recipient={recipient} compact /></div><div className="portal-card p-4"><div className="mb-3 flex items-center gap-2"><ClipboardCheck size={15} className="text-portal-primary" /><h3 className="text-sm font-semibold text-portal-ink">Medical Compatibility Details</h3></div><div className="space-y-2.5"><ScoreBar label="HLA matching" value={recipient.hlaScore} /><ScoreBar label="Organ need priority" value={recipient.urgencyLevel === 'Critical' ? 96 : 84} tone="info" /><div className="grid grid-cols-2 gap-2 pt-2 text-[11px]"><div className="rounded-lg bg-portal-mint-soft p-2"><span className="text-portal-muted">Organ needed</span><p className="mt-1 font-semibold text-portal-ink">{recipient.requiredOrgan}</p></div><div className="rounded-lg bg-portal-mint-soft p-2"><span className="text-portal-muted">Urgency</span><p className="mt-1 font-semibold text-portal-primary">{recipient.urgencyLevel}</p></div></div></div></div></section> : <section className="portal-card"><EmptyState title="Prediction workspace ready" description="Search for a recipient or load the sample case to run a live AI prediction." icon={<Activity size={22} />} /></section>}
    </div>

    {(loading || prediction || predictionError) && <section className="space-y-3"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-portal-ink">Prediction Result</h3><p className="mt-1 text-[11px] text-portal-muted">{loading ? 'Connecting to the AI matching endpoint...' : predictionError ? 'The prediction request could not be completed.' : 'Live response from the FastAPI model'}</p></div><StatusBadge status={loading ? 'AI Engine Online' : prediction ? prediction.prediction : 'Pending Review'} /></div>{loading ? <div className="grid gap-3 lg:grid-cols-2">{[1, 2].map(item => <div key={item} className="portal-card h-56 animate-pulse bg-white" />)}</div> : predictionError ? <div className="portal-card p-4 text-sm text-portal-ink">{predictionError}</div> : <div className="grid gap-3 lg:grid-cols-2"><div className="portal-card p-4 sm:p-5"><div className="mb-3 flex items-center gap-2"><ClipboardCheck size={15} className="text-portal-primary" /><h4 className="text-sm font-semibold text-portal-ink">Prediction summary</h4></div><div className="space-y-3 text-sm">{resultRows.map(row => <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg bg-portal-mint-soft px-3 py-2"><span className="text-portal-muted">{row.label}</span><span className="font-semibold text-portal-ink">{formatValue(row.value)}</span></div>)}</div></div><div className="portal-card p-4 sm:p-5"><div className="mb-3 flex items-center gap-2"><ClipboardCheck size={15} className="text-portal-primary" /><h4 className="text-sm font-semibold text-portal-ink">Generated features</h4></div><div className="space-y-3 text-sm">{resultRows.slice(2).map(row => <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg border border-portal-border px-3 py-2"><span className="text-portal-muted">{row.label}</span><span className="font-semibold text-portal-ink">{formatValue(row.value)}</span></div>)}</div></div></div>}</section>}
  </div>
}
