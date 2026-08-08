export type UrgencyLevel = 'Critical' | 'High' | 'Moderate' | 'Medium' | 'Low'
export type VerificationStatus = 'Doctor Verified' | 'Verification Pending'
export type MatchStatus = 'Suitable Match' | 'Pending Review' | 'Not Suitable'
export type ReportStatus = 'Completed' | 'Pending Review' | 'Report Generated'

export interface DonorRecord {
  id: string
  name: string
  age: number
  gender: string
  bloodGroup: string
  organ: string
  hospital: string
  city: string
  doctorVerified: boolean
  hlaScore: number
  organCondition: string
  infectionStatus: string
  status: string
  donorType: string
}

export interface RecipientRecord {
  id: string
  name: string
  age: number
  gender: string
  bloodGroup: string
  requiredOrgan: string
  urgencyLevel: UrgencyLevel
  waitingDays: number
  hospital: string
  city: string
  hlaScore: number
  status: string
}

export interface DonorRecommendation {
  id: string
  name: string
  age: number
  bloodGroup: string
  organ: string
  hospital: string
  city: string
  compatibility: number
  aiConfidence: number
  hlaScore: number
  organCondition: string
  infectionStatus: string
  verification: VerificationStatus
  status: MatchStatus
}

export interface RecipientCase {
  id: string
  name: string
  requiredOrgan: string
  bloodGroup: string
  urgency: UrgencyLevel
  status: string
}

export interface ScheduleItem {
  time: string
  title: string
  location: string
  patientId?: string
}

export interface NotificationItem {
  id: string
  message: string
  timestamp: string
  tone: 'success' | 'danger' | 'info' | 'warning'
}

export interface UpcomingSurgery {
  patient: string
  organ: string
  dateLabel: string
  operatingTheatre: string
}

export interface PredictionRecord {
  id: string
  recipient: string
  recipientId: string
  donor: string
  donorId: string
  organ: string
  compatibility: number
  aiConfidence: number
  date: string
  status: ReportStatus
}

export interface ClinicalReport {
  id: string
  recipient: string
  donor: string
  organ: string
  generatedDate: string
  status: ReportStatus
}

export const doctorProfile = {
  name: 'Dr. Ayesha Raza',
  initials: 'AR',
  role: 'Transplant Surgeon',
  hospital: 'St. Mary Institute of Transplant Medicine',
  unit: 'Doctor Portal',
}

export const donors: DonorRecord[] = [
  { id: 'D001', name: 'Ahmad Raza', age: 34, gender: 'Male', bloodGroup: 'A+', organ: 'Kidney', hospital: 'City Hospital Karachi', city: 'Karachi', doctorVerified: true, hlaScore: 87, organCondition: 'Good', infectionStatus: 'Negative', status: 'Available', donorType: 'Living' },
  { id: 'D002', name: 'Sara Khan', age: 28, gender: 'Female', bloodGroup: 'O+', organ: 'Liver', hospital: 'Aga Khan Hospital', city: 'Karachi', doctorVerified: true, hlaScore: 92, organCondition: 'Excellent', infectionStatus: 'Negative', status: 'Available', donorType: 'Living' },
  { id: 'D003', name: 'Muhammad Ali', age: 45, gender: 'Male', bloodGroup: 'B+', organ: 'Heart', hospital: 'Jinnah Hospital', city: 'Lahore', doctorVerified: false, hlaScore: 75, organCondition: 'Good', infectionStatus: 'Negative', status: 'Under Review', donorType: 'Deceased' },
  { id: 'D004', name: 'Fatima Malik', age: 31, gender: 'Female', bloodGroup: 'AB+', organ: 'Cornea', hospital: 'Services Hospital', city: 'Lahore', doctorVerified: true, hlaScore: 88, organCondition: 'Good', infectionStatus: 'Negative', status: 'Available', donorType: 'Living' },
  { id: 'D005', name: 'Usman Ahmed', age: 39, gender: 'Male', bloodGroup: 'A-', organ: 'Kidney', hospital: 'Liaquat Hospital', city: 'Hyderabad', doctorVerified: true, hlaScore: 82, organCondition: 'Satisfactory', infectionStatus: 'Negative', status: 'Available', donorType: 'Living' },
  { id: 'D006', name: 'Ayesha Siddiqui', age: 26, gender: 'Female', bloodGroup: 'O-', organ: 'Liver', hospital: 'PKLI', city: 'Lahore', doctorVerified: true, hlaScore: 95, organCondition: 'Excellent', infectionStatus: 'Negative', status: 'Available', donorType: 'Living' },
  { id: 'D007', name: 'Bilal Hassan', age: 52, gender: 'Male', bloodGroup: 'B-', organ: 'Kidney', hospital: 'Shaukat Khanum', city: 'Lahore', doctorVerified: false, hlaScore: 71, organCondition: 'Good', infectionStatus: 'Positive', status: 'Not Available', donorType: 'Deceased' },
  { id: 'D008', name: 'Zainab Qureshi', age: 29, gender: 'Female', bloodGroup: 'A+', organ: 'Lung', hospital: 'NICVD', city: 'Karachi', doctorVerified: true, hlaScore: 89, organCondition: 'Good', infectionStatus: 'Negative', status: 'Available', donorType: 'Deceased' },
  { id: 'D009', name: 'Hamza Tariq', age: 41, gender: 'Male', bloodGroup: 'O+', organ: 'Kidney', hospital: 'CMH Rawalpindi', city: 'Rawalpindi', doctorVerified: true, hlaScore: 84, organCondition: 'Good', infectionStatus: 'Negative', status: 'Under Review', donorType: 'Living' },
  { id: 'D010', name: 'Nadia Farooq', age: 33, gender: 'Female', bloodGroup: 'B+', organ: 'Liver', hospital: 'Holy Family Hospital', city: 'Rawalpindi', doctorVerified: true, hlaScore: 91, organCondition: 'Excellent', infectionStatus: 'Negative', status: 'Available', donorType: 'Deceased' },
]

