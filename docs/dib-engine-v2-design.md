# DataBreef Dib Engine v2
## Design Document & Product Specification
**Sprint 2 | April 2026**

---

## Executive Summary

This document specifies the enhanced Data Intelligence Brief (Dib) engine, designed to transform database introspection into actionable business intelligence. The current Dib provides basic schema overview; the v2 engine will deliver personalized, ROI-driven insights that justify a $30/month subscription.

**Core innovation:** The Dib engine infers database purpose from schema, then delivers context-aware insights on security, performance, or cost optimization—with quantified ROI (dollars saved, hours reclaimed). This transforms the free Dib from a feature preview into a conversion engine.

- **Free tier:** One balanced Dib per account, enough to prove value without cannibalizing premium
- **Premium:** Security deep-dive, performance optimization, benchmarking, monthly refresh credits

---

## 1. Database Admin Pain Points

Database administrators and engineering leaders face persistent challenges in database health, cost, and risk management. DataBreef's Dib engine targets these specific pain points:

### 1.1 Cost Blindness

- Most teams don't know what their database actually costs to run. Infrastructure sprawl (unused indexes, bloated tables, duplicate data) silently increases spend.
- No easy way to estimate savings from optimization (e.g., "If we archive old records, we save $X/month").
- **Pain:** "I don't have visibility into which tables are expensive or why."

### 1.2 Security Debt

- Unencrypted PII, missing foreign keys, overpermissioned access, and audit trail gaps accumulate silently. Compliance audits reveal gaps too late.
- No automated detection of which tables hold sensitive data or how they're accessed.
- **Pain:** "I don't know if my database is actually secure until a breach happens."

### 1.3 Performance Mysteries

- Slow queries, N+1 patterns, missing indexes, and table bloat manifest as user complaints, not root causes. Diagnosing requires deep query analysis that many teams can't afford.
- No single source of truth on which queries are slow and why.
- **Pain:** "I know something's slow, but I don't know what to fix."

### 1.4 Compliance & Auditability

- Regulators (GDPR, HIPAA, SOC 2) require audit trails, data lineage, and retention policies. Many teams build ad-hoc compliance checks that aren't trustworthy.
- **Pain:** "We need to prove our database is secure and compliant, but we lack the evidence."

### 1.5 Persona: The Target User

**Primary: Mid-Market Engineering Leaders (VP Eng, Tech Lead, DBA)**
- 5–100 engineers, 10–1000 GB of database
- Already using Postgres/MySQL in production, running lean ops teams
- Responsible for uptime, cost, and security. Time-constrained.
- Budget: $200–$500/month for developer tools; ROI-focused

---

## 2. Current State: Dib v1

Sprint 1 delivered a functional Dib that provides:

- Schema overview: table count, column count, index count
- Basic data profiling: row counts, column types, NULL rates
- Structural analysis: foreign key detection, primary key validation
- Static HTML/PDF output, no interactivity or personalization

**Limitation:** Dibs are informational, not actionable. They show what exists, not what's broken or expensive. Users can't distinguish between healthy and risky schemas.

---

## 3. Dib Engine v2 Architecture

The enhanced Dib engine operates in three stages: Classification, Insight Generation, and Presentation.

### 3.1 Stage 1: Database Type Classification

The engine infers database purpose from schema structure and naming patterns. This unlocks database-specific insights (e.g., a CRM database gets different recommendations than an analytics warehouse).

#### Classification Flow

1. **Auto-Classification:** System analyzes table names, column patterns, and relationships
2. **User Confirmation:** "We detected a CRM database. Correct?"
3. **Refinement Questions (if uncertain):**
   - Team size
   - Primary use case (marketing, support, analytics, transactions)
   - Industry (SaaS, fintech, healthcare, e-commerce)
   - Data sensitivity (personal, financial, health data?)
4. **Confidence Score:** Locked in; all future Dibs use this classification

#### Supported Database Types

