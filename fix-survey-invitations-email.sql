-- Fix survey_invitations table to include email column
-- This script adds the missing email column that the application expects

-- Add email column to survey_invitations table
ALTER TABLE survey_invitations 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing records to include email from members table
UPDATE survey_invitations 
SET email = members.email
FROM members 
WHERE survey_invitations.member_id = members.id 
  AND survey_invitations.email IS NULL;

-- Make email column NOT NULL after populating existing data
ALTER TABLE survey_invitations 
ALTER COLUMN email SET NOT NULL;

-- Add index for email column
CREATE INDEX IF NOT EXISTS idx_survey_invitations_email ON survey_invitations(email);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'survey_invitations' 
ORDER BY ordinal_position; 