export const recipients: RecipientRecord[] = [
  { id: 'R001', name: 'Irfan Shah', age: 48, gender: 'Male', bloodGroup: 'A+', requiredOrgan: 'Kidney', urgencyLevel: 'Critical', waitingDays: 245, hospital: 'City Hospital Karachi', city: 'Karachi', hlaScore: 78, status: 'Active' },
  { id: 'R002', name: 'Amna Bashir', age: 35, gender: 'Female', bloodGroup: 'O+', requiredOrgan: 'Liver', urgencyLevel: 'High', waitingDays: 180, hospital: 'Aga Khan Hospital', city: 'Karachi', hlaScore: 85, status: 'Active' },
  { id: 'R003', name: 'Tariq Mehmood', age: 60, gender: 'Male', bloodGroup: 'B+', requiredOrgan: 'Heart', urgencyLevel: 'Critical', waitingDays: 320, hospital: 'Jinnah Hospital', city: 'Lahore', hlaScore: 72, status: 'Active' },
  { id: 'R004', name: 'Rukhsana Begum', age: 42, gender: 'Female', bloodGroup: 'AB+', requiredOrgan: 'Cornea', urgencyLevel: 'Moderate', waitingDays: 90, hospital: 'Services Hospital', city: 'Lahore', hlaScore: 80, status: 'Active' },
  { id: 'R005', name: 'Naveed Iqbal', age: 55, gender: 'Male', bloodGroup: 'A-', requiredOrgan: 'Kidney', urgencyLevel: 'High', waitingDays: 210, hospital: 'Liaquat Hospital', city: 'Hyderabad', hlaScore: 76, status: 'Active' },
  { id: 'R006', name: 'Hina Baig', age: 38, gender: 'Female', bloodGroup: 'O-', requiredOrgan: 'Liver', urgencyLevel: 'Critical', waitingDays: 390, hospital: 'PKLI', city: 'Lahore', hlaScore: 91, status: 'Matched' },
  { id: 'R007', name: 'Asim Rauf', age: 29, gender: 'Male', bloodGroup: 'A+', requiredOrgan: 'Kidney', urgencyLevel: 'Moderate', waitingDays: 65, hospital: 'Shaukat Khanum', city: 'Lahore', hlaScore: 83, status: 'Active' },
  { id: 'R008', name: 'Sobia Rana', age: 44, gender: 'Female', bloodGroup: 'B+', requiredOrgan: 'Lung', urgencyLevel: 'High', waitingDays: 150, hospital: 'NICVD', city: 'Karachi', hlaScore: 87, status: 'Active' },
  { id: 'R009', name: 'Omer Farouk', age: 51, gender: 'Male', bloodGroup: 'O+', requiredOrgan: 'Kidney', urgencyLevel: 'Critical', waitingDays: 280, hospital: 'CMH Rawalpindi', city: 'Rawalpindi', hlaScore: 79, status: 'Active' },
  { id: 'R010', name: 'Mehwish Akhtar', age: 31, gender: 'Female', bloodGroup: 'B+', requiredOrgan: 'Liver', urgencyLevel: 'Low', waitingDays: 45, hospital: 'Holy Family Hospital', city: 'Rawalpindi', hlaScore: 88, status: 'Active' },
]

