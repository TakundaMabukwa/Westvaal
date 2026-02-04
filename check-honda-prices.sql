-- Check if Honda vehicles have retail prices
SELECT 
    bvi.mm_code,
    bvi.make,
    bvi.model,
    s.retail
FROM westvaal.basic_vehicle_information bvi
LEFT JOIN westvaal.specifications s ON bvi.mm_code = s.mm_code
WHERE bvi.make = 'HONDA';
