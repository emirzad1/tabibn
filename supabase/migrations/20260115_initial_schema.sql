-- Tabibn Database Schema
-- Run this in your Supabase SQL Editor
-- https://app.supabase.com/project/_/sql

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    id_number TEXT,
    age INTEGER,
    sex TEXT,
    phone TEXT,
    address TEXT,
    weight DECIMAL,
    height DECIMAL,
    bmi DECIMAL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    patient_id_number TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    additional_notes TEXT,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Printed', 'Sent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    strength TEXT,
    frequency TEXT,
    duration TEXT,
    quantity TEXT,
    instructions TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vitals table
CREATE TABLE IF NOT EXISTS vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE NOT NULL,
    blood_pressure TEXT,
    heart_rate TEXT,
    temperature TEXT,
    spo2 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allergies table
CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE NOT NULL,
    allergy TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(date DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

CREATE INDEX IF NOT EXISTS idx_medications_prescription_id ON medications(prescription_id);
CREATE INDEX IF NOT EXISTS idx_vitals_prescription_id ON vitals(prescription_id);
CREATE INDEX IF NOT EXISTS idx_allergies_prescription_id ON allergies(prescription_id);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES - PATIENTS
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert their own patients" ON patients;
DROP POLICY IF EXISTS "Users can update their own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete their own patients" ON patients;

-- Create new policies
CREATE POLICY "Users can view their own patients"
    ON patients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patients"
    ON patients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients"
    ON patients FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients"
    ON patients FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 5. CREATE RLS POLICIES - PRESCRIPTIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can insert their own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can update their own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can delete their own prescriptions" ON prescriptions;

CREATE POLICY "Users can view their own prescriptions"
    ON prescriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescriptions"
    ON prescriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions"
    ON prescriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions"
    ON prescriptions FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 6. CREATE RLS POLICIES - MEDICATIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view medications for their prescriptions" ON medications;
DROP POLICY IF EXISTS "Users can insert medications for their prescriptions" ON medications;
DROP POLICY IF EXISTS "Users can update medications for their prescriptions" ON medications;
DROP POLICY IF EXISTS "Users can delete medications for their prescriptions" ON medications;

CREATE POLICY "Users can view medications for their prescriptions"
    ON medications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = medications.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert medications for their prescriptions"
    ON medications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = medications.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update medications for their prescriptions"
    ON medications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = medications.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete medications for their prescriptions"
    ON medications FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = medications.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

-- ============================================
-- 7. CREATE RLS POLICIES - VITALS
-- ============================================

DROP POLICY IF EXISTS "Users can view vitals for their prescriptions" ON vitals;
DROP POLICY IF EXISTS "Users can insert vitals for their prescriptions" ON vitals;
DROP POLICY IF EXISTS "Users can update vitals for their prescriptions" ON vitals;
DROP POLICY IF EXISTS "Users can delete vitals for their prescriptions" ON vitals;

CREATE POLICY "Users can view vitals for their prescriptions"
    ON vitals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = vitals.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert vitals for their prescriptions"
    ON vitals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = vitals.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update vitals for their prescriptions"
    ON vitals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = vitals.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete vitals for their prescriptions"
    ON vitals FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = vitals.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

-- ============================================
-- 8. CREATE RLS POLICIES - ALLERGIES
-- ============================================

DROP POLICY IF EXISTS "Users can view allergies for their prescriptions" ON allergies;
DROP POLICY IF EXISTS "Users can insert allergies for their prescriptions" ON allergies;
DROP POLICY IF EXISTS "Users can update allergies for their prescriptions" ON allergies;
DROP POLICY IF EXISTS "Users can delete allergies for their prescriptions" ON allergies;

CREATE POLICY "Users can view allergies for their prescriptions"
    ON allergies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = allergies.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert allergies for their prescriptions"
    ON allergies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = allergies.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update allergies for their prescriptions"
    ON allergies FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = allergies.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete allergies for their prescriptions"
    ON allergies FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions
            WHERE prescriptions.id = allergies.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

-- ============================================
-- 9. CREATE FUNCTIONS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Your database is now ready!
-- Next steps:
-- 1. Copy your Project URL and anon key from Supabase dashboard
-- 2. Add them to your .env.local file
-- 3. Restart your Next.js development server
