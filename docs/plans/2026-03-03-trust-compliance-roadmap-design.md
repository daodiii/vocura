# Vocura Trust & Compliance Roadmap — Design Document

**Date:** 2026-03-03
**Approach:** B — "Credible Healthcare Vendor" (3 months)
**Goal:** Earn 100% trust from Norwegian GPs, clinic decision-makers, and patients

## Problem Statement

Vocura's codebase security is strong (8.5/10): AES-256-GCM E2E encryption, BankID Level 4 eID, comprehensive audit logging, CSRF protection, rate limiting, CSP headers, Zod validation, and RLS.

But **visible trust is 3/10**. Healthcare professionals cannot inspect source code. Every security claim on `/sikkerhet` is self-asserted. The DPA page says "under utvikling." No independent pen test. No DPIA. No incident response plan. No per-patient consent workflow.

A clinic's IT manager will ask for a DPA to sign — and there isn't one. That ends the conversation before it starts.

## Target Audiences

| Audience | What they evaluate | Current gap |
|----------|-------------------|-------------|
| **Fastleger (GPs)** | Normen compliance, BankID, patient data safety, peer adoption | No proof of Normen compliance, no per-patient consent |
| **Clinic decision-makers** | DPA, DPIA, vendor risk assessment, pen test, SLA | No DPA, no DPIA, no pen test, no SLA |
| **Patients** | Doctor endorsement, recognizable trust symbols, data transparency, control | No patient-facing trust page, no per-patient consent |

---

## Section 1: Legal & Documentation Foundation

### 1.1 Databehandleravtale (DPA)
- Replace placeholder `/databehandleravtale` page with real, downloadable PDF
- Based on Datatilsynet's standard template for health data
- Covers: purpose, data categories, security measures, sub-processors (OpenAI, Supabase, Criipto, Upstash, Sentry), data residency, breach notification SLA, termination & data return
- Digitally signable (PDF with signature fields)
- Each clinic signs before onboarding

### 1.2 DPIA (Data Protection Impact Assessment)
- Required by GDPR Art. 35 for health data processing at scale
- Document: what data is processed, why, risks identified, mitigations
- Covers AI processing specifically (Whisper transcription, GPT-4o structuring)
- Available to clinics on request

### 1.3 Incident Response Plan
- Procedure: detection -> containment -> notification -> remediation
- Breach notification: Datatilsynet within 72 hours, affected clinics immediately
- Contact chain and escalation path
- Summary published on `/sikkerhet`, full document for signed customers

### 1.4 SLA & Availability
- Uptime target: 99.5%
- Support response: 24h non-critical, 4h data incidents
- Published on website or in contract appendix

### 1.5 AI Governance & Liability
- AI is clinical decision support, not decision-maker
- Doctor retains full clinical responsibility
- Document: model selection, data flow to OpenAI, OpenAI DPA status
- Error handling for wrong AI suggestions
- Formalize "no training on patient data" in DPA

---

## Section 2: Technical Trust Hardening

### 2.1 Session Timeout
- 15-minute inactivity timeout
- Warning modal at 13 minutes with "Extend session" button
- Auto-logout clears encryption keys from memory
- Critical for shared clinic workstations

### 2.2 MFA / Two-Factor Authentication
- Required for admin users, strongly encouraged for clinicians
- TOTP-based (Google Authenticator, Authy) via Supabase Auth
- Enrollment flow during onboarding or from profile settings
- Recovery codes generated at enrollment

### 2.3 Auth Event Logging
- New `auth_events` table: login, logout, failed attempts, MFA challenges, session timeout
- Captures: userId, event type, IP address, user agent, timestamp
- Failed login threshold: 5 attempts -> 15-min lockout + email alert

### 2.4 Data Access Logging
- Add read-access logging: who viewed which clinical notes, when
- Required by Normen (patients can ask who accessed their journal)
- Log: userId + entityId + timestamp on every clinical note read

### 2.5 Per-Patient Consent Workflow
- Before recording/transcribing: "Pasienten er informert om AI-behandling" confirmation
- Checkbox or toggle in dashboard recording interface
- Consent logged with timestamp, patient context, doctor userId
- Optional: generate patient information sheet PDF

### 2.6 Security.txt
- Publish `/.well-known/security.txt`
- Contact email, PGP key, disclosure policy

### 2.7 Cookie Consent Banner
- Minimal, honest banner: "Vi bruker kun nodvendige informasjonskapsler. Ingen sporing."
- Reinforces no-tracking stance visibly

---

## Section 3: Trust Visibility & Sales Enablement

