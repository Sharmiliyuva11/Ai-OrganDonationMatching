import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { predictionHistory } from '../data'

const reportSummary = [
  { label: 'Total Predictions', value: predictionHistory.length, color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  { label: 'Approved Matches', value: predictionHistory.filter(p => p.status === 'Approved').length, color: 'bg-green-50 border-green-200', text: 'text-green-700' },
  { label: 'Rejected', value: predictionHistory.filter(p => p.status === 'Rejected').length, color: 'bg-red-50 border-red-200', text: 'text-red-700' },
  { label: 'Pending Review', value: predictionHistory.filter(p => p.status === 'Pending').length, color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  { label: 'Completed', value: predictionHistory.filter(p => p.status === 'Completed').length, color: 'bg-slate-50 border-slate-200', text: 'text-slate-700' },
]

const doctorPerformance = [
  { name: 'Dr. Kamran Malik', predictions: 3, approved: 2, avgScore: 93 },
  { name: 'Dr. Amina Shah', predictions: 3, approved: 1, avgScore: 85 },
  { name: 'Dr. Farrukh Baig', predictions: 2, approved: 1, avgScore: 78 },
]

const weeklyTrend = [
  { week: 'W1', predictions: 8, approved: 6 },
  { week: 'W2', predictions: 12, approved: 9 },
  { week: 'W3', predictions: 10, approved: 7 },
  { week: 'W4', predictions: 15, approved: 13 },
]

const statusDist = [
  { name: 'Approved', value: 2, color: '#22c55e' },
  { name: 'Completed', value: 2, color: '#94a3b8' },
  { name: 'Pending', value: 2, color: '#3b82f6' },
  { name: 'Under Review', value: 1, color: '#f59e0b' },
  { name: 'Rejected', value: 1, color: '#ef4444' },
]

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-display">Analytics & Reports</h3>
            <p className="text-xs text-slate-400 mt-0.5">Prediction analytics and performance reports</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Doctors</option>
              <option>Dr. Kamran Malik</option>
              <option>Dr. Amina Shah</option>
              <option>Dr. Farrukh Baig</option>
            </select>
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 6 Months</option>
              <option>Last 3 Months</option>
              <option>Last Month</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4">
        {reportSummary.map((s) => (
          <div key={s.label} className={`border ${s.color} rounded-xl p-4`}>
            <p className={`text-3xl font-bold font-display ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 font-display mb-1">Weekly Prediction Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Predictions generated vs approved per week</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}/>
              <Area type="monotone" dataKey="predictions" name="Predictions" stroke="#3b82f6" strokeWidth={2} fill="url(#predGrad)" dot={{ r: 4, fill: '#3b82f6' }}/>
              <Area type="monotone" dataKey="approved" name="Approved" stroke="#22c55e" strokeWidth={2} fill="url(#appGrad)" dot={{ r: 4, fill: '#22c55e' }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 font-display mb-1">Prediction Status Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Breakdown by outcome status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {statusDist.map((e, i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {statusDist.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }}/>
                <span className="text-xs text-slate-500 truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 font-display">Doctor Performance Summary</h3>
          <p className="text-xs text-slate-400 mt-0.5">Prediction statistics by doctor</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Doctor', 'Total Predictions', 'Approved', 'Approval Rate', 'Avg. Compatibility Score'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctorPerformance.map((d) => {
              const rate = Math.round((d.approved / d.predictions) * 100)
              return (
                <tr key={d.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold">
                        {d.name.split(' ')[1][0]}
                      </div>
                      <span className="font-medium text-slate-900">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{d.predictions}</td>
                  <td className="px-5 py-4 font-semibold text-green-600">{d.approved}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${rate}%` }}/>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{rate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${d.avgScore}%` }}/>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{d.avgScore}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
