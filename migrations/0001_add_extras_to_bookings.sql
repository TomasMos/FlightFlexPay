-- Add extras column to bookings table
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "extras" json;

