-- pg_cron cleanup for expired clinical notes
-- NOTE: Apply this manually in the Supabase Dashboard SQL Editor
-- because pg_cron requires superuser privileges.

-- Enable pg_cron extension (must be done by superuser)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule hourly cleanup of expired clinical notes
-- Replace YOUR_APP_URL and YOUR_CRON_SECRET with actual values
/*
SELECT cron.schedule(
  'cleanup-expired-clinical-notes',
  '0 * * * *',
  $$
  DELETE FROM clinical_notes
  WHERE epj_transferred = true
    AND delete_after IS NOT NULL
    AND delete_after < NOW();
  $$
);
*/
