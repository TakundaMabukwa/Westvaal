-- ========================================
-- Update Specifications with Retail Prices from M&M Data
-- Run this in your Supabase SQL Editor after insert-mm-data.sql
-- ========================================

-- First, ensure specifications table exists with default values for required fields
INSERT INTO westvaal.specifications (
    mm_code, cubic_capacity, kilowatt, newton_meter, co2_emissions, 
    fuel_type_id, fuel_consumption, period, kms_per_month, total_kms, 
    retail, fuel_type
)
SELECT 
    mm_code,
    2000 as cubic_capacity,  -- Default value
    100 as kilowatt,          -- Default value
    350 as newton_meter,      -- Default value
    150 as co2_emissions,     -- Default value
    1 as fuel_type_id,        -- Default value
    7.5 as fuel_consumption,  -- Default value
    60 as period,             -- Default value
    1500 as kms_per_month,    -- Default value
    90000 as total_kms,       -- Default value
    0 as retail,              -- Will be updated below
    'Diesel' as fuel_type     -- Default value
FROM westvaal.basic_vehicle_information
WHERE mm_code NOT IN (SELECT mm_code FROM westvaal.specifications)
ON CONFLICT (mm_code) DO NOTHING;

-- Update retail prices from M&M data
UPDATE westvaal.specifications SET retail = 111200 WHERE mm_code = '04042150';
UPDATE westvaal.specifications SET retail = 246400 WHERE mm_code = '04035400';
UPDATE westvaal.specifications SET retail = 100600 WHERE mm_code = '05011872';
UPDATE westvaal.specifications SET retail = 102000 WHERE mm_code = '05036102';
UPDATE westvaal.specifications SET retail = 282700 WHERE mm_code = '05037059';
UPDATE westvaal.specifications SET retail = 74000 WHERE mm_code = '05036400';
UPDATE westvaal.specifications SET retail = 435410 WHERE mm_code = '05047502';
UPDATE westvaal.specifications SET retail = 99200 WHERE mm_code = '05060252';
UPDATE westvaal.specifications SET retail = 102500 WHERE mm_code = '10019250';
UPDATE westvaal.specifications SET retail = 69600 WHERE mm_code = '13080220';
UPDATE westvaal.specifications SET retail = 77700 WHERE mm_code = '13603200';
UPDATE westvaal.specifications SET retail = 79600 WHERE mm_code = '18604200';
UPDATE westvaal.specifications SET retail = 233500 WHERE mm_code = '22048381';
UPDATE westvaal.specifications SET retail = 105800 WHERE mm_code = '22045436';
UPDATE westvaal.specifications SET retail = 89200 WHERE mm_code = '22045515';
UPDATE westvaal.specifications SET retail = 117900 WHERE mm_code = '22071941';
UPDATE westvaal.specifications SET retail = 222500 WHERE mm_code = '22084101';
UPDATE westvaal.specifications SET retail = 191700 WHERE mm_code = '22032131';
UPDATE westvaal.specifications SET retail = 416200 WHERE mm_code = '22032938';
UPDATE westvaal.specifications SET retail = 272700 WHERE mm_code = '22032417';
UPDATE westvaal.specifications SET retail = 262800 WHERE mm_code = '22032413';
UPDATE westvaal.specifications SET retail = 191700 WHERE mm_code = '22032139';
UPDATE westvaal.specifications SET retail = 59300 WHERE mm_code = '25074530';
UPDATE westvaal.specifications SET retail = 70400 WHERE mm_code = '25061400';
UPDATE westvaal.specifications SET retail = 139900 WHERE mm_code = '26551600';
UPDATE westvaal.specifications SET retail = 163700 WHERE mm_code = '26516305';
UPDATE westvaal.specifications SET retail = 259200 WHERE mm_code = '26545400';
UPDATE westvaal.specifications SET retail = 145200 WHERE mm_code = '26530380';
UPDATE westvaal.specifications SET retail = 135400 WHERE mm_code = '26530401';
UPDATE westvaal.specifications SET retail = 261900 WHERE mm_code = '26569111';
UPDATE westvaal.specifications SET retail = 136500 WHERE mm_code = '26555880';
UPDATE westvaal.specifications SET retail = 348800 WHERE mm_code = '26568570';
UPDATE westvaal.specifications SET retail = 139900 WHERE mm_code = '26551610';
UPDATE westvaal.specifications SET retail = 85800 WHERE mm_code = '32128571';
UPDATE westvaal.specifications SET retail = 132000 WHERE mm_code = '32132120';
UPDATE westvaal.specifications SET retail = 131200 WHERE mm_code = '32132105';
UPDATE westvaal.specifications SET retail = 296900 WHERE mm_code = '28015473';
UPDATE westvaal.specifications SET retail = 310700 WHERE mm_code = '30031181';
UPDATE westvaal.specifications SET retail = 265000 WHERE mm_code = '30010240';
UPDATE westvaal.specifications SET retail = 422400 WHERE mm_code = '35071180';
UPDATE westvaal.specifications SET retail = 60800 WHERE mm_code = '43046330';
UPDATE westvaal.specifications SET retail = 535700 WHERE mm_code = '44095070';
UPDATE westvaal.specifications SET retail = 214800 WHERE mm_code = '45710104';
UPDATE westvaal.specifications SET retail = 165000 WHERE mm_code = '47031301';
UPDATE westvaal.specifications SET retail = 156000 WHERE mm_code = '47032143';
UPDATE westvaal.specifications SET retail = 77200 WHERE mm_code = '47010090';
UPDATE westvaal.specifications SET retail = 86700 WHERE mm_code = '47010260';
UPDATE westvaal.specifications SET retail = 121500 WHERE mm_code = '47047100';
UPDATE westvaal.specifications SET retail = 73800 WHERE mm_code = '47017662';
UPDATE westvaal.specifications SET retail = 95500 WHERE mm_code = '47017665';
UPDATE westvaal.specifications SET retail = 156000 WHERE mm_code = '47032151';
UPDATE westvaal.specifications SET retail = 156000 WHERE mm_code = '47032160';
UPDATE westvaal.specifications SET retail = 165800 WHERE mm_code = '48043120';
UPDATE westvaal.specifications SET retail = 58200 WHERE mm_code = '48010600';
UPDATE westvaal.specifications SET retail = 128700 WHERE mm_code = '50018060';
UPDATE westvaal.specifications SET retail = 121700 WHERE mm_code = '50033110';
UPDATE westvaal.specifications SET retail = 71400 WHERE mm_code = '50610301';
UPDATE westvaal.specifications SET retail = 90700 WHERE mm_code = '54042675';
UPDATE westvaal.specifications SET retail = 200900 WHERE mm_code = '54042380';
UPDATE westvaal.specifications SET retail = 117500 WHERE mm_code = '54042330';
UPDATE westvaal.specifications SET retail = 166600 WHERE mm_code = '54042355';
UPDATE westvaal.specifications SET retail = 118800 WHERE mm_code = '54058430';
UPDATE westvaal.specifications SET retail = 105000 WHERE mm_code = '54059080';
UPDATE westvaal.specifications SET retail = 105900 WHERE mm_code = '59030201';
UPDATE westvaal.specifications SET retail = 71700 WHERE mm_code = '59830220';
UPDATE westvaal.specifications SET retail = 83200 WHERE mm_code = '59820100';
UPDATE westvaal.specifications SET retail = 164500 WHERE mm_code = '60027721';
UPDATE westvaal.specifications SET retail = 83200 WHERE mm_code = '60007420';
UPDATE westvaal.specifications SET retail = 265900 WHERE mm_code = '60039180';
UPDATE westvaal.specifications SET retail = 147800 WHERE mm_code = '60036164';
UPDATE westvaal.specifications SET retail = 258800 WHERE mm_code = '60036575';
UPDATE westvaal.specifications SET retail = 394100 WHERE mm_code = '60039490';
UPDATE westvaal.specifications SET retail = 147800 WHERE mm_code = '60036222';
UPDATE westvaal.specifications SET retail = 258800 WHERE mm_code = '60036426';
UPDATE westvaal.specifications SET retail = 222700 WHERE mm_code = '64038420';
UPDATE westvaal.specifications SET retail = 88500 WHERE mm_code = '64027700';
UPDATE westvaal.specifications SET retail = 152300 WHERE mm_code = '64027830';
UPDATE westvaal.specifications SET retail = 122400 WHERE mm_code = '64027780';
UPDATE westvaal.specifications SET retail = 74500 WHERE mm_code = '64020500';
UPDATE westvaal.specifications SET retail = 74200 WHERE mm_code = '64020100';
UPDATE westvaal.specifications SET retail = 109900 WHERE mm_code = '64020101';
UPDATE westvaal.specifications SET retail = 115400 WHERE mm_code = '64020511';
UPDATE westvaal.specifications SET retail = 121500 WHERE mm_code = '64020111';
UPDATE westvaal.specifications SET retail = 106200 WHERE mm_code = '64088160';
UPDATE westvaal.specifications SET retail = 174500 WHERE mm_code = '64078081';
UPDATE westvaal.specifications SET retail = 161000 WHERE mm_code = '05052060';
UPDATE westvaal.specifications SET retail = 96300 WHERE mm_code = '64020510';
UPDATE westvaal.specifications SET retail = 188600 WHERE mm_code = '64027870';
UPDATE westvaal.specifications SET retail = 93700 WHERE mm_code = '64027710';
