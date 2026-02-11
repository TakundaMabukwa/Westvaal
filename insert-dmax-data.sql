-- ========================================
-- Insert Isuzu D-MAX Diesel (CamScanner CSV)
-- Generated 2026-02-10
-- ========================================

-- Basic Vehicle Information
INSERT INTO westvaal.basic_vehicle_information (mm_code, make, model, type) VALUES
('28016006', 'ISUZU', 'D-MAX 1.9 Ddi S/Cab HR', 'Pickup Single CAB'),
('28016010', 'ISUZU', 'D-MAX 1.9 Ddi S/Cab HR L', 'Pickup Single CAB'),
('28016014', 'ISUZU', 'D-MAX 1.9 Ddi S/Cab HR L A/T', 'Pickup Single CAB'),
('28016018', 'ISUZU', 'D-MAX 1.9 Ddi S/Cab 4x4 L', 'Pickup Single CAB'),
('28016022', 'ISUZU', 'D-MAX 1.9 Ddi S/Cab 4x4 L A/T RHD', 'Pickup Single CAB'),
('28016610', 'ISUZU', 'D-MAX 3.0 Ddi S/Cab HR LS AT', 'Pickup Single CAB'),
('28016620', 'ISUZU', 'D-MAX 3.0 Ddi S/Cab 4x4 L AT', 'Pickup Single CAB'),
('28016034', 'ISUZU', 'D-MAX 1.9 Ddi E/Cab HR', 'Pickup Extended CAB'),
('28016038', 'ISUZU', 'D-MAX 1.9 Ddi E/Cab HR L', 'Pickup Extended CAB'),
('28016046', 'ISUZU', 'D-MAX 1.9 Ddi E/Cab HR LS', 'Pickup Extended CAB'),
('28016050', 'ISUZU', 'D-MAX 1.9 Ddi E/Cab HR LS A/T', 'Pickup Extended CAB'),
('28016680', 'ISUZU', 'D-MAX 3.0 Ddi E/Cab HR LSE A/T', 'Pickup Extended CAB'),
('28016684', 'ISUZU', 'D-MAX 3.0 Ddi E/Cab 4x4 LSE A/T', 'Pickup Extended CAB'),
('28016072', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab HR L', 'Pickup Double CAB'),
('28016078', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab HR L A/T', 'Pickup Double CAB'),
('28016092', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab HR LS', 'Pickup Double CAB'),
('28016096', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab HR LS A/T', 'Pickup Double CAB'),
('28016080', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab 4x4 L', 'Pickup Double CAB'),
('28016100', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab 4x4 LS A/T RHD', 'Pickup Double CAB'),
('28016110', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab HR X-RIDER', 'Pickup Double CAB'),
('28016120', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab HR X-RIDER AT', 'Pickup Double CAB'),
('28016130', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab 4x4 X-RIDER AT RHD', 'Pickup Double CAB'),
('28016116', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab HR X-RIDER Black', 'Pickup Double CAB'),
('28016120', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab HR X-RIDER Black AT', 'Pickup Double CAB'),
('28018130', 'ISUZU', 'D-MAX 1.9 Ddi D/Cab 4x4 X-RIDER Black AT RHD', 'Pickup Double CAB'),
('28016706', 'ISUZU', 'D-MAX 3.0 Ddi D/Cab 4x4 LS', 'Pickup Double CAB'),
('28016710', 'ISUZU', 'D-MAX 3.0 Ddi D/Cab 4x4 LS A/T', 'Pickup Double CAB'),
('28016720', 'ISUZU', 'D-MAX 3.0 Ddi D/Cab HR LSE A/T', 'Pickup Double CAB'),
('28016728', 'ISUZU', 'D-MAX 3.0 Ddi D/Cab 4x4 LSE A/T', 'Pickup Double CAB'),
('28016750', 'ISUZU', 'D-MAX 3.0 Ddi V-Cross HR A/T', 'Pickup'),
('28016755', 'ISUZU', 'D-MAX 3.0 Ddi V-Cross 4x4 A/T', 'Pickup'),
('28016780', 'ISUZU', 'D-MAX 3.0 Ddi Arctic 4x4 A/T', 'Pickup')
ON CONFLICT (mm_code) DO NOTHING;

-- Specifications default row + retail pricing (Suggested Retail Included)
INSERT INTO westvaal.specifications (
  mm_code, cubic_capacity, kilowatt, newton_meter, co2_emissions,
  fuel_type_id, fuel_consumption, period, kms_per_month, total_kms,
  retail, fuel_type
)
SELECT mm_code, 2000, 100, 350, 150, 1, 7.5, 60, 1500, 90000, 0, 'Diesel'
FROM westvaal.basic_vehicle_information
WHERE mm_code IN (
  '28016006','28016010','28016014','28016018','28016022','28016610','28016620',
  '28016034','28016038','28016046','28016050','28016680','28016684',
  '28016072','28016078','28016092','28016096','28016080','28016100',
  '28016110','28016120','28016130','28016116','28016120','28018130',
  '28016706','28016710','28016720','28016728','28016750','28016755','28016780'
)
ON CONFLICT (mm_code) DO NOTHING;

UPDATE westvaal.specifications SET retail = 457000.00 WHERE mm_code = '28016006';
UPDATE westvaal.specifications SET retail = 476500.00 WHERE mm_code = '28016010';
UPDATE westvaal.specifications SET retail = 494800.00 WHERE mm_code = '28016014';
UPDATE westvaal.specifications SET retail = 585200.00 WHERE mm_code = '28016018';
UPDATE westvaal.specifications SET retail = 603600.00 WHERE mm_code = '28016022';
UPDATE westvaal.specifications SET retail = 590800.00 WHERE mm_code = '28016610';
UPDATE westvaal.specifications SET retail = 678900.00 WHERE mm_code = '28016620';
UPDATE westvaal.specifications SET retail = 504700.00 WHERE mm_code = '28016034';
UPDATE westvaal.specifications SET retail = 525800.00 WHERE mm_code = '28016038';
UPDATE westvaal.specifications SET retail = 551800.00 WHERE mm_code = '28016046';
UPDATE westvaal.specifications SET retail = 575700.00 WHERE mm_code = '28016050';
UPDATE westvaal.specifications SET retail = 690400.00 WHERE mm_code = '28016680';
UPDATE westvaal.specifications SET retail = 774100.00 WHERE mm_code = '28016684';
UPDATE westvaal.specifications SET retail = 567200.00 WHERE mm_code = '28016072';
UPDATE westvaal.specifications SET retail = 585100.00 WHERE mm_code = '28016078';
UPDATE westvaal.specifications SET retail = 601500.00 WHERE mm_code = '28016092';
UPDATE westvaal.specifications SET retail = 622700.00 WHERE mm_code = '28016096';
UPDATE westvaal.specifications SET retail = 670800.00 WHERE mm_code = '28016080';
UPDATE westvaal.specifications SET retail = 705700.00 WHERE mm_code = '28016100';
UPDATE westvaal.specifications SET retail = 659100.00 WHERE mm_code = '28016110';
UPDATE westvaal.specifications SET retail = 680600.00 WHERE mm_code = '28016120';
UPDATE westvaal.specifications SET retail = 765400.00 WHERE mm_code = '28016130';
UPDATE westvaal.specifications SET retail = 664100.00 WHERE mm_code = '28016116';
UPDATE westvaal.specifications SET retail = 685600.00 WHERE mm_code = '28016120';
UPDATE westvaal.specifications SET retail = 770400.00 WHERE mm_code = '28018130';
UPDATE westvaal.specifications SET retail = 779500.00 WHERE mm_code = '28016706';
UPDATE westvaal.specifications SET retail = 797400.00 WHERE mm_code = '28016710';
UPDATE westvaal.specifications SET retail = 838300.00 WHERE mm_code = '28016720';
UPDATE westvaal.specifications SET retail = 887000.00 WHERE mm_code = '28016728';
UPDATE westvaal.specifications SET retail = 885100.00 WHERE mm_code = '28016750';
UPDATE westvaal.specifications SET retail = 934900.00 WHERE mm_code = '28016755';
UPDATE westvaal.specifications SET retail = 1194000.00 WHERE mm_code = '28016780';

-- Accessories (Options) — prices left for later correction
INSERT INTO westvaal.accessories (mm_code, name, description, cost, retail, max_discount, is_active) VALUES
(NULL, 'Rear axle diff lock', 'Code BCL (CSV shows 8CL)', 0, 0, 10, true),
(NULL, '17" x7.0J-33 ALU (Silver) 255/65R17', 'Code I7N', 0, 0, 10, true),
(NULL, 'WHL & TYRE ASM 18"x7.5J-33 ALU (Silver) 265', 'Code I7Q', 0, 0, 10, true),
(NULL, 'WHL & TYRE ASM 18"x7.5J-33 ALU (Silver) Highway tyre', 'Code I7S', 0, 0, 10, true),
(NULL, 'WHL & TYRE ASM 18"x7.5J-33 ALU, Dark Grey, Highway tyre', 'Code I7U', 0, 0, 10, true),
(NULL, 'WHL & TYRE ASM 18"x7.5J-33 ALU GLS BLK HWY', 'Code IFO', 0, 0, 10, true),
(NULL, 'WHL & TYRE ASM 18"x7.5J-33 ALU GLS BLK HWY', 'Code IL5', 0, 0, 10, true),
(NULL, 'Rear sliding window', 'Code THO', 0, 0, 10, true),
(NULL, 'Sports Bar (bright finish)', 'Code KD2', 0, 0, 10, true),
(NULL, 'Sports Bar (black)', 'Code SCU', 0, 0, 10, true),
(NULL, 'Leather trim – Extended Cab', 'Code 6TB', 0, 0, 10, true),
(NULL, 'Leather trim – Double Cab', 'Code 6TB', 0, 0, 10, true),
(NULL, 'Colour coded Front Bumper', 'Code VT4', 0, 0, 10, true),
(NULL, 'Colour coded Rear Bumper', 'Code V43', 0, 0, 10, true),
(NULL, 'Cab protector (black)', 'Code V89', 0, 0, 10, true),
(NULL, 'Telematics', 'Code IG3', 0, 0, 10, true),
(NULL, 'Hi‑Ride SUV package', 'Code IN7', 0, 0, 10, true),
(NULL, 'Towbar 2.1 ton', 'Code PP7', 0, 0, 10, true),
(NULL, 'Towbar 3.5 ton', 'Code WH4', 0, 0, 10, true)
ON CONFLICT (id) DO NOTHING;