| Type | Detection Pattern | Key Insight Focus |
|------|-------------------|-------------------|
| CRM | contacts, accounts, deals, opportunities | Data quality, segmentation, compliance |
| Analytics | fact tables, dimensions, aggregations | Query performance, denormalization, refresh lag |
| Transactional | orders, payments, inventory, status | ACID compliance, lock contention, throughput |
| User Management | users, roles, sessions, auth tokens | Password security, session lifetime, access patterns |

### 3.2 Stage 2: Insight Generation

Once the database type is confirmed, the engine generates insights across three dimensions:

#### A. Actionable Insights

Specific, quantifiable recommendations with estimated ROI.

- **Example (Performance focus):** "Table 'orders' lacks an index on 'created_at'. Your query logs show 120 scans/day over 2.5 seconds. Adding this index could reclaim ~5 hours/month and reduce CPU 15%."
- **Example (Security focus):** "Column 'users.ssn' is readable by 12 app roles. PCI-DSS requires encryption at rest and field-level access control. Recommended remediation: TDE + row-based permissions (~2 days implementation)."
- **Example (Cost focus):** "Table 'audit_logs' is 47 GB with 8 years of unindexed data. Archiving to cold storage (S3) would save ~$300/month and improve query speed by 40%."

#### B. Exploratory Insights

Context and patterns that reveal hidden business logic or deviations from best practices.

- "Your schema uses 8 different timestamp columns (created_at, updated_at, deleted_at, archived_at, expires_at, active_from, active_to, audit_at). Industry average is 3–4. This complexity may indicate process drift."
- "Your CRM uses an 'enum' field for status, but your code has 15 different values. True enums support 4–6 values; more suggests state machine fragmentation."
- "Your 'users' table has no soft-delete (is_deleted) column, but your 'orders' table does. This inconsistency can cause compliance and reconciliation issues."

#### C. ROI Quantification

Every actionable insight includes estimated ROI in terms of money or time.

- **Cost:** "Archiving 100 GB of old logs = $250/month saved"
- **Time:** "Adding indexes reclaims 40 engineering hours/quarter (5% of ops time)"
- **Risk:** "Fixing this security issue prevents 95% of common breach vectors in your industry"

### 3.3 Focus Modes

Users can request Dibs with three focus modes that weight insights differently:

| Mode | Focus | Example Questions |
|------|-------|-------------------|
| **Security** | Unencrypted PII, access controls, audit trails, compliance gaps | Is our database GDPR-compliant? Who can access PII? Are we encrypting sensitive columns? |
| **Performance** | Missing indexes, slow queries, table bloat, N+1 patterns, lock contention | Which queries are slowest? Can we add indexes? Are we table-scanning? Why is CPU high? |
| **Balanced** | Balanced view of all three; weighted equally by industry baseline | What should we prioritize? What do healthy competitors look like? Where do we deviate? |

### 3.4 Free vs Premium Gating

The free Dib is the conversion hook. It must deliver enough insight to prove value, but not so much that users feel they have everything.

| Feature | Free | Premium |
|---------|------|---------|
| **Dibs per month** | 1 initial Dib (then upgrade to unlock) | 4 Dibs (monthly refresh) |
| **Focus mode** | Balanced only | All (Security, Performance, Balanced) |
| **Insight depth** | Top 5–10 insights (ballpark ROI) | All insights (precise ROI, deep drills) |
| **Benchmarking** | Generic industry baseline | Peer benchmarking (vs similar DBs) |
| **Refresh** | One-time (TBD) | Refreshable monthly (TBD crediting) |

**Key principle:** The free Dib must show enough depth that a user thinks "This is amazing; if I pay $30/month, I can run deep security audits or performance optimization queries." But it should NOT show so much that they think "I got everything I need for free."

---

## 4. Insight Examples by Database Type

### 4.1 Example: SaaS CRM Database

Detected schema: contacts, accounts, deals, interactions, notes, custom_fields

#### Free Dib (Balanced mode):

- "Your CRM holds data on 47k contacts. Email addresses are readable by 5 app roles. GDPR requires explicit data access controls. Estimated effort: 1 day. Estimated risk reduction: 60%."
- "Deals table lacks an index on 'updated_at'. Your most common reports scan 200k rows. Adding an index would speed reports by 85% and save ~8 hours/month of frustration."
- "You have 14 custom status fields across tables. Industry standard is 2–3. This suggests complexity that might indicate feature bloat or incomplete data modeling."
- "Notes table has 2.4M rows and no retention policy. At your data growth rate, it will cost ~$400/month in storage by Q4. Archive plan: move notes >1 year old to cold storage, save $200/month."

