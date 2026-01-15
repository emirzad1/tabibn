-- Add access_code column to prescriptions table
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS access_code TEXT UNIQUE;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_prescriptions_access_code ON prescriptions(access_code);

-- Function to get prescription by access code (Public access with code)
-- This function is SECURITY DEFINER to bypass RLS, allowing anyone with the code to read it.
CREATE OR REPLACE FUNCTION get_prescription_by_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'prescription', p,
        'medications', (
            SELECT coalesce(json_agg(m ORDER BY m.order_index), '[]'::json) 
            FROM medications m 
            WHERE m.prescription_id = p.id
        ),
        'doctor', (
            SELECT row_to_json(dp) 
            FROM doctor_profiles dp 
            WHERE dp.user_id = p.user_id
        ),
        'patient', (
            SELECT row_to_json(pat) 
            FROM patients pat 
            WHERE pat.id = p.patient_id
        ),
        'vitals', (
            SELECT row_to_json(v) 
            FROM vitals v 
            WHERE v.prescription_id = p.id
        ),
        'allergies', (
            SELECT json_agg(a.allergy) 
            FROM allergies a 
            WHERE a.prescription_id = p.id
        )
    ) INTO result
    FROM prescriptions p
    WHERE p.access_code = p_code;

    RETURN result;
END;
$$;
