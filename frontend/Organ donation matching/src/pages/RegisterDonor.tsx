import { useState } from 'react'
import { getApiErrorMessage, registerDonor, type RegisterDonorRequest } from '../api/api'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const organs = ['Kidney', 'Liver', 'Heart', 'Lung', 'Cornea', 'Pancreas', 'Bone Marrow']
const hospitals = ['City Hospital Karachi', 'Aga Khan Hospital', 'Jinnah Hospital', 'Services Hospital', 'Liaquat Hospital', 'PKLI', 'Shaukat Khanum', 'NICVD', 'CMH Rawalpindi', 'Holy Family Hospital']
const cities = ['Karachi', 'Lahore', 'Rawalpindi', 'Islamabad', 'Hyderabad', 'Peshawar', 'Quetta', 'Multan']
const hlaTypes = ['HLA-A', 'HLA-B', 'HLA-C', 'HLA-DR', 'HLA-DQ', 'HLA-DP']

const inputCls = "w-full px-4 py-2.5 border border-[#D1FAE5] rounded-xl text-sm text-[#1F2937] placeholder-[#9CA3AF] bg-white focus:outline-none transition-all"
const selectCls = "w-full px-4 py-2.5 border border-[#D1FAE5] rounded-xl text-sm text-[#1F2937] bg-white focus:outline-none transition-all appearance-none"

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#D1FAE5]">
      <div className="w-1 h-6 rounded-full" style={{ background: '#0F766E' }}/>
      <div>
        <h3 className="text-sm font-semibold text-[#1F2937]">{title}</h3>
        <p className="text-xs text-[#6B7280]">{desc}</p>
      </div>
    </div>
  )
}

export default function DonorRegistration() {
  const [form, setForm] = useState({
    donorId: '', fullName: '', age: '', gender: '',
    bloodGroup: '', organ: '', hlaType: '', organCondition: '', doctorVerified: 'Yes', infectionStatus: 'Negative',
    hospital: '', city: '', donorType: 'Living',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    const payload: RegisterDonorRequest = {
      ...(form.donorId.trim() ? { donor_id: form.donorId.trim() } : {}),
      donor_type: form.donorType,
      age: Number(form.age),
      gender: form.gender,
      blood_group: form.bloodGroup,
      organ_available: form.organ,
      hla_type: form.hlaType,
      infection_status: form.infectionStatus === 'Positive' ? 'Yes' : 'No',
      organ_condition: form.organCondition,
      city: form.city,
      hospital: form.hospital,
    }

    try {
      const response = await registerDonor(payload)
      setSuccessMessage(`Donor registered successfully with ID ${response.donor_id}.`)
      setForm(prev => ({
        ...prev,
        donorId: '',
        fullName: '',
        age: '',
        gender: '',
        bloodGroup: '',
        organ: '',
        hlaType: '',
        organCondition: '',
        infectionStatus: 'Negative',
        hospital: '',
        city: '',
        donorType: 'Living',
      }))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to register donor. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm border" style={{ background: '#F0FDF9', borderColor: '#D1FAE5', color: '#0F766E' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {successMessage}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#D1FAE5] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#D1FAE5]" style={{ background: '#F0FDF9' }}>
          <h2 className="text-base font-semibold text-[#1F2937] font-display">Donor Registration Form</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Fields marked * are required</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <SectionHeader title="Basic Information" desc="Personal identification details"/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Donor ID" required>
                <input value={form.donorId} readOnly className={`${inputCls} bg-slate-50 text-[#6B7280]`}/>
              </Field>
              <Field label="Full Name" required>
                <input value={form.fullName} onChange={set('fullName')} placeholder="Enter full name" className={inputCls} required
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #0F766E33'}
                  onBlur={e => e.target.style.boxShadow = ''}/>
              </Field>
              <Field label="Age" required>
                <input type="number" value={form.age} onChange={set('age')} placeholder="Years" min="18" max="65" className={inputCls} required
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #0F766E33'}
                  onBlur={e => e.target.style.boxShadow = ''}/>
              </Field>
              <Field label="Gender" required>
                <select value={form.gender} onChange={set('gender')} className={selectCls} required>
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <SectionHeader title="Medical Information" desc="Clinical and organ compatibility data"/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Blood Group" required>
                <select value={form.bloodGroup} onChange={set('bloodGroup')} className={selectCls} required>
                  <option value="">Select blood group</option>
                  {bloodGroups.map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Organ Available" required>
                <select value={form.organ} onChange={set('organ')} className={selectCls} required>
                  <option value="">Select organ</option>
                  {organs.map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="HLA Type" required>
                <select value={form.hlaType} onChange={set('hlaType')} className={selectCls} required>
                  <option value="">Select HLA type</option>
                  {hlaTypes.map(h => <option key={h}>{h}</option>)}
                </select>
              </Field>
              <Field label="Organ Condition" required>
                <select value={form.organCondition} onChange={set('organCondition')} className={selectCls} required>
                  <option value="">Select condition</option>
                  <option>Excellent</option><option>Good</option><option>Average</option>
                </select>
              </Field>
              <Field label="Doctor Verified">
                <select value={form.doctorVerified} onChange={set('doctorVerified')} className={selectCls}>
                  <option>Yes</option><option>No</option>
                </select>
              </Field>
              <Field label="Infection Status">
                <select value={form.infectionStatus} onChange={set('infectionStatus')} className={selectCls}>
                  <option>Negative</option><option>Positive</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Hospital Information */}
          <div>
            <SectionHeader title="Hospital Information" desc="Registration and location details"/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hospital" required>
                <select value={form.hospital} onChange={set('hospital')} className={selectCls} required>
                  <option value="">Select hospital</option>
                  {hospitals.map(h => <option key={h}>{h}</option>)}
                </select>
              </Field>
              <Field label="City" required>
                <select value={form.city} onChange={set('city')} className={selectCls} required>
                  <option value="">Select city</option>
                  {cities.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Donor Type">
                <select value={form.donorType} onChange={set('donorType')} className={selectCls}>
                  <option>Living</option><option>Deceased</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#D1FAE5]">
            <button type="submit" disabled={loading} className="px-7 py-2.5 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-70" style={{ background: '#0F766E' }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = '#0a5c55' }}
              onMouseLeave={e => (e.target as HTMLElement).style.background = '#0F766E'}>
              {loading ? 'Registering...' : 'Register Donor'}
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, fullName: '', age: '', gender: '', bloodGroup: '', organ: '', hlaType: '', organCondition: '', hospital: '', city: '' }))}
              className="px-6 py-2.5 border border-[#D1FAE5] text-[#6B7280] hover:bg-[#F0FDF9] text-sm font-medium rounded-xl transition-colors">
              Reset
            </button>
            <button type="button" className="px-6 py-2.5 text-[#6B7280] hover:text-[#1F2937] text-sm font-medium rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
