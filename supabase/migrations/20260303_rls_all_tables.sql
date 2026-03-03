-- RLS Audit: Enable Row-Level Security on all user-owned tables
-- Apply manually in Supabase Dashboard > SQL Editor
-- Run AFTER all schema migrations have been applied

-- ============================================================
-- 1. users — users can read/update only their own profile
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::uuid = id);

-- ============================================================
-- 2. templates — users can CRUD their own templates + read defaults
-- ============================================================
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own templates and defaults"
  ON templates FOR SELECT
  USING (user_id = auth.uid()::uuid OR is_default = true);

CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (user_id = auth.uid()::uuid);

-- ============================================================
-- 3. audit_logs — users can only read their own audit logs
-- ============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert own audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

-- ============================================================
-- 4. clinical_notes — users can CRUD only their own notes
-- ============================================================
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clinical notes"
  ON clinical_notes FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert own clinical notes"
  ON clinical_notes FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update own clinical notes"
  ON clinical_notes FOR UPDATE
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete own clinical notes"
  ON clinical_notes FOR DELETE
  USING (user_id = auth.uid()::uuid);

-- ============================================================
-- 5. epj_integrations — users can manage only their own integration
-- ============================================================
ALTER TABLE epj_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own EPJ integration"
  ON epj_integrations FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert own EPJ integration"
  ON epj_integrations FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update own EPJ integration"
  ON epj_integrations FOR UPDATE
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete own EPJ integration"
  ON epj_integrations FOR DELETE
  USING (user_id = auth.uid()::uuid);

-- ============================================================
-- 6. retention_settings — users can manage only their own settings
-- ============================================================
ALTER TABLE retention_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own retention settings"
  ON retention_settings FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert own retention settings"
  ON retention_settings FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update own retention settings"
  ON retention_settings FOR UPDATE
  USING (user_id = auth.uid()::uuid);

-- ============================================================
-- IMPORTANT: The service_role key bypasses RLS.
-- API routes use the anon key via Supabase client, so RLS applies.
-- The retention cleanup cron and admin indexer use service_role.
-- ============================================================