export const predictionHistory = [
  { id: 'PH001', doctor: 'Dr. Kamran Malik', recipientId: 'R006', donorId: 'D006', organ: 'Liver', date: '2024-01-15', compatibilityScore: 96, priorityScore: 98, status: 'Approved', prediction: 'Suitable' },
  { id: 'PH002', doctor: 'Dr. Amina Shah', recipientId: 'R001', donorId: 'D001', organ: 'Kidney', date: '2024-01-14', compatibilityScore: 92, priorityScore: 95, status: 'Pending', prediction: 'Suitable' },
  { id: 'PH003', doctor: 'Dr. Kamran Malik', recipientId: 'R002', donorId: 'D002', organ: 'Liver', date: '2024-01-13', compatibilityScore: 88, priorityScore: 87, status: 'Under Review', prediction: 'Suitable' },
  { id: 'PH004', doctor: 'Dr. Farrukh Baig', recipientId: 'R003', donorId: 'D003', organ: 'Heart', date: '2024-01-12', compatibilityScore: 62, priorityScore: 58, status: 'Rejected', prediction: 'Not Suitable' },
  { id: 'PH005', doctor: 'Dr. Amina Shah', recipientId: 'R009', donorId: 'D009', organ: 'Kidney', date: '2024-01-11', compatibilityScore: 84, priorityScore: 86, status: 'Pending', prediction: 'Suitable' },
  { id: 'PH006', doctor: 'Dr. Farrukh Baig', recipientId: 'R005', donorId: 'D005', organ: 'Kidney', date: '2024-01-10', compatibilityScore: 79, priorityScore: 81, status: 'Completed', prediction: 'Suitable' },
  { id: 'PH007', doctor: 'Dr. Kamran Malik', recipientId: 'R008', donorId: 'D008', organ: 'Lung', date: '2024-01-09', compatibilityScore: 55, priorityScore: 52, status: 'Completed', prediction: 'Not Suitable' },
  { id: 'PH008', doctor: 'Dr. Amina Shah', recipientId: 'R004', donorId: 'D004', organ: 'Cornea', date: '2024-01-08', compatibilityScore: 91, priorityScore: 90, status: 'Approved', prediction: 'Suitable' },
]

export const monthlyRegistrations = [
  { month: 'Aug', donors: 12, recipients: 18 },
  { month: 'Sep', donors: 15, recipients: 22 },
  { month: 'Oct', donors: 10, recipients: 25 },
  { month: 'Nov', donors: 18, recipients: 20 },
  { month: 'Dec', donors: 14, recipients: 28 },
  { month: 'Jan', donors: 20, recipients: 24 },
]

export const bloodGroupData = [
  { name: 'O+', value: 35, color: '#0F766E' },
  { name: 'A+', value: 28, color: '#14B8A6' },
  { name: 'B+', value: 18, color: '#2DD4BF' },
  { name: 'AB+', value: 8, color: '#5eead4' },
  { name: 'A-', value: 5, color: '#99f6e4' },
  { name: 'O-', value: 4, color: '#ccfbf1' },
  { name: 'B-', value: 2, color: '#f0fdf4' },
]

export const organAvailabilityData = [
  { organ: 'Kidney', available: 4, needed: 7 },
  { organ: 'Liver', available: 2, needed: 5 },
  { organ: 'Heart', available: 1, needed: 3 },
  { organ: 'Lung', available: 2, needed: 4 },
  { organ: 'Cornea', available: 3, needed: 2 },
]

