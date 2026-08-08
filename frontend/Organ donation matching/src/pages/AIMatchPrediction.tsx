import { useState, type FormEvent } from 'react'
import { Activity, ClipboardCheck, LoaderCircle, Search } from 'lucide-react'
import { donors, recipients, type RecipientRecord } from '../data'
import { EmptyState, FilterField, PageHeader, PortalButton, ProfileCard, ScoreBar, StatusBadge } from '../components/PortalPrimitives'
import { predictMatch, type MatchPredictionResponse } from '../api/api'

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
  const [recipientId, setRecipientId] = useState('')
  const [recipient, setRecipient] = useState<RecipientRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [prediction, setPrediction] = useState<MatchPredictionResponse | null>(null)
  const [predictionError, setPredictionError] = useState('')

  const predict = async (id: string) => {
    const found = recipients.find(item => item.id.toLowerCase() === id.trim().toLowerCase())
    if (!found) {
      setRecipient(null)
      setPrediction(null)
      setPredictionError('')
      setFeedback('Enter a valid recipient ID such as R001.')
      return
    }

    const chosenDonor = resolveDonor(found)

    setLoading(true)
    setRecipient(found)
    setPrediction(null)
    setPredictionError('')

    try {
      const payload = {
        donor_age: chosenDonor.age,
        recipient_age: found.age,
        donor_blood_group: chosenDonor.bloodGroup,
        recipient_blood_group: found.bloodGroup,
        organ_available: chosenDonor.organ,
        organ_needed: found.requiredOrgan,
        donor_hla: String(chosenDonor.hlaScore),
        recipient_hla: String(found.hlaScore),
        donor_city: chosenDonor.city,
        recipient_city: found.city,
        donor_hospital: chosenDonor.hospital,
        recipient_hospital: found.hospital,
        donor_type: chosenDonor.donorType,
        doctor_verified: chosenDonor.doctorVerified ? 'Yes' : 'No',
        urgency: mapUrgency(found.urgencyLevel),
        waiting_days: found.waitingDays,
        organ_condition: mapOrganCondition(chosenDonor.organCondition),
        infection_status: chosenDonor.infectionStatus.toLowerCase().includes('positive') ? 'Yes' : 'No',
      }

      const response = await predictMatch(payload)
      setPrediction(response)
      setFeedback(`Prediction completed for ${found.id}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reach the prediction service.'
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

  const showFeedback = (message: string) => {
    setFeedback(message)
    window.setTimeout(() => setFeedback(''), 2300)
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
    <PageHeader title="AI Match Prediction" subtitle="Predict donor-recipient compatibility using the AI matching engine" actions={<PortalButton onClick={() => { void predict(recipientId || 'R001') }} disabled={loading}><Activity size={14} />{loading ? 'Running...' : 'Run Prediction'}</PortalButton>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)]">
      <section className="portal-card p-4 sm:p-5"><div className="mb-4 flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-portal-mint text-portal-primary"><Search size={17} /></div><div><h3 className="text-sm font-semibold text-portal-ink">Recipient Search</h3><p className="mt-1 text-[11px] text-portal-muted">Select a recipient to generate a live AI prediction</p></div></div><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end"><FilterField label="Recipient ID" icon={<Search size={14} />} className="flex-1"><input value={recipientId} onChange={event => setRecipientId(event.target.value)} placeholder="e.g. R001" className="portal-input w-full pl-9 pr-3 text-sm" /></FilterField><PortalButton type="submit" disabled={loading || !recipientId}>{loading ? <><LoaderCircle size={14} className="animate-spin" />Predicting</> : 'Predict Match'}</PortalButton><PortalButton type="button" variant="secondary" onClick={() => { setRecipientId('R001'); void predict('R001') }}>Load Sample</PortalButton></form></section>
      {recipient ? <section className="space-y-4"><div><h3 className="mb-2 text-sm font-semibold text-portal-ink">Selected Recipient Summary</h3><ProfileCard recipient={recipient} compact /></div><div className="portal-card p-4"><div className="mb-3 flex items-center gap-2"><ClipboardCheck size={15} className="text-portal-primary" /><h3 className="text-sm font-semibold text-portal-ink">Medical Compatibility Details</h3></div><div className="space-y-2.5"><ScoreBar label="HLA matching" value={recipient.hlaScore} /><ScoreBar label="Organ need priority" value={recipient.urgencyLevel === 'Critical' ? 96 : 84} tone="info" /><div className="grid grid-cols-2 gap-2 pt-2 text-[11px]"><div className="rounded-lg bg-portal-mint-soft p-2"><span className="text-portal-muted">Organ needed</span><p className="mt-1 font-semibold text-portal-ink">{recipient.requiredOrgan}</p></div><div className="rounded-lg bg-portal-mint-soft p-2"><span className="text-portal-muted">Urgency</span><p className="mt-1 font-semibold text-portal-primary">{recipient.urgencyLevel}</p></div></div></div></div></section> : <section className="portal-card"><EmptyState title="Prediction workspace ready" description="Search for a recipient or load the sample case to run a live AI prediction." icon={<Activity size={22} />} /></section>}
    </div>

    {(loading || prediction || predictionError) && <section className="space-y-3"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-portal-ink">Prediction Result</h3><p className="mt-1 text-[11px] text-portal-muted">{loading ? 'Connecting to the AI matching endpoint...' : predictionError ? 'The prediction request could not be completed.' : 'Live response from the FastAPI model'}</p></div><StatusBadge status={loading ? 'AI Engine Online' : prediction ? prediction.prediction : 'Pending Review'} /></div>{loading ? <div className="grid gap-3 lg:grid-cols-2">{[1, 2].map(item => <div key={item} className="portal-card h-56 animate-pulse bg-white" />)}</div> : predictionError ? <div className="portal-card p-4 text-sm text-portal-ink">{predictionError}</div> : <div className="grid gap-3 lg:grid-cols-2"><div className="portal-card p-4 sm:p-5"><div className="mb-3 flex items-center gap-2"><ClipboardCheck size={15} className="text-portal-primary" /><h4 className="text-sm font-semibold text-portal-ink">Prediction summary</h4></div><div className="space-y-3 text-sm">{resultRows.map(row => <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg bg-portal-mint-soft px-3 py-2"><span className="text-portal-muted">{row.label}</span><span className="font-semibold text-portal-ink">{formatValue(row.value)}</span></div>)}</div></div><div className="portal-card p-4 sm:p-5"><div className="mb-3 flex items-center gap-2"><ClipboardCheck size={15} className="text-portal-primary" /><h4 className="text-sm font-semibold text-portal-ink">Generated features</h4></div><div className="space-y-3 text-sm">{resultRows.slice(2).map(row => <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg border border-portal-border px-3 py-2"><span className="text-portal-muted">{row.label}</span><span className="font-semibold text-portal-ink">{formatValue(row.value)}</span></div>)}</div></div></div>}</section>}
  </div>
}
