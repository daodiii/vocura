-- ============================================================================
-- IMPORTANT: Run a full database backup BEFORE applying this migration!
--
--   pg_dump -Fc -d $DATABASE_URL -f vocura_backup_pre_companion_pivot.dump
--
-- This migration drops tables containing sensitive patient data as part of
-- the companion tool pivot (Vocura no longer stores patient data locally).
-- These tables will be permanently removed and CANNOT be recovered without
-- a backup.
-- ============================================================================

-- Drop tables in correct order (children first, then parents)

-- 1. Drop transcripts (depends on recordings)
DROP TABLE IF EXISTS "transcripts" CASCADE;

-- 2. Drop form_submissions (depends on patients, users)
DROP TABLE IF EXISTS "form_submissions" CASCADE;

-- 3. Drop journal_entries (depends on patients, users)
DROP TABLE IF EXISTS "journal_entries" CASCADE;

-- 4. Drop recordings (depends on patients, users)
DROP TABLE IF EXISTS "recordings" CASCADE;

-- 5. Drop patients (depends on users)
DROP TABLE IF EXISTS "patients" CASCADE;
