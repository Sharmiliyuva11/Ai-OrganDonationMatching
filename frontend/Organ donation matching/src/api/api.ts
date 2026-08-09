import axios from 'axios'

export const api = axios.create({
  // Use relative base URL so requests go through Vite dev proxy during development
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

export default api
