import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { UserRoundPlus } from 'lucide-react'
import { getApiErrorMessage, getDatasetOverview, type DatasetOverview } from '../api/api'
import { useNav } from '../context'

const empty: DatasetOverview = { total_donors: 0, total_recipients: 0, total_matches: 0, donors_by_organ: [], recipients_by_organ: [], recipients_by_urgency: [], prediction_history_available: false }

export default function AdminDashboard() {
  const { navigate } = useNav()
  const [overview, setOverview] = useState<DatasetOverview>(empty)
  const [error, setError] = useState('')
  useEffect(() => { getDatasetOverview().then(setOverview).catch(err => setError(getApiErrorMessage(err, 'Unable to load live dataset metrics.'))) }, [])
  const organData = overview.donors_by_organ.map(item => ({ organ: item.organ, donors: item.count, recipients: overview.recipients_by_organ.find(row => row.organ === item.organ)?.count ?? 0 }))
  return <div className="space-y-6">
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#D1FAE5] bg-white p-5 shadow-sm"><div><h2 className="text-lg font-semibold text-[#1F2937]">Doctor Management</h2><p className="mt-1 text-sm text-[#6B7280]">Create a role-protected doctor account in the existing SQLite database.</p></div><button onClick={() => navigate('create-doctor-account')} className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white"><UserRoundPlus size={16} />Create Doctor Account</button></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-3"><Metric label="Total Donors" value={overview.total_donors} description="from donors.csv" /><Metric label="Total Recipients" value={overview.total_recipients} description="from recipients.csv" /><Metric label="Dataset Matches" value={overview.total_matches} description="from matches.csv" /></div>
    <section className="rounded-2xl border border-[#D1FAE5] bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-800">Donors and recipients by organ</h3><p className="mb-4 text-xs text-slate-500">Live aggregation of the project datasets.</p><ResponsiveContainer width="100%" height={280}><BarChart data={organData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="organ"/><YAxis/><Tooltip/><Bar dataKey="donors" fill="#0F766E"/><Bar dataKey="recipients" fill="#60A5FA"/></BarChart></ResponsiveContainer></section>
    <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Prediction history and outcome metrics are not displayed because the application does not persist prediction events. Run a prediction or matching workflow to generate a real, printable report from its live result.</p>
  </div>
}

function Metric({ label, value, description }: { label: string; value: number; description: string }) { return <div className="rounded-2xl border border-[#D1FAE5] bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-800">{value}</p><p className="mt-1 text-xs text-slate-500">{description}</p></div> }
