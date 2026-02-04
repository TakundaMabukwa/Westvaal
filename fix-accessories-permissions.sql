-- ========================================
-- Fix Accessories Table Permissions
-- Run this in your Supabase SQL Editor
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON westvaal.accessories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON westvaal.accessories;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON westvaal.accessories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON westvaal.accessories;

-- Create correct RLS policies
CREATE POLICY "Enable read access for authenticated users" ON westvaal.accessories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON westvaal.accessories
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON westvaal.accessories
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON westvaal.accessories
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA westvaal TO authenticated;
GRANT ALL ON westvaal.accessories TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE westvaal.accessories_id_seq TO authenticated;