export const predictionsByOrgan = [
  { organ: 'Kidney', predictions: 24, suitable: 18 },
  { organ: 'Liver', predictions: 18, suitable: 14 },
  { organ: 'Heart', predictions: 8, suitable: 5 },
  { organ: 'Lung', predictions: 11, suitable: 7 },
]

export const monthlyPredictions = [
  { month: 'Aug', predictions: 28, suitable: 21 },
  { month: 'Sep', predictions: 34, suitable: 27 },
  { month: 'Oct', predictions: 29, suitable: 22 },
  { month: 'Nov', predictions: 41, suitable: 33 },
  { month: 'Dec', predictions: 38, suitable: 31 },
  { month: 'Jan', predictions: 47, suitable: 39 },
]

export const dashboardStats = [
  { label: "Today's Patients", value: '18', trend: '+12%', helper: 'vs yesterday', icon: 'users' as const, tone: 'mint' as const },
  { label: 'AI Predictions Today', value: '42', trend: '+8%', helper: '94.6% accuracy', icon: 'bot' as const, tone: 'mint' as const },
  { label: 'Suitable Matches', value: '11', trend: '+5%', helper: 'ready for review', icon: 'circle-check' as const, tone: 'mint' as const },
  { label: 'Emergency Cases', value: '3', trend: '-2%', helper: 'critical urgency', icon: 'alert' as const, tone: 'danger' as const },
]

export const dashboardCases: RecipientCase[] = [
  { id: 'PT-10241', name: 'Hamza Iqbal', requiredOrgan: 'Kidney', bloodGroup: 'O+', urgency: 'Critical', status: 'Awaiting match' },
  { id: 'PT-10238', name: 'Sana Malik', requiredOrgan: 'Liver', bloodGroup: 'A-', urgency: 'High', status: 'Screening' },
  { id: 'PT-10235', name: 'Daniel Okoye', requiredOrgan: 'Heart', bloodGroup: 'B+', urgency: 'Critical', status: 'Awaiting match' },
  { id: 'PT-10230', name: 'Priya Nair', requiredOrgan: 'Cornea', bloodGroup: 'AB+', urgency: 'Moderate', status: 'Review due' },
  { id: 'PT-10226', name: 'Marco Bellini', requiredOrgan: 'Lung', bloodGroup: 'O-', urgency: 'Low', status: 'Monitoring' },
]

export const donorRecommendations: DonorRecommendation[] = [
  { id: 'DN-210', name: 'Nadia Khan', age: 34, bloodGroup: 'O+', organ: 'Kidney', hospital: 'St. Mary Institute', city: 'Karachi', compatibility: 96, aiConfidence: 93, hlaScore: 92, organCondition: 'Excellent', infectionStatus: 'Negative', verification: 'Doctor Verified', status: 'Suitable Match' },
  { id: 'DN-184', name: 'David Mensah', age: 41, bloodGroup: 'B+', organ: 'Heart', hospital: 'Northline Medical', city: 'Lahore', compatibility: 91, aiConfidence: 88, hlaScore: 89, organCondition: 'Good', infectionStatus: 'Negative', verification: 'Doctor Verified', status: 'Suitable Match' },
  { id: 'DN-172', name: 'Sara Ahmed', age: 29, bloodGroup: 'A-', organ: 'Liver', hospital: 'Grand Health Centre', city: 'Islamabad', compatibility: 84, aiConfidence: 80, hlaScore: 83, organCondition: 'Good', infectionStatus: 'Negative', verification: 'Verification Pending', status: 'Pending Review' },
]

export const scheduleItems: ScheduleItem[] = [
  { time: '09:00', title: 'Pre-transplant review — PT-10241', location: 'OPD 3' },
  { time: '11:30', title: 'HLA panel discussion', location: 'Conference Room B' },
  { time: '14:00', title: 'Donor evaluation — DN-55184', location: 'ICU Wing' },
  { time: '16:45', title: 'Post-op rounds', location: 'Ward 7' },
]