#### Premium Dib (Security focus):

- "Complete PII inventory: 8 columns expose personal data (name, email, phone, SSN, drivers license, home address, bank account, credit card). Current encryption: None. Compliance gap: GDPR article 32. Remediation: Enable TDE + field-level encryption (3 days). Risk impact: Prevents 90% of credential theft attacks."
- "Foreign key analysis: 6/8 tables missing FKs to parent entities. This allows orphaned records. Example: 300 deals with deleted accounts. Remediation: Add FKs with CASCADE delete (1 day). Data quality impact: Prevents 12M annual invalid state records."
- "Audit trail gaps: No created_by or updated_by fields. Cannot trace who created a high-value deal. Remediation: Add audit triggers (2 days). Compliance impact: Enables GDPR audit trails required for fintech/healthcare."

#### Premium Dib (Performance focus):

- "Query analysis: Top 5 slow queries. 'Get deals by account_id' scans 200k rows, takes 3.2s, runs 50x/day. 40 wasted CPU-seconds/day. Fix: Add index on (account_id, deal_status, updated_at). Estimated savings: 10 hours/month in ops time, $2k/month in CPU."
- "Table bloat: Contacts table is 8.2 GB with 700 MB of dead rows (deletions without VACUUM). Full table scans are 10% slower than ideal. Remediation: ANALYZE, VACUUM FULL (1 hour outage). Benefit: Reclaim 700 MB, improve scan performance 10%."
- "Lock contention: High UPDATE rates on 'deals' during end-of-month surge. Peak lock wait: 2.3s. Remediation: Partition 'deals' by month (1 week). Benefit: 90% reduction in lock contention, enable concurrent month-end closes."

---

## 5. Implementation Roadmap

### 5.1 Phase 1: Classifier & Data Collection (Sprint 2)

- Implement database type classifier (rule-based + ML signals)
- Build schema introspection queries (tables, columns, FKs, indexes, constraints)
- Implement data profiling (row counts, cardinality, NULL rates, string length distribution)
- Collect baseline performance metrics (slow query log analysis, table size, index usage)

### 5.2 Phase 2: Insight Engine (Sprint 3–4)

- Define insight templates for each database type
- Implement ROI calculation rules (cost savings, time savings, risk reduction)
- Build focus mode filtering (Security / Performance / Balanced)
- Create HTML rendering for Dibs (interactive, filterable, printable)

### 5.3 Phase 3: Free vs Premium & Payment (Sprint 4+)

- Implement Dib credit system (free = 1 initial, premium = 4/month)
- Wire payment flow (Stripe integration for subscription purchase)
- Add "Request Premium Dib" button + upsell messaging
- A/B test free Dib quality to find conversion-optimized content

---

## 6. Success Metrics

The enhanced Dib engine is successful if:

- **Free Dib > 40% conversion to premium:** Users see enough value to justify $30/month
- **Average Dib generates $2k+ in estimated ROI:** The insights are big enough to matter
- **Classifier accuracy > 90%:** Database type detection is reliable
- **Dib generation time < 5 minutes:** Fast enough for user to wait
- **NPS > 60 from free Dib users:** High satisfaction and likelihood to recommend

---

## 7. Conclusion

The Dib engine v2 transforms database introspection from exploratory to decisive. By classifying databases, understanding pain points, and delivering personalized, quantified insights, DataBreef creates a tool that database admins can't refuse.

The free Dib is the conversion hook. It must deliver 40%+ conversion to premium to justify the development investment. This requires careful balance: enough depth to wow users, but not so much that they feel they have everything.

The $30/month price point is justified by ROI. If a typical Dib identifies $2k+ in cost savings or risk reduction, users will subscribe. If it identifies only minor optimizations, they won't.

**This spec sets the bar. Every insight must answer the question: "Is this worth $30/month?"**
