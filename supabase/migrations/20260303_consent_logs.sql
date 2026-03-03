-- GDPR Consent Audit Log table
-- Apply manually in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX idx_consent_logs_type_user ON consent_logs(consent_type, user_id);

-- Enable RLS
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read/insert their own consent logs
CREATE POLICY "Users can read own consent logs"
  ON consent_logs FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own consent logs"
  ON consent_logs FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

-- No update or delete — consent records are immutable audit logs
