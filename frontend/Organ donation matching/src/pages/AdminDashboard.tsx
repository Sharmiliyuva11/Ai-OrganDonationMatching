import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { donors, recipients, predictionHistory, predictionsByOrgan } from '../data'

const suitablePie = [
  { name: 'Suitable', value: predictionHistory.filter(p => p.prediction === 'Suitable').length, color: '#0F766E' },
  { name: 'Not Suitable', value: predictionHistory.filter(p => p.prediction === 'Not Suitable').length, color: '#FCA5A5' },
]

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#D1FAE5] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">{label}</p>
          <p className="text-3xl font-bold text-[#1F2937] font-display mt-1.5">{value}</p>
          <p className="text-xs text-[#6B7280] mt-1">{sub}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function PredBadge({ prediction }: { prediction: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
      ${prediction === 'Suitable' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${prediction === 'Suitable' ? 'bg-teal-500' : 'bg-red-400'}`}/>
      {prediction}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    'Approved': 'bg-green-50 text-green-700',
    'Pending': 'bg-amber-50 text-amber-700',
    'Under Review': 'bg-blue-50 text-blue-700',
    'Rejected': 'bg-red-50 text-red-600',
    'Completed': 'bg-slate-100 text-slate-600',
  }
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cls[status] || ''}`}>{status}</span>
}

export default function Dashboard() {
  const successfulMatches = predictionHistory.filter(p => p.status === 'Approved' || p.status === 'Completed').length
  const todayPreds = predictionHistory.filter(p => p.date === '2024-01-15').length

  return (
    <div className="space-y-6">
      {/* 4 stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Donors"
          value={donors.length}
          sub="Registered in system"
          color="bg-teal-50"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
        />
        <StatCard
          label="Total Recipients"
          value={recipients.length}
          sub="Awaiting transplant"
          color="bg-blue-50"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>}
        />
        <StatCard
          label="Today's Predictions"
          value={todayPreds || 3}
          sub="AI-generated today"
          color="bg-purple-50"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>}
        />
        <StatCard
          label="Successful Matches"
          value={successfulMatches}
          sub="Approved & completed"
          color="bg-green-50"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}
        />
      </div>

      {/* Table + Pie chart */}
      <div className="grid grid-cols-3 gap-5">
        {/* Recent Prediction Table */}
        <div className="col-span-2 bg-white rounded-2xl border border-[#D1FAE5] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D1FAE5]">
            <h3 className="text-sm font-semibold text-[#1F2937] font-display">Recent Predictions</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Latest AI-generated organ compatibility predictions</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F0FDF9]">
                {['Recipient ID', 'Donor ID', 'Organ', 'Compatibility', 'Prediction', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#0F766E] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0FDF9]">
              {predictionHistory.slice(0, 6).map(p => (
                <tr key={p.id} className="hover:bg-[#F0FDF9] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#0F766E] font-semibold">{p.recipientId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#6B7280]">{p.donorId}</td>
                  <td className="px-4 py-3 text-[#1F2937] font-medium">{p.organ}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${p.compatibilityScore}%`, background: '#0F766E' }}/>
                      </div>
                      <span className="text-xs font-bold text-[#1F2937]">{p.compatibilityScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><PredBadge prediction={p.prediction}/></td>
                  <td className="px-4 py-3"><StatusBadge status={p.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-[#D1FAE5] shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] font-display mb-1">Prediction Outcomes</h3>
          <p className="text-xs text-[#6B7280] mb-4">Suitable vs Not Suitable</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={suitablePie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {suitablePie.map((e, i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D1FAE5', fontSize: 12 }}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {suitablePie.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }}/>
                  <span className="text-xs text-[#6B7280]">{s.name}</span>
                </div>
                <span className="text-sm font-bold text-[#1F2937]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart: Predictions by Organ */}
      <div className="bg-white rounded-2xl border border-[#D1FAE5] shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#1F2937] font-display mb-1">Predictions by Organ</h3>
        <p className="text-xs text-[#6B7280] mb-4">Total predictions and suitable matches per organ type</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={predictionsByOrgan} barSize={24} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0FDF9" vertical={false}/>
            <XAxis dataKey="organ" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D1FAE5', fontSize: 12 }}/>
            <Bar dataKey="predictions" name="Total Predictions" fill="#D1FAE5" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="suitable" name="Suitable Matches" fill="#0F766E" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
