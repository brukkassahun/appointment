-- ============================================
-- Jetour Appointments Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Bookings table: created by admin (Bk) when a car deal is confirmed
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(12) UNIQUE NOT NULL,
  car_make VARCHAR(100) NOT NULL,
  car_model VARCHAR(100) NOT NULL,
  car_year INTEGER NOT NULL,
  car_price VARCHAR(50) NOT NULL,
  car_image_url TEXT,
  client_ref VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- Appointments table: submitted by clients via the booking form
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_name VARCHAR(200) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  client_email VARCHAR(200),
  purpose VARCHAR(100) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time VARCHAR(50) NOT NULL,
  num_visitors VARCHAR(20) DEFAULT '1',
  payment_method VARCHAR(50),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_bookings_slug ON bookings(slug);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_id ON appointments(booking_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Public can view active bookings" ON bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Public can view appointments" ON appointments;

-- Policies: public can view active bookings (clients need to see their form)
CREATE POLICY "Public can view active bookings" ON bookings
  FOR SELECT USING (status = 'active');

-- Public can create bookings (admin uses anon key client-side; service role used server-side)
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Public can create appointments (clients submit forms)
CREATE POLICY "Public can create appointments" ON appointments
  FOR INSERT WITH CHECK (true);

-- Public can view appointments (admin dashboard reads with anon key)
-- NOTE: For production, restrict this to authenticated users.
-- For this small internal tool, the admin password protects the UI.
CREATE POLICY "Public can view appointments" ON appointments
  FOR SELECT USING (true);

-- Also allow viewing ALL bookings (not just active) for admin dashboard
DROP POLICY IF EXISTS "Public can view all bookings" ON bookings;
CREATE POLICY "Public can view all bookings" ON bookings
  FOR SELECT USING (true);
