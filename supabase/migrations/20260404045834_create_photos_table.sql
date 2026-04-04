/*
  # Create photos storage and table

  ## Overview
  This migration sets up the infrastructure for a Google Photos-like application
  where users can upload, store, and manage their photos.

  ## New Tables
  1. `photos`
    - `id` (uuid, primary key) - Unique identifier for each photo
    - `user_id` (uuid, foreign key) - References auth.users, owner of the photo
    - `storage_path` (text) - Path to the image in Supabase Storage
    - `filename` (text) - Original filename of the uploaded image
    - `file_size` (bigint) - Size of the file in bytes
    - `content_type` (text) - MIME type of the image
    - `width` (integer) - Image width in pixels
    - `height` (integer) - Image height in pixels
    - `uploaded_at` (timestamptz) - Timestamp when photo was uploaded

  ## Storage
  - Creates a 'photos' storage bucket for storing images
  - Bucket is private by default

  ## Security
  - Enable RLS on `photos` table
  - Users can only view their own photos
  - Users can only insert their own photos
  - Users can only delete their own photos
  - Storage policies allow authenticated users to upload/view their own photos
*/

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  storage_path text NOT NULL,
  filename text NOT NULL,
  file_size bigint DEFAULT 0,
  content_type text DEFAULT 'image/jpeg',
  width integer DEFAULT 0,
  height integer DEFAULT 0,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for photos table
CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );