import axios, { type AxiosError } from 'axios'

const AUTH_ERROR_KEY = 'auth_error'
const TOKEN_KEY = 'access_token'
const ROLE_KEY = 'user_role'
const EMAIL_KEY = 'user_email'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function clearAuthStorage() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(ROLE_KEY)
  sessionStorage.removeItem(EMAIL_KEY)
  sessionStorage.removeItem(AUTH_ERROR_KEY)
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem(AUTH_ERROR_KEY)
}

function handleUnauthorized() {
  clearAuthStorage()
  sessionStorage.setItem(AUTH_ERROR_KEY, 'Session expired. Please sign in again.')
  window.location.href = '/'
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const status = error.response?.status
  const detail = error.response?.data?.detail
  if (status === 401) return 'Your session is invalid or has expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status === 422) return typeof detail === 'string' ? detail : 'Please check the required fields and try again.'
  if (!error.response) return 'The backend is unavailable. Start the API and try again.'
  return typeof detail === 'string' ? detail : fallback
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 401) {
        handleUnauthorized()
      }
    }
    return Promise.reject(error)
  }
)

export interface MatchPredictionRequest {
  donor_age: number
  recipient_age: number
  donor_blood_group: string
  recipient_blood_group: string
  organ_available: string
  organ_needed: string
  donor_hla: string
  recipient_hla: string
  donor_city: string
  recipient_city: string
  donor_hospital: string
  recipient_hospital: string
  donor_type: string
  doctor_verified: string
  urgency: string
  waiting_days: number
  organ_condition: string
  infection_status: string
}

export interface MatchPredictionResponse {
  prediction: string
  model_prediction: number
  generated_features: {
    blood_match: number
    blood_compatible: number
    organ_match: number
    hla_match: number
    same_city: number
    same_hospital: number
    donor_type: number
    doctor_verified: number
    urgency_score: number
    waiting_score: number
    organ_condition_score: number
    infection_score: number
    age_difference: number
    age_score: number
  }
}

export async function predictMatch(payload: MatchPredictionRequest): Promise<MatchPredictionResponse> {
  const response = await api.post<MatchPredictionResponse>('/predict', payload)
  return response.data
}

export interface FindMatchingDonorsRequest {
  recipient_id: string
}

export interface MatchingDonor {
  donor_id: string
  donor_type: string
  age: number | string
  gender: string
  blood_group: string
  organ_available: string
  hla_type: string
  infection_status: string
  organ_condition: string
  city: string
  hospital: string
  donation_date: string
  match_score: number
  match_details: Record<string, number>
}

export interface FindMatchingDonorsResponse {
  recipient: Record<string, any>
  matching_donors: MatchingDonor[]
  total_matches: number
}

export async function findMatchingDonors(payload: FindMatchingDonorsRequest): Promise<FindMatchingDonorsResponse> {
  const response = await api.post<FindMatchingDonorsResponse>('/find-matching-donors', payload)
  return response.data
}

export interface FindMatchingRecipientsRequest {
  donor_id: string
}

export interface MatchingRecipient {
  recipient_id: string
  age: number | string
  gender: string
  blood_group: string
  organ_needed: string
  hla_type: string
  diagnosis: string
  urgency: string
  waiting_days: number | string
  hospital: string
  city: string
  doctor_verified: string
  match_score: number
  match_details: Record<string, number>
}

export interface FindMatchingRecipientsResponse {
  donor: {
    donor_id: string
    donor_type: string
    age: number | string
    gender: string
    blood_group: string
    organ_available: string
    hla_type: string
    infection_status: string
    organ_condition: string
    city: string
    hospital: string
    donation_date: string
  }
  matching_recipients: MatchingRecipient[]
  total_matches: number
}

export async function findMatchingRecipients(payload: FindMatchingRecipientsRequest): Promise<FindMatchingRecipientsResponse> {
  const response = await api.post<FindMatchingRecipientsResponse>('/find-matching-recipients', payload)
  return response.data
}

export interface LoginRequest {
  email: string
  password: string
  role: 'admin' | 'doctor'
}

export interface LoginResponse {
  message: string
  email: string
  role: 'admin' | 'doctor'
  access_token: string
}

export interface CreateDoctorRequest {
  email: string
  password: string
  name: string
  hospital: string
  specialization: string
}

export interface CreateDoctorResponse {
  id: number
  email: string
  role: 'doctor'
  created_at: string
  is_active: boolean
  name: string
  hospital: string
  specialization: string
}

export interface AuthenticatedUser {
  id: number
  email: string
  role: 'admin' | 'doctor'
  created_at: string
  is_active: boolean
  name: string | null
  hospital: string | null
  specialization: string | null
}

export interface MetadataOptions {
  hospitals: string[]
  cities: string[]
  blood_groups: string[]
  organs_available: string[]
  organs_needed: string[]
  hla_types: string[]
  donor_types: string[]
  infection_statuses: string[]
  organ_conditions: string[]
  urgencies: string[]
  doctor_verified: string[]
}

export interface DatasetOverview {
  total_donors: number
  total_recipients: number
  total_matches: number
  donors_by_organ: { organ: string; count: number }[]
  recipients_by_organ: { organ: string; count: number }[]
  recipients_by_urgency: { urgency: string; count: number }[]
  prediction_history_available: boolean
}

export interface DatasetDonor {
  donor_id: string; donor_type: string; age: string; gender: string; blood_group: string
  organ_available: string; hla_type: string; infection_status: string; organ_condition: string
  city: string; hospital: string; donation_date: string
}

export interface DatasetRecipient {
  recipient_id: string; age: string; gender: string; blood_group: string; organ_needed: string
  hla_type: string; diagnosis: string; urgency: string; waiting_days: string; hospital: string
  city: string; doctor_verified: string
}

export interface PaginatedDataset<T> { items: T[]; total: number; page: number; page_size: number }

export interface RegisterDonorRequest {
  donor_id?: string
  donor_type: string
  age: number
  gender: string
  blood_group: string
  organ_available: string
  hla_type: string
  infection_status: string
  organ_condition: string
  city: string
  hospital: string
  donation_date?: string
}

export interface RegisterDonorResponse {
  message: string
  donor_id: string
  record: Record<string, any>
}

export interface RegisterRecipientRequest {
  recipient_id?: string
  age: number
  gender: string
  blood_group: string
  organ_needed: string
  hla_type: string
  diagnosis?: string
  urgency: string
  waiting_days: number
  hospital: string
  city: string
}

export interface RegisterRecipientResponse {
  message: string
  recipient_id: string
  record: Record<string, any>
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload)
  return response.data
}

export async function createDoctor(payload: CreateDoctorRequest): Promise<CreateDoctorResponse> {
  const response = await api.post<CreateDoctorResponse>('/admin/doctors', payload)
  return response.data
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  return (await api.get<AuthenticatedUser>('/auth/me')).data
}

export async function getMetadataOptions(): Promise<MetadataOptions> {
  const response = await api.get<MetadataOptions>('/metadata/options')
  return response.data
}

export async function getDatasetOverview(): Promise<DatasetOverview> {
  return (await api.get<DatasetOverview>('/data/overview')).data
}

export async function getDonors(params: { search?: string; organ?: string; page?: number; page_size?: number } = {}): Promise<PaginatedDataset<DatasetDonor>> {
  return (await api.get<PaginatedDataset<DatasetDonor>>('/data/donors', { params })).data
}

export async function getRecipients(params: { search?: string; organ?: string; urgency?: string; page?: number; page_size?: number } = {}): Promise<PaginatedDataset<DatasetRecipient>> {
  return (await api.get<PaginatedDataset<DatasetRecipient>>('/data/recipients', { params })).data
}

export async function registerDonor(payload: RegisterDonorRequest): Promise<RegisterDonorResponse> {
  const response = await api.post<RegisterDonorResponse>('/register/donor', payload)
  return response.data
}

export async function registerRecipient(payload: RegisterRecipientRequest): Promise<RegisterRecipientResponse> {
  const response = await api.post<RegisterRecipientResponse>('/register/recipient', payload)
  return response.data
}

export default api