### 3.1 Security Whitepaper (PDF)
- 8-10 pages for clinic IT managers and decision-makers
- Non-technical language with data flow diagrams
- Covers: architecture, encryption, BankID, data residency, AI data flow, Normen alignment, retention & deletion
- Downloadable from `/sikkerhet`, used in sales

### 3.2 Vendor Risk Assessment Package
- Pre-filled answers to standard vendor security questionnaires
- Covers common Norwegian health sector assessment framework questions
- Downloadable PDF or structured form
- Saves clinics weeks of evaluation back-and-forth

### 3.3 Patient-Facing Trust Page
- New page `/pasientinformasjon` in plain Norwegian (B1 reading level)
- What Vocura does, what happens to patient data, who can see it
- AI cannot see patient identity, doctor retains all responsibility
- Patient rights: access, deletion, Datatilsynet complaint
- Printable as one-page clinic handout

### 3.4 Enhanced `/sikkerhet` Page
- Add "Uavhengig sikkerhetstestet" section (after pen test)
- Add downloadable links: DPA, security whitepaper, patient info sheet
- Add data flow diagram (microphone -> browser encryption -> Supabase EU -> doctor only)
- Add sub-processor list with data residency
- Replace vague claims with specifics and evidence

### 3.5 Trust Badges with Substance
- After pen test: "Uavhengig sikkerhetstestet [year]" badge linking to summary
- After Normen self-assessment: "Normen-etterlevelse dokumentert" badge
- After DPA published: "Databehandleravtale tilgjengelig" badge
- Each badge links to actual evidence

### 3.6 Accessibility Statement
- New page `/universell-utforming`
- Required for public sector procurement (likestillings- og diskrimineringsloven)
- Honest self-assessment: what's compliant, what's in progress

---

## Section 4: External Validation

### 4.1 Penetration Test
- Third-party Norwegian security firm (mnemonic, Netsecurity, Watchcom, etc.)
- Scope: web app, API endpoints, auth flows, encryption implementation
- Budget: ~50-100k NOK
- Publish non-sensitive summary on `/sikkerhet`

### 4.2 Normen Self-Assessment
- Use Normen's self-assessment framework (egenvurdering)
- Document compliance status per control area with evidence
- Share with clinics as formal document
- Prepares for future formal audit

### 4.3 Sub-Processor DPAs
- Collect and formalize DPAs with: OpenAI, Supabase, Criipto, Upstash, Sentry
- Store copies — clinics may request them

### 4.4 WCAG Self-Audit
- Audit against WCAG 2.1 AA using axe + Lighthouse
- Fix critical issues: color contrast, keyboard nav, screen reader labels
- Publish accessibility statement with honest status

---

## Implementation Timeline

```
MONTH 1 — Legal Foundation + Critical Code
  Week 1-2: DPA (draft, legal review, publish)
  Week 1-2: Session timeout + auth event logging
  Week 2-3: DPIA document
  Week 3-4: Incident response plan
  Week 3-4: Security.txt + cookie banner
  Week 4:   Per-patient consent workflow

MONTH 2 — Trust Visibility + MFA
  Week 1-2: MFA implementation (TOTP)
  Week 1-2: Data access logging (read events)
  Week 2-3: Security whitepaper (write + design)
  Week 2-3: Patient info page (/pasientinformasjon)
  Week 3-4: Enhanced /sikkerhet page + data flow diagram
  Week 4:   Vendor risk assessment package

MONTH 3 — External Validation
  Week 1-2: Commission + complete pen test
  Week 1-2: Normen self-assessment
  Week 2-3: Collect all sub-processor DPAs
  Week 3:   WCAG self-audit + accessibility statement
  Week 3-4: Update trust badges with evidence links
  Week 4:   AI governance document + SLA definition
```

## Outcome

After 3 months, a clinic decision-maker receives:
- A signable DPA
- A security whitepaper with data flow diagrams
- Pre-filled vendor risk assessment answers
- Evidence of independent pen testing
- Normen self-assessment documentation
- A DPIA they can reference for their own compliance
- A patient information sheet for their waiting room

That transforms Vocura from "we're secure, trust us" to "here's the evidence."

## Current Security Baseline (for reference)

Already implemented: BankID Level 4 eID, AES-256-GCM E2E encryption, CSRF double-submit cookies, Zod input validation, DOMPurify HTML sanitization, CSP with nonce-based script-src, HSTS (2-year, preload), Upstash Redis rate limiting (IP + user), comprehensive audit logging with SHA-256 content hashing, RLS on all user tables, Sentry error tracking (PII disabled), prompt injection prevention.

**Score: 8.5/10 technically. Target: 9.5/10 with visible proof.**