export const notifications: NotificationItem[] = [
  { id: 'n1', message: 'New suitable match found for PT-10241', timestamp: '12 min ago', tone: 'success' },
  { id: 'n2', message: 'Emergency case registered — PT-10252', timestamp: '48 min ago', tone: 'danger' },
  { id: 'n3', message: 'Report RP-4409 approved by admin', timestamp: '2 h ago', tone: 'info' },
  { id: 'n4', message: 'HLA lab results pending for PT-10238', timestamp: '5 h ago', tone: 'warning' },
]

export const upcomingSurgeries: UpcomingSurgery[] = [
  { patient: 'Hamza Iqbal', organ: 'Kidney', dateLabel: 'Aug 08, 08:00', operatingTheatre: 'OT-2' },
  { patient: 'Daniel Okoye', organ: 'Heart', dateLabel: 'Aug 11, 06:30', operatingTheatre: 'OT-1' },
  { patient: 'Marco Bellini', organ: 'Lung', dateLabel: 'Aug 14, 09:15', operatingTheatre: 'OT-4' },
]

export const quickActions = [
  { label: 'New Prediction', description: 'Run a compatibility check', page: 'ai-match-prediction' as const, icon: 'zap' },
  { label: 'Find Donor', description: 'Search compatible donors', page: 'find-matching-donor' as const, icon: 'search' },
  { label: 'Generate Report', description: 'Review clinical exports', page: 'clinical-reports' as const, icon: 'file' },
  { label: 'Schedule Surgery', description: 'Open theatre calendar', page: 'dashboard' as const, icon: 'calendar' },
]

export const predictionRecords: PredictionRecord[] = [
  { id: 'PR-4409', recipient: 'Hamza Iqbal', recipientId: 'PT-10241', donor: 'Nadia Khan', donorId: 'DN-210', organ: 'Kidney', compatibility: 96, aiConfidence: 93, date: '2026-08-06', status: 'Report Generated' },
  { id: 'PR-4408', recipient: 'Sana Malik', recipientId: 'PT-10238', donor: 'Sara Ahmed', donorId: 'DN-172', organ: 'Liver', compatibility: 84, aiConfidence: 80, date: '2026-08-06', status: 'Pending Review' },
  { id: 'PR-4407', recipient: 'Daniel Okoye', recipientId: 'PT-10235', donor: 'David Mensah', donorId: 'DN-184', organ: 'Heart', compatibility: 91, aiConfidence: 88, date: '2026-08-05', status: 'Completed' },
  { id: 'PR-4406', recipient: 'Priya Nair', recipientId: 'PT-10230', donor: 'Fatima Malik', donorId: 'D004', organ: 'Cornea', compatibility: 89, aiConfidence: 86, date: '2026-08-04', status: 'Completed' },
  { id: 'PR-4405', recipient: 'Marco Bellini', recipientId: 'PT-10226', donor: 'Zainab Qureshi', donorId: 'D008', organ: 'Lung', compatibility: 78, aiConfidence: 81, date: '2026-08-03', status: 'Pending Review' },
  { id: 'PR-4404', recipient: 'Hina Baig', recipientId: 'R006', donor: 'Ayesha Siddiqui', donorId: 'D006', organ: 'Liver', compatibility: 96, aiConfidence: 95, date: '2026-08-02', status: 'Report Generated' },
  { id: 'PR-4403', recipient: 'Naveed Iqbal', recipientId: 'R005', donor: 'Usman Ahmed', donorId: 'D005', organ: 'Kidney', compatibility: 79, aiConfidence: 77, date: '2026-08-01', status: 'Completed' },
  { id: 'PR-4402', recipient: 'Omer Farouk', recipientId: 'R009', donor: 'Hamza Tariq', donorId: 'D009', organ: 'Kidney', compatibility: 88, aiConfidence: 84, date: '2026-07-31', status: 'Completed' },
  { id: 'PR-4401', recipient: 'Rukhsana Begum', recipientId: 'R004', donor: 'Fatima Malik', donorId: 'D004', organ: 'Cornea', compatibility: 91, aiConfidence: 90, date: '2026-07-30', status: 'Report Generated' },
  { id: 'PR-4400', recipient: 'Amna Bashir', recipientId: 'R002', donor: 'Sara Khan', donorId: 'D002', organ: 'Liver', compatibility: 88, aiConfidence: 87, date: '2026-07-29', status: 'Completed' },
]

export const clinicalReports: ClinicalReport[] = [
  { id: 'RP-4409', recipient: 'Hamza Iqbal', donor: 'Nadia Khan', organ: 'Kidney', generatedDate: 'Aug 06, 2026', status: 'Report Generated' },
  { id: 'RP-4408', recipient: 'Sana Malik', donor: 'Sara Ahmed', organ: 'Liver', generatedDate: 'Aug 06, 2026', status: 'Pending Review' },
  { id: 'RP-4407', recipient: 'Daniel Okoye', donor: 'David Mensah', organ: 'Heart', generatedDate: 'Aug 05, 2026', status: 'Completed' },
  { id: 'RP-4406', recipient: 'Priya Nair', donor: 'Fatima Malik', organ: 'Cornea', generatedDate: 'Aug 04, 2026', status: 'Completed' },
]

export const compatibilityTrend = [
  { month: 'Mar', compatibility: 82, successRate: 72 },
  { month: 'Apr', compatibility: 84, successRate: 76 },
  { month: 'May', compatibility: 86, successRate: 79 },
  { month: 'Jun', compatibility: 87, successRate: 82 },
  { month: 'Jul', compatibility: 89, successRate: 85 },
  { month: 'Aug', compatibility: 92, successRate: 88 },
]

export const organDistribution = [
  { name: 'Kidney', value: 42, color: '#0F766E' },
  { name: 'Liver', value: 24, color: '#14B8A6' },
  { name: 'Heart', value: 14, color: '#5CCDBD' },
  { name: 'Cornea', value: 11, color: '#8ADFD4' },
  { name: 'Lung', value: 9, color: '#BDEFE8' },
]

export const matchSuccessRate = [
  { organ: 'Kidney', successful: 88, pending: 12 },
  { organ: 'Liver', successful: 82, pending: 18 },
  { organ: 'Heart', successful: 74, pending: 26 },
  { organ: 'Cornea', successful: 91, pending: 9 },
  { organ: 'Lung', successful: 79, pending: 21 },
]

export const matchingQueue = [
  { id: 'MQ001', recipientId: 'R001', recipientName: 'Irfan Shah', requiredOrgan: 'Kidney', urgency: 'Critical', waitingDays: 245, topDonorId: 'D001', topDonorName: 'Ahmad Raza', compatibilityScore: 92, aiPriorityScore: 95, status: 'Pending' },
  { id: 'MQ002', recipientId: 'R002', recipientName: 'Amna Bashir', requiredOrgan: 'Liver', urgency: 'High', waitingDays: 180, topDonorId: 'D002', topDonorName: 'Sara Khan', compatibilityScore: 88, aiPriorityScore: 86, status: 'Under Review' },
  { id: 'MQ003', recipientId: 'R003', recipientName: 'Tariq Mehmood', requiredOrgan: 'Heart', urgency: 'Critical', waitingDays: 320, topDonorId: 'D003', topDonorName: 'Muhammad Ali', compatibilityScore: 76, aiPriorityScore: 81, status: 'Pending' },
]

export const recommendedMatches = [
  { rank: 1, recipientId: 'R001', recipientName: 'Irfan Shah', donorId: 'D001', donorName: 'Ahmad Raza', urgency: 'Critical', compatibilityScore: 92, aiPriorityScore: 95, waitingDays: 245, bloodCompatibility: 'Exact Match', hlaMatch: '5/6', organCompatibility: 'Compatible', recipientBlood: 'A+', donorBlood: 'A+', sameHospital: true, sameCity: true, doctorVerified: true, organCondition: 'Good', infectionStatus: 'Negative', ageDiff: 14, status: 'Approved' },
  { rank: 2, recipientId: 'R002', recipientName: 'Amna Bashir', donorId: 'D002', donorName: 'Sara Khan', urgency: 'High', compatibilityScore: 88, aiPriorityScore: 86, waitingDays: 180, bloodCompatibility: 'Compatible', hlaMatch: '4/6', organCompatibility: 'Compatible', recipientBlood: 'O+', donorBlood: 'O+', sameHospital: true, sameCity: true, doctorVerified: true, organCondition: 'Excellent', infectionStatus: 'Negative', ageDiff: 7, status: 'Under Review' },
]
