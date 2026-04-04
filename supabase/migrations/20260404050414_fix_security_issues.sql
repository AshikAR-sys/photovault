/*
  # Fix security and performance issues

  ## Issues Addressed
  1. Added covering index for foreign key on photos.user_id to improve query performance
  2. Optimized RLS policies by replacing auth.uid() with (select auth.uid()) to improve performance at scale
  3. These changes ensure queries are evaluated efficiently without re-evaluating auth functions per row

  ## Changes
  - Create index on photos(user_id) to optimize foreign key lookups
  - Drop and recreate RLS policies with optimized auth function calls
*/

-- Create index for foreign key to improve query performance
CREATE INDEX IF NOT EXISTS photos_user_id_idx ON photos(user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own photos" ON photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON photos;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);
