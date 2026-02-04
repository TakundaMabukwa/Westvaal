-- ========================================
-- Insert Accessories Data (Volkswagen Polo Vivo)
-- Run this in your Supabase SQL Editor after creating accessories table
-- ========================================

INSERT INTO westvaal.accessories (mm_code, name, description, cost, retail, max_discount, is_active) VALUES
-- Transport Accessories
('6R0071126', 'VW Roof Bar Pair', 'Roof bar set - Silver for Polo Vivo', 0, 2500.00, 5.00, true),
('000071200', 'Roof Box 340L', 'Roof box - 340 litres, matt black', 0, 8500.00, 5.00, true),
('000071200AE', 'Roof Box 460L Comfort', 'Roof box - Comfort, 460 litres, high-gloss black', 0, 12500.00, 5.00, true),
('000071200AF', 'Roof Box Urban Loader', 'Roof box - 300-500 litres, urban loader, matte black', 0, 11000.00, 5.00, true),
('000071128F', 'Bicycle Holder', 'Bicycle holder - For bicycle frames of up to 100 mm (oval)/80 mm (round)', 0, 3500.00, 5.00, true),
('6R0055210', 'Electrical Wiring Kit', 'Electrical wiring kit for towing', 0, 1800.00, 5.00, true),

-- Interior Accessories
('6R0061160', 'Boot Inlay', 'Boot inlay - For non variable floor', 0, 650.00, 5.00, true),
('000072549A', 'Additional Mirror', 'Inside rear view mirror (Additional) - Suction cap mounting', 0, 450.00, 5.00, true),
('000019819C', 'Child Seat Underlay', 'Underlay for child seat system - Seat cover', 0, 550.00, 5.00, true),

-- Child Safety
('5G0019907', 'Child Seat G0 Plus', 'Child seat - Up to 13 kg, G0 Plus Isofix', 0, 4200.00, 5.00, true),
('000019906J', 'Child Seat G2-3 ISOFIT', 'Child seat - G2-3 ISOFIT, 15 to 36 kg, backrest removable', 0, 3800.00, 5.00, true)

ON CONFLICT (id) DO NOTHING;

-- Note: Prices are estimates and should be updated with actual dealer pricing
-- cost field is set to 0 and should be updated with actual cost prices
