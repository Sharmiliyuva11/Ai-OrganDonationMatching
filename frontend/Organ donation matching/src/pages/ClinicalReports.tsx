import { FileBarChart } from 'lucide-react'
import { PageHeader } from '../components/PortalPrimitives'

export default function ClinicalReports() {
  return <div className="space-y-5"><PageHeader title="Clinical Reports" subtitle="Reports must be generated from a live matching or prediction result." /><section className="portal-card p-6 text-center"><FileBarChart className="mx-auto text-portal-primary" size={32}/><h3 className="mt-4 text-base font-semibold text-portal-ink">No persisted clinical report history</h3><p className="mx-auto mt-2 max-w-xl text-sm text-portal-muted">This application does not persist prediction or clinical approval events, so historic totals and PDF entries are unavailable. Static demo reports have been removed. Use the export action on a live prediction or matching result to create a printable report with its actual donor/recipient IDs, compatibility factors, score, and timestamp.</p></section></div>
}
