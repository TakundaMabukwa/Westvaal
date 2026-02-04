-- ========================================
-- Supabase Vehicle M&M (Make & Model) Setup
-- Run this in your Supabase SQL Editor
-- ========================================

-- 1. Create Basic Vehicle Information table
CREATE TABLE IF NOT EXISTS westvaal.basic_vehicle_information (
    mm_code TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Specifications table
CREATE TABLE IF NOT EXISTS westvaal.specifications (
    mm_code TEXT PRIMARY KEY REFERENCES westvaal.basic_vehicle_information(mm_code) ON DELETE CASCADE,
    cubic_capacity INTEGER NOT NULL,
    kilowatt DECIMAL(10, 2) NOT NULL,
    newton_meter DECIMAL(10, 2) NOT NULL,
    co2_emissions DECIMAL(10, 2) NOT NULL,
    fuel_type_id INTEGER NOT NULL,
    fuel_consumption DECIMAL(10, 2) NOT NULL,
    period INTEGER NOT NULL,
    kms_per_month INTEGER NOT NULL,
    total_kms INTEGER NOT NULL,
    retail DECIMAL(15, 2) NOT NULL,
    fuel_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Finance table
CREATE TABLE IF NOT EXISTS westvaal.finance (
    mm_code TEXT PRIMARY KEY REFERENCES westvaal.basic_vehicle_information(mm_code) ON DELETE CASCADE,
    finance_per_month DECIMAL(15, 2) NOT NULL,
    rv DECIMAL(15, 2) NOT NULL,
    rv_percentage DECIMAL(5, 2) NOT NULL,
    total_finance DECIMAL(15, 2) NOT NULL,
    resale DECIMAL(15, 2) NOT NULL,
    maintenance DECIMAL(15, 2) NOT NULL,
    tyres DECIMAL(15, 2) NOT NULL,
    fuel DECIMAL(15, 2) NOT NULL,
    insurance DECIMAL(15, 2) NOT NULL,
    operating_cost_per_month DECIMAL(15, 2) NOT NULL,
    operating_cost_per_kilometre DECIMAL(15, 2) NOT NULL,
    total_cost_per_month DECIMAL(15, 2) NOT NULL,
    total_cost_per_kilometre DECIMAL(15, 2) NOT NULL,
    total_cost_overall DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Warranty table
CREATE TABLE IF NOT EXISTS westvaal.warranty (
    mm_code TEXT PRIMARY KEY REFERENCES westvaal.basic_vehicle_information(mm_code) ON DELETE CASCADE,
    warranty_months INTEGER NOT NULL,
    warranty_kilometers INTEGER NOT NULL,
    plan_type_id INTEGER NOT NULL,
    plan_months INTEGER NOT NULL,
    plan_kilometers INTEGER NOT NULL,
    plan_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Additional Features table
CREATE TABLE IF NOT EXISTS westvaal.additional_features (
    mm_code TEXT PRIMARY KEY REFERENCES westvaal.basic_vehicle_information(mm_code) ON DELETE CASCADE,
    has_abs BOOLEAN DEFAULT FALSE,
    has_airbags BOOLEAN DEFAULT FALSE,
    has_aircon BOOLEAN DEFAULT FALSE,
    has_alloy_wheels BOOLEAN DEFAULT FALSE,
    has_cruise_control BOOLEAN DEFAULT FALSE,
    has_diff_lock BOOLEAN DEFAULT FALSE,
    has_electric_windows BOOLEAN DEFAULT FALSE,
    has_low_ratio BOOLEAN DEFAULT FALSE,
    has_pdc BOOLEAN DEFAULT FALSE,
    has_power_steering BOOLEAN DEFAULT FALSE,
    has_sat_nav BOOLEAN DEFAULT FALSE,
    has_security BOOLEAN DEFAULT FALSE,
    has_traction BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Product (vehicle catalog) table
CREATE TABLE IF NOT EXISTS westvaal.products (
    id SERIAL PRIMARY KEY,
    mm_code TEXT NOT NULL REFERENCES westvaal.basic_vehicle_information(mm_code) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cost DECIMAL(15, 2) NOT NULL,
    retail DECIMAL(15, 2) NOT NULL,
    max_discount DECIMAL(5, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_basic_vehicle_make ON westvaal.basic_vehicle_information(make);
CREATE INDEX IF NOT EXISTS idx_basic_vehicle_model ON westvaal.basic_vehicle_information(model);
CREATE INDEX IF NOT EXISTS idx_basic_vehicle_type ON westvaal.basic_vehicle_information(type);
CREATE INDEX IF NOT EXISTS idx_products_mm_code ON westvaal.products(mm_code);
CREATE INDEX IF NOT EXISTS idx_products_active ON westvaal.products(is_active);

-- 8. Enable Row Level Security
ALTER TABLE westvaal.basic_vehicle_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE westvaal.specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE westvaal.finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE westvaal.warranty ENABLE ROW LEVEL SECURITY;
ALTER TABLE westvaal.additional_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE westvaal.products ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for authenticated users
DO $$
BEGIN
  -- Basic Vehicle Information policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'basic_vehicle_information' 
    AND policyname = 'Users can view all vehicles'
  ) THEN
    CREATE POLICY "Users can view all vehicles" ON westvaal.basic_vehicle_information
        FOR SELECT TO authenticated
        USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'basic_vehicle_information' 
    AND policyname = 'Users can insert vehicles'
  ) THEN
    CREATE POLICY "Users can insert vehicles" ON westvaal.basic_vehicle_information
        FOR INSERT TO authenticated
        WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'basic_vehicle_information' 
    AND policyname = 'Users can update vehicles'
  ) THEN
    CREATE POLICY "Users can update vehicles" ON westvaal.basic_vehicle_information
        FOR UPDATE TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;

  -- Specifications policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'specifications' 
    AND policyname = 'Users can manage specifications'
  ) THEN
    CREATE POLICY "Users can manage specifications" ON westvaal.specifications
        FOR ALL TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;

  -- Finance policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'finance' 
    AND policyname = 'Users can manage finance'
  ) THEN
    CREATE POLICY "Users can manage finance" ON westvaal.finance
        FOR ALL TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;

  -- Warranty policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'warranty' 
    AND policyname = 'Users can manage warranty'
  ) THEN
    CREATE POLICY "Users can manage warranty" ON westvaal.warranty
        FOR ALL TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;

  -- Additional Features policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'additional_features' 
    AND policyname = 'Users can manage features'
  ) THEN
    CREATE POLICY "Users can manage features" ON westvaal.additional_features
        FOR ALL TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;

  -- Products policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'products' 
    AND policyname = 'Users can manage products'
  ) THEN
    CREATE POLICY "Users can manage products" ON westvaal.products
        FOR ALL TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;
END $$;

-- 10. Grant permissions to authenticated users
GRANT ALL ON westvaal.basic_vehicle_information TO authenticated;
GRANT ALL ON westvaal.specifications TO authenticated;
GRANT ALL ON westvaal.finance TO authenticated;
GRANT ALL ON westvaal.warranty TO authenticated;
GRANT ALL ON westvaal.additional_features TO authenticated;
GRANT ALL ON westvaal.products TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE westvaal.products_id_seq TO authenticated;
