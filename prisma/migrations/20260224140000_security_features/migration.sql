-- Security Features: Identity fields, ClinicalNote, RetentionSettings
-- Part of Task 4: Database Schema - Identity & Retention Models

-- 1. Add identity and encryption fields to users table
ALTER TABLE "users" ADD COLUMN "identity_level" TEXT;
ALTER TABLE "users" ADD COLUMN "auth_provider" TEXT DEFAULT 'email';
ALTER TABLE "users" ADD COLUMN "national_id_hash" TEXT;
ALTER TABLE "users" ADD COLUMN "encryption_salt" TEXT;

-- Unique constraint on national_id_hash (only non-null values)
CREATE UNIQUE INDEX "users_national_id_hash_key" ON "users"("national_id_hash");

-- 2. Add foreign key from audit_logs to users
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Create clinical_notes table
CREATE TABLE "clinical_notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "content_encrypted" TEXT NOT NULL,
    "content_iv" TEXT,
    "template_type" TEXT,
    "epj_transferred" BOOLEAN NOT NULL DEFAULT false,
    "epj_transferred_at" TIMESTAMP(3),
    "retention_hours" INTEGER NOT NULL DEFAULT 48,
    "delete_after" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_notes_pkey" PRIMARY KEY ("id")
);

-- Indexes for clinical_notes
CREATE INDEX "clinical_notes_delete_after_idx" ON "clinical_notes"("delete_after");
CREATE INDEX "clinical_notes_user_id_idx" ON "clinical_notes"("user_id");

-- Foreign key: clinical_notes -> users
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Create retention_settings table
CREATE TABLE "retention_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text_retention_hours" INTEGER NOT NULL DEFAULT 48,
    "auto_delete_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retention_settings_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on user_id (one retention settings per user)
CREATE UNIQUE INDEX "retention_settings_user_id_key" ON "retention_settings"("user_id");

-- Foreign key: retention_settings -> users
ALTER TABLE "retention_settings" ADD CONSTRAINT "retention_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
