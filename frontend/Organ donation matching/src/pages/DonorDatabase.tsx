import { useEffect, useState } from 'react'
import { getApiErrorMessage, getDonors, type DatasetDonor } from '../api/api'
import { useMetadataOptions } from '../hooks/useMetadataOptions'

export default function DonorDatabase() {
  const { options } = useMetadataOptions()
  const [search, setSearch] = useState('')
  const [organ, setOrgan] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ items: DatasetDonor[]; total: number }>({ items: [], total: 0 })
  const [error, setError] = useState('')
  const pageSize = 25

  useEffect(() => {
    let cancelled = false
    getDonors({ search, organ, page, page_size: pageSize })
      .then(result => { if (!cancelled) { setData(result); setError('') } })
      .catch(err => { if (!cancelled) setError(getApiErrorMessage(err, 'Unable to load donor records.')) })
    return () => { cancelled = true }
  }, [search, organ, page])

  const pages = Math.max(1, Math.ceil(data.total / pageSize))
  return <div className="space-y-4">
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3">
      <input value={search} onChange={e => { setPage(1); setSearch(e.target.value) }} placeholder="Search by donor ID, hospital, city, organ, or blood group" className="flex-1 min-w-60 portal-input" />
      <select value={organ} onChange={e => { setPage(1); setOrgan(e.target.value) }} className="portal-input"><option value="">All organs</option>{options.organs_available.map(value => <option key={value}>{value}</option>)}</select>
      <span className="self-center text-xs text-slate-500">{data.total} real donor records</span>
    </div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-sm"><thead><tr className="bg-slate-50 text-left text-xs text-slate-500">{['Donor ID', 'Age / gender', 'Blood group', 'Organ', 'HLA', 'Condition', 'Hospital / city', 'Availability'].map(column => <th className="px-4 py-3" key={column}>{column}</th>)}</tr></thead><tbody>{data.items.map(donor => <tr key={donor.donor_id} className="border-t border-slate-100"><td className="px-4 py-3 font-mono font-semibold text-blue-700">{donor.donor_id}</td><td className="px-4 py-3">{donor.age} / {donor.gender}</td><td className="px-4 py-3">{donor.blood_group}</td><td className="px-4 py-3">{donor.organ_available}</td><td className="px-4 py-3">{donor.hla_type}</td><td className="px-4 py-3">{donor.organ_condition}</td><td className="px-4 py-3">{donor.hospital} / {donor.city}</td><td className="px-4 py-3">{donor.infection_status === 'No' ? 'Eligible for matching' : 'Review required'}</td></tr>)}</tbody></table>{!data.items.length && !error && <p className="p-8 text-center text-sm text-slate-500">No donor records match these filters.</p>}</div>
    <div className="flex items-center justify-between text-sm"><button disabled={page === 1} onClick={() => setPage(value => value - 1)} className="portal-button">Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setPage(value => value + 1)} className="portal-button">Next</button></div>
  </div>
}
