import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts'
import { donors, recipients, predictionsByOrgan, monthlyPredictions } from '../data'

const donorsByOrgan = [
  { organ: 'Kidney', count: donors.filter(d => d.organ === 'Kidney').length },
  { organ: 'Liver', count: donors.filter(d => d.organ === 'Liver').length },
  { organ: 'Heart', count: donors.filter(d => d.organ === 'Heart').length },
  { organ: 'Lung', count: donors.filter(d => d.organ === 'Lung').length },
  { organ: 'Cornea', count: donors.filter(d => d.organ === 'Cornea').length },
]

const recipientsByOrgan = [
  { organ: 'Kidney', count: recipients.filter(r => r.requiredOrgan === 'Kidney').length },
  { organ: 'Liver', count: recipients.filter(r => r.requiredOrgan === 'Liver').length },
  { organ: 'Heart', count: recipients.filter(r => r.requiredOrgan === 'Heart').length },
  { organ: 'Lung', count: recipients.filter(r => r.requiredOrgan === 'Lung').length },
  { organ: 'Cornea', count: recipients.filter(r => r.requiredOrgan === 'Cornea').length },
]

const suitableData = [
  { name: 'Suitable', value: 44, color: '#0F766E' },
  { name: 'Not Suitable', value: 17, color: '#FCA5A5' },
]

const avgCompatData = [
  { month: 'Aug', avg: 76 },
  { month: 'Sep', avg: 79 },
  { month: 'Oct', avg: 78 },
  { month: 'Nov', avg: 83 },
  { month: 'Dec', avg: 85 },
  { month: 'Jan', avg: 87 },
]

function ChartCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#D1FAE5] shadow-sm p-5">
      <h3 className="text-sm font-semibold text-[#1F2937] font-display mb-0.5">{title}</h3>
      <p className="text-xs text-[#6B7280] mb-4">{desc}</p>
      {children}
    </div>
  )
}

function MetCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#D1FAE5] shadow-sm p-5">
      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-[#1F2937] font-display mt-1.5">{value}</p>
      <p className="text-xs text-[#6B7280] mt-1">{sub}</p>
    </div>
  )
}

export default function Analytics() {
  return (
    <div className="space-y-5">
      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetCard label="Total Predictions" value="217" sub="All time"/>
        <MetCard label="Suitable Matches" value="161" sub="74% success rate"/>
        <MetCard label="Avg. Compatibility" value="84%" sub="Across all predictions"/>
        <MetCard label="Prediction Accuracy" value="92.4%" sub="Model performance"/>
      </div>

      {/* Row 1: Donors by Organ + Recipients by Organ */}
      <div className="grid grid-cols-2 gap-5">
        <ChartCard title="Donors by Organ" desc="Available donors classified by organ type">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donorsByOrgan} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0FDF9" vertical={false}/>
              <XAxis dataKey="organ" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D1FAE5', fontSize: 11 }}/>
              <Bar dataKey="count" fill="#0F766E" radius={[5, 5, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Recipients by Organ" desc="Patients awaiting transplant by organ type">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={recipientsByOrgan} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0FDF9" vertical={false}/>
              <XAxis dataKey="organ" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D1FAE5', fontSize: 11 }}/>
              <Bar dataKey="count" fill="#14B8A6" radius={[5, 5, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Suitable vs Not Suitable + Prediction Accuracy */}
      <div className="grid grid-cols-3 gap-5">
        <ChartCard title="Suitable vs Not Suitable" desc="Overall prediction outcome distribution">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={suitableData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                {suitableData.map((e, i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D1FAE5', fontSize: 11 }}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {suitableData.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}/>
                  <span className="text-xs text-[#6B7280]">{s.name}</span>
                </div>
                <span className="text-sm font-bold text-[#1F2937]">{s.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Monthly Predictions" desc="Total predictions generated per month">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyPredictions}>
              <defs>
                <linearGradient id="predG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F766E" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0FDF9" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D1FAE5', fontSize: 11 }}/>
              <Area type="monotone" dataKey="predictions" stroke="#0F766E" strokeWidth={2} fill="url(#predG)" dot={{ r: 3, fill: '#0F766E' }}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg. Compatibility Score" desc="Monthly average AI compatibility score trend">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={avgCompatData}>
              <defs>
                <linearGradient id="compatG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0FDF9" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D1FAE5', fontSize: 11 }} formatter={v => [`${v}%`, 'Avg. Score']}/>
              <Area type="monotone" dataKey="avg" stroke="#14B8A6" strokeWidth={2} fill="url(#compatG)" dot={{ r: 3, fill: '#14B8A6' }}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Prediction Accuracy by organ */}
      <ChartCard title="Prediction Accuracy by Organ" desc="AI suitable match rate across organ types">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={predictionsByOrgan} barSize={28} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0FDF9" vertical={false}/>
            <XAxis dataKey="organ" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D1FAE5', fontSize: 12 }}/>
            <Legend formatter={v => <span style={{ fontSize: 11, color: '#6B7280' }}>{v}</span>}/>
            <Bar dataKey="predictions" name="Total Predictions" fill="#D1FAE5" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="suitable" name="Suitable Matches" fill="#0F766E" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
