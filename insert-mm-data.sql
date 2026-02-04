-- ========================================
-- Insert M&M Data from mm-data.md
-- Run this in your Supabase SQL Editor after running supabase-mm-setup.sql
-- ========================================

-- Insert Basic Vehicle Information (unique entries only)
INSERT INTO westvaal.basic_vehicle_information (mm_code, make, model, type) VALUES
-- AUDI
('04042150', 'AUDI', 'A4 1.8T', 'Sedan'),
('04035400', 'AUDI', 'Q3 2.0 TDI QUATT STRONIC (130KW)', 'SUV'),
-- BMW
('05011872', 'BMW', '135i', 'Coupe'),
('05036102', 'BMW', '320i', 'Sedan'),
('05037059', 'BMW', '320i A/T (F30)', 'Sedan'),
('05036400', 'BMW', '325i (E90)', 'Sedan'),
('05047502', 'BMW', 'X3 xDRIVE20d M SPORT A/T (F25)', 'SUV'),
('05060252', 'BMW', 'X5 3.0d', 'SUV'),
('05052060', 'BMW', '520D A/T (F10)', 'Sedan'),
-- CHEVROLET
('10019250', 'CHEVROLET', 'CORSA UTILITY 1.7 DTI SPORT', 'Pickup Single CAB'),
-- DAIHATSU
('13080220', 'DAIHATSU', 'TERIOS', 'SUV'),
-- DATSUN
('13603200', 'DATSUN', 'GO 1.2 MID', 'Hatchback'),
-- FAW
('18604200', 'FAW', 'V2 1.3 DLX 5DR', 'Sedan'),
-- FORD
('22048381', 'FORD', 'ECOSPORT 1.5TDCi TITANIUM', 'SUV'),
('22045436', 'FORD', 'FIESTA 1.4 AMBIENTE 5 Dr', 'Hatchback'),
('22045515', 'FORD', 'FIESTA 1.6i TITANIUM 5Dr', 'Hatchback'),
('22071941', 'FORD', 'FOCUS 2.5 ST 3Dr', 'Hatchback'),
('22084101', 'FORD', 'KUGA 1.5 ECOBOOST AMBIENTE', 'SUV'),
('22032131', 'FORD', 'RANGER 2.2TDCi XLS', 'Pickup Single CAB'),
('22032938', 'FORD', 'RANGER 3.2TDCi WILDTRAK A/T', 'Pickup Double CAB'),
('22032417', 'FORD', 'RANGER 3.2TDCi XLT 4X4 A/T', 'Pickup Double CAB'),
('22032413', 'FORD', 'RANGER 3.2TDCi XLT A/T', 'Pickup Double CAB'),
('22032139', 'FORD', 'RANGER 2.2TDCi XLS', 'Pickup Double CAB'),
('22020100', 'FORD', 'FIGO 1.4 AMBIENTE', 'Hatchback'),
-- HONDA
('25074530', 'HONDA', 'CBR 600 RR', 'Motorcycle'),
('25061400', 'HONDA', 'CIVIC 1.8 LXi', 'Sedan'),
-- HYUNDAI
('26551600', 'HYUNDAI', 'ELANTRA 1.8 GLS/EXECUTIVE', 'Sedan'),
('26516305', 'HYUNDAI', 'GRAND i10 1.25 FLUID', 'Hatchback'),
('26545400', 'HYUNDAI', 'H-1 GLS 2.4 CVVT WAGON', 'Van'),
('26530380', 'HYUNDAI', 'H100 2.6D A/C', 'Pickup Single CAB'),
('26530401', 'HYUNDAI', 'H100 2.6D', 'Pickup Single CAB'),
('26569111', 'HYUNDAI', 'iX35 2.0 EXECUTIVE', 'SUV'),
('26555880', 'HYUNDAI', 'SONATA 2.4 GLS EXECUTIVE A/T', 'Sedan'),
('26568570', 'HYUNDAI', 'TUCSON 2.0 ELITE A/T', 'SUV'),
('26551610', 'HYUNDAI', 'ELANTRA 1.8 GLS/EXECUTIVE A/T', 'Sedan'),
('26516461', 'HYUNDAI', 'i20 1.2 MOTION', 'Hatchback'),
('26516540', 'HYUNDAI', 'i20 1.6', 'Hatchback'),
-- ISUZU
('28015473', 'ISUZU', 'KB 300 D-TEQ LX A/T', 'Pickup Double CAB'),
-- JEEP
('30031181', 'JEEP', 'GRAND CHEROKEE 3.6 LIMITED', 'SUV'),
('30010240', 'JEEP', 'RENEGADE 1.6 E-TORQUE SPORT', 'SUV'),
-- KIA
('32128571', 'KIA', 'CERATO 1.6 A/T', 'Sedan'),
('32132120', 'KIA', 'K 2700 WORKHORSE', 'Pickup Crew CAB'),
('32132105', 'KIA', 'K 2700 WORKHORSE', 'Pickup Single CAB'),
-- LAND ROVER
('35071180', 'LAND ROVER', 'EVOQUE 2.0 Si4 DYNAMIC', 'SUV'),
-- LEXUS
('38121380', 'LEXUS', 'IS 350 E', 'Sedan'),
-- MAZDA
('43046330', 'MAZDA', '3 1.6 DYNAMIC', 'Sedan'),
-- MERCEDES-BENZ
('44095070', 'MERCEDES-BENZ', 'VIANO 3.0 CDI TREND A/T', 'Van'),
-- MINI
('45710104', 'MINI', 'COOPER', 'Hatchback'),
-- NISSAN
('47031300', 'NISSAN', 'ALMERA 1.5 ACENTA', 'Sedan'),
('47031301', 'NISSAN', 'ALMERA 1.5 ACENTA', 'Sedan'),
('47032143', 'NISSAN', 'HARDBODY NP300 2.4i HiRider 4x4', 'Pickup Double CAB'),
('47010090', 'NISSAN', 'MICRA 1.2 VISIA+ 5DR (D82)', 'Hatchback'),
('47010260', 'NISSAN', 'MICRA 1.5 TEKNA 5DR (D85)', 'Hatchback'),
('47047100', 'NISSAN', 'NAVARA 2.5 dCi XE K/CAB', 'Pickup Single CAB'),
('47017662', 'NISSAN', 'NP200 1.6 A/C', 'Pickup Single CAB'),
('47017665', 'NISSAN', 'NP200 1.6 A/C SAFETY PACK', 'Pickup Single CAB'),
('47032151', 'NISSAN', 'HARDBODY NP300 2.5 TDi LWB', 'Pickup Single CAB'),
('47032160', 'NISSAN', 'HARDBODY NP300 2.5 TDi LWB SE', 'Pickup Single CAB'),
-- OPEL
('48043120', 'OPEL', 'ASTRA 1.4T ESSENTIA A/T', 'Sedan'),
('48010600', 'OPEL', 'CORSA 1.4 ESSENTIA 5Dr', 'Hatchback'),
-- PEUGEOT
('50018060', 'PEUGEOT', '208 POP ART 1.0 PURETECH 5DR', 'Hatchback'),
('50033110', 'PEUGEOT', '3008 1.6 THP PREMIUM/ACTIVE', 'SUV'),
-- PROTON
('50610301', 'PROTON', 'GEN 2 1.6 GL', 'Sedan'),
-- RENAULT
('54042675', 'RENAULT', 'CLIO III 1.6 S 5Dr', 'Hatchback'),
('54042380', 'RENAULT', 'CLIO IV 1.2T EXPRESSION EDC 5DR (88KW)', 'Hatchback'),
('54042330', 'RENAULT', 'CLIO IV 900 T EXPRESSION 5DR (66KW)', 'Hatchback'),
('54042355', 'RENAULT', 'CLIO IV 900 T GT-LINE 5DR (66KW)', 'Hatchback'),
('54058430', 'RENAULT', 'MEGANE III 1.4T DYNAMIQUE COUPE', 'Coupe'),
('54059080', 'RENAULT', 'SCENIC III 1.6 EXPRESSION', 'Van'),
-- SUZUKI
('59030201', 'SUZUKI', 'SX4 2.0', 'SUV'),
-- TATA
('59830220', 'TATA', 'TELCOLINE 2.0 TDi 4X4', 'Pickup Single CAB'),
('59820100', 'TATA', 'SUPER ACE 1.4 TCIC DLS', 'Pickup Double CAB'),
-- TOYOTA
('60027721', 'TOYOTA', 'COROLLA 2.0 D-4D EXCLUSIVE', 'Sedan'),
('60007420', 'TOYOTA', 'ETIOS 1.5 Xs 5Dr', 'Sedan'),
('60039180', 'TOYOTA', 'HILUX 2.4 GD-6 RB SRX', 'Pickup Single CAB'),
('60036164', 'TOYOTA', 'HILUX 2.5 D-4D S', 'Pickup Single CAB'),
('60036575', 'TOYOTA', 'HILUX 3.0D-4D LEGEND 45 XTRA CAB', 'Pickup Extended CAB'),
('60039490', 'TOYOTA', 'HILUX 2.8 GD-6 RB RAIDER', 'Pickup Double CAB'),
('60036222', 'TOYOTA', 'HILUX 2.5 D-4D SRX 4X4', 'Pickup Single CAB'),
('60036426', 'TOYOTA', 'HILUX 3.0 D-4D R/B', 'Pickup Double CAB'),
-- VOLKSWAGEN
('64038420', 'VOLKSWAGEN', 'CADDY CREWBUS 2.0 TDi', 'Van'),
('64027700', 'VOLKSWAGEN', 'POLO 1.4 TRENDLINE 5DR', 'Hatchback'),
('64027830', 'VOLKSWAGEN', 'POLO 1.6 TDI COMFORTLINE 5DR', 'Hatchback'),
('64027780', 'VOLKSWAGEN', 'POLO 1.6 TRENDLINE 5DR', 'Hatchback'),
('64020500', 'VOLKSWAGEN', 'POLO VIVO 1.4', 'Hatchback'),
('64020100', 'VOLKSWAGEN', 'POLO VIVO 1.4 5Dr', 'Hatchback'),
('64020101', 'VOLKSWAGEN', 'POLO VIVO GP 1.4 CONCEPTLINE 5DR', 'Hatchback'),
('64020511', 'VOLKSWAGEN', 'POLO VIVO GP 1.4 TRENDLINE', 'Hatchback'),
('64020111', 'VOLKSWAGEN', 'POLO VIVO GP 1.4 TRENDLINE 5DR', 'Hatchback'),
('64088160', 'VOLKSWAGEN', 'T5 KOMBI 2.5 TDI', 'Van'),
('64078081', 'VOLKSWAGEN', 'TIGUAN 1.4 TSi B/MO TREN-FUN (90KW)', 'SUV'),
('64020510', 'VOLKSWAGEN', 'POLO VIVO 1.4 TRENDLINE', 'Hatchback'),
('64027870', 'VOLKSWAGEN', 'POLO GTi 1.4TSi DSG', 'Hatchback'),
('64027710', 'VOLKSWAGEN', 'POLO 1.4 COMFORTLINE 5DR', 'Hatchback')
ON CONFLICT (mm_code) DO NOTHING;

-- Note: The data provided doesn't include detailed specifications, finance, warranty, 
-- or additional features information. You'll need to populate those tables separately
-- or extend this script with that data when available.

-- You can create placeholder products referencing these MM codes:
-- Example for creating products (you'll need to add proper pricing and details):
/*
INSERT INTO westvaal.products (mm_code, name, description, cost, retail, max_discount, is_active)
SELECT 
    mm_code,
    make || ' ' || model as name,
    type as description,
    0 as cost,  -- Add actual cost
    0 as retail, -- Add actual retail price
    0 as max_discount,
    true as is_active
FROM westvaal.basic_vehicle_information
ON CONFLICT DO NOTHING;
*/
