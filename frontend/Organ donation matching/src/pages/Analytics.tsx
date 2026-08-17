import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { getApiErrorMessage, getDatasetOverview, type DatasetOverview } from '../api/api'

const empty: DatasetOverview = { total_donors: 0, total_recipients: 0, total_matches: 0, donors_by_organ: [], recipients_by_organ: [], recipients_by_urgency: [], prediction_history_available: false }

export default function Analytics() {
  const [data, setData] = useState<DatasetOverview>(empty)
  const [error, setError] = useState('')
  useEffect(() => { getDatasetOverview().then(setData).catch(err => setError(getApiErrorMessage(err, 'Unable to load live analytics.'))) }, [])
  return <div className="space-y-5">
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-3"><Card label="Donors" value={data.total_donors} source="donors.csv"/><Card label="Recipients" value={data.total_recipients} source="recipients.csv"/><Card label="Dataset match rows" value={data.total_matches} source="matches.csv"/></div>
    <div className="grid gap-5 lg:grid-cols-2"><Chart title="Donors by available organ"><BarChart data={data.donors_by_organ}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="organ"/><YAxis/><Tooltip/><Bar dataKey="count" fill="#0F766E"/></BarChart></Chart><Chart title="Recipients by required organ"><BarChart data={data.recipients_by_organ}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="organ"/><YAxis/><Tooltip/><Bar dataKey="count" fill="#60A5FA"/></BarChart></Chart></div>
    <Chart title="Recipients by urgency"><PieChart><Pie data={data.recipients_by_urgency} dataKey="count" nameKey="urgency" outerRadius={100}>{data.recipients_by_urgency.map((item, index) => <Cell key={item.urgency} fill={['#0F766E','#14B8A6','#60A5FA','#F59E0B'][index % 4]}/>)}</Pie><Tooltip/></PieChart></Chart>
    <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Prediction accuracy, success rate, and monthly prediction charts are unavailable because no prediction history is persisted. They are intentionally not estimated.</p>
  </div>
}
function Card({ label, value, source }: { label: string; value: number; source: string }) { return <div className="rounded-2xl border border-[#D1FAE5] bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-800">{value}</p><p className="mt-1 text-xs text-slate-500">{source}</p></div> }
function Chart({ title, children }: { title: string; children: React.ReactElement }) { return <section className="rounded-2xl border border-[#D1FAE5] bg-white p-5 shadow-sm"><h3 className="mb-4 font-semibold text-slate-800">{title}</h3><ResponsiveContainer width="100%" height={260}>{children}</ResponsiveContainer></section> }
