import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Make sure to set these in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Please check your .env.local file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (will be auto-generated from Supabase later)
export interface Patient {
    id: string
    user_id?: string
    name: string
    id_number?: string
    age?: number
    sex?: string
    phone?: string
    address?: string
    weight?: number
    height?: number
    bmi?: number
    note?: string
    created_at?: string
    updated_at?: string
}

export interface Prescription {
    id: string
    user_id?: string
    patient_id?: string
    patient_name: string
    patient_id_number?: string
    date: string
    diagnosis?: string
    additional_notes?: string
    status: 'Draft' | 'Printed' | 'Sent'
    created_at?: string
    updated_at?: string
    medications?: Medication[]
    vitals?: Vitals
    allergies?: Allergy[]
}

export interface Medication {
    id: string
    prescription_id: string
    name: string
    strength?: string
    frequency?: string
    duration?: string
    quantity?: string
    instructions?: string
    order_index?: number
    created_at?: string
}

export interface Vitals {
    id: string
    prescription_id: string
    blood_pressure?: string
    heart_rate?: string
    temperature?: string
    spo2?: string
    created_at?: string
}

export interface Allergy {
    id: string
    prescription_id: string
    allergy: string
    created_at?: string
}

export interface DoctorProfile {
    id: string
    user_id: string
    photo_url?: string
    full_name: string
    specialty: string
    license_number?: string
    clinic_name?: string
    clinic_address?: string
    clinic_phone?: string
    created_at?: string
    updated_at?: string
}

