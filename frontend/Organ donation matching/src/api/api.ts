import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
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

export default api
