-- Doctor Profiles Table Migration
-- This table stores doctor information for the Tabibn application
-- Run this in your Supabase SQL Editor after the initial schema migration

-- ============================================
-- 1. CREATE DOCTOR PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    photo_url TEXT,
    full_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    license_number TEXT,
    clinic_name TEXT,
    clinic_address TEXT,
    clinic_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEX FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON doctor_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON doctor_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON doctor_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON doctor_profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile"
    ON doctor_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON doctor_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON doctor_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
    ON doctor_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 5. CREATE TRIGGER FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

DROP TRIGGER IF EXISTS update_doctor_profiles_updated_at ON doctor_profiles;
CREATE TRIGGER update_doctor_profiles_updated_at
    BEFORE UPDATE ON doctor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- The doctor_profiles table is now ready!
-- Doctors can now complete their profile setup after signup.
