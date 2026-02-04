-- Debug query to check your quote_json table structure and data
-- Run this in your Supabase SQL Editor to troubleshoot

-- 1. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'westvaal' 
AND table_name = 'quote_json'
ORDER BY ordinal_position;

-- 2. Check what quotes exist and their IDs
SELECT quote_id, created_at, 
       CASE 
         WHEN json_data IS NOT NULL THEN 'json_data exists'
         ELSE 'json_data is null'
       END as data_status
FROM westvaal.quote_json 
LIMIT 10;

-- 3. Check if there's a quote with ID "1"
SELECT * FROM westvaal.quote_json 
WHERE quote_id = '1' 
OR quote_id = 1;

-- 4. Check the first few quotes to see actual ID format
SELECT quote_id, created_at
FROM westvaal.quote_json 
ORDER BY created_at DESC
LIMIT 5;