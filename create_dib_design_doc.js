const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType, LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 },
        paragraph: { spacing: { line: 360, lineRule: "auto" } }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1A365D" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2D5A8C" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "3D7BA8" },
        paragraph: { spacing: { before: 140, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }
              }
            }
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "◦",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 1440, hanging: 360 }
              }
            }
          }
        ]
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }
              }
            }
          }
        ]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: {
          width: 12240,
          height: 15840
        },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: "DataBreef Dib Engine v2",
            bold: true,
            size: 36,
            color: "0B1222"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: "Design Document & Product Specification",
            size: 24,
            color: "546E7A"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: "Sprint 2 | April 2026",
            size: 22,
            italic: true,
            color: "78909C"
          })
        ]
      }),

      // Executive Summary
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Executive Summary")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("This document specifies the enhanced Data Intelligence Brief (Dib) engine, designed to transform database introspection into actionable business intelligence. The current Dib provides basic schema overview; the v2 engine will deliver personalized, ROI-driven insights that justify a $30/month subscription.")
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Core innovation: The Dib engine infers database purpose from schema, then delivers context-aware insights on security, performance, or cost optimization—with quantified ROI (dollars saved, hours reclaimed). This transforms the free Dib from a feature preview into a conversion engine.")
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [
          new TextRun("Free tier: One balanced Dib per account, enough to prove value without cannibalizing premium")
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [
          new TextRun("Premium: Security deep-dive, performance optimization, benchmarking, monthly refresh credits")
        ]
      }),

      // Section 1: Pain Points
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("1. Database Admin Pain Points")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Database administrators and engineering leaders face persistent challenges in database health, cost, and risk management. DataBreef's Dib engine targets these specific pain points:")
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.1 Cost Blindness")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Most teams don't know what their database actually costs to run. Infrastructure sprawl (unused indexes, bloated tables, duplicate data) silently increases spend.")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("No easy way to estimate savings from optimization (e.g., &#x201C;If we archive old records, we save $X/month&#x201D;).")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Pain: &#x201C;I don&#x2019;t have visibility into which tables are expensive or why.&#x201D;")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.2 Security Debt")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Unencrypted PII, missing foreign keys, overpermissioned access, and audit trail gaps accumulate silently. Compliance audits reveal gaps too late.")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("No automated detection of which tables hold sensitive data or how they're accessed.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Pain: &#x201C;I don&#x2019;t know if my database is actually secure until a breach happens.&#x201D;")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.3 Performance Mysteries")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Slow queries, N+1 patterns, missing indexes, and table bloat manifest as user complaints, not root causes. Diagnosing requires deep query analysis that many teams can&#x2019;t afford.")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("No single source of truth on which queries are slow and why.")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Pain: &#x201C;I know something&#x2019;s slow, but I don&#x2019;t know what to fix.&#x201D;")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.4 Compliance & Auditability")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Regulators (GDPR, HIPAA, SOC 2) require audit trails, data lineage, and retention policies. Many teams build ad-hoc compliance checks that aren&#x2019;t trustworthy.")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Pain: &#x201C;We need to prove our database is secure and compliant, but we lack the evidence.&#x201D;")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.5 Persona: The Target User")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({bold: true, text: "Primary: Mid-Market Engineering Leaders (VP Eng, Tech Lead, DBA)"})]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("5&#x2013;100 engineers, 10&#x2013;1000 GB of database")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Already using Postgres/MySQL in production, running lean ops teams")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Responsible for uptime, cost, and security. Time-constrained.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Budget: $200&#x2013;$500/month for developer tools; ROI-focused")]
      }),

      // Section 2: Current State
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("2. Current State: Dib v1")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Sprint 1 delivered a functional Dib that provides:")
        ]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Schema overview: table count, column count, index count")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Basic data profiling: row counts, column types, NULL rates")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Structural analysis: foreign key detection, primary key validation")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Static HTML/PDF output, no interactivity or personalization")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({bold: true, text: "Limitation: "})
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("Dibs are informational, not actionable. They show what exists, not what&#x2019;s broken or expensive. Users can&#x2019;t distinguish between healthy and risky schemas.")
        ]
      }),

      // Section 3: Dib Engine v2 Architecture
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("3. Dib Engine v2 Architecture")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("The enhanced Dib engine operates in three stages: Classification, Insight Generation, and Presentation.")
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.1 Stage 1: Database Type Classification")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("The engine infers database purpose from schema structure and naming patterns. This unlocks database-specific insights (e.g., a CRM database gets different recommendations than an analytics warehouse).")
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Classification Flow")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun({bold: true, text: "Auto-Classification: "}) + new TextRun("System analyzes table names, column patterns, and relationships")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun({bold: true, text: "User Confirmation: "}) + new TextRun("&#x201C;We detected a CRM database. Correct?&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun({bold: true, text: "Refinement Questions (if uncertain): "}) + new TextRun("")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 1 },
        children: [new TextRun("Team size")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 1 },
        children: [new TextRun("Primary use case (marketing, support, analytics, transactions)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 1 },
        children: [new TextRun("Industry (SaaS, fintech, healthcare, e-commerce)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 1 },
        children: [new TextRun("Data sensitivity (personal, financial, health data?)")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun({bold: true, text: "Confidence Score: "}) + new TextRun("Locked in; all future Dibs use this classification")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Supported Database Types")]
      }),

      // Database types table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3510, 3510],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Type"})] })]
              }),
              new TableCell({
                borders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Detection Pattern"})] })]
              }),
              new TableCell({
                borders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Key Insight Focus"})] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("CRM")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("contacts, accounts, deals, opportunities")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Data quality, segmentation, compliance")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Analytics")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("fact tables, dimensions, aggregations")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Query performance, denormalization, refresh lag")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Transactional")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("orders, payments, inventory, status")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("ACID compliance, lock contention, throughput")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("User Management")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("users, roles, sessions, auth tokens")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Password security, session lifetime, access patterns")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { after: 240 }, children: [new TextRun("")] }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.2 Stage 2: Insight Generation")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Once the database type is confirmed, the engine generates insights across three dimensions:")
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("A. Actionable Insights")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun("Specific, quantifiable recommendations with estimated ROI.")
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Example (Performance focus): &#x201C;Table &#x2018;orders&#x2019; lacks an index on &#x2018;created_at&#x2019;. Your query logs show 120 scans/day over 2.5 seconds. Adding this index could reclaim ~5 hours/month and reduce CPU 15%.&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Example (Security focus): &#x201C;Column &#x2018;users.ssn&#x2019; is readable by 12 app roles. PCI-DSS requires encryption at rest and field-level access control. Recommended remediation: TDE + row-based permissions (~2 days implementation).&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Example (Cost focus): &#x201C;Table &#x2018;audit_logs&#x2019; is 47 GB with 8 years of unindexed data. Archiving to cold storage (S3) would save ~$300/month and improve query speed by 40%.&#x201D;")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("B. Exploratory Insights")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun("Context and patterns that reveal hidden business logic or deviations from best practices.")
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Example: &#x201C;Your schema uses 8 different timestamp columns (created_at, updated_at, deleted_at, archived_at, expires_at, active_from, active_to, audit_at). Industry average is 3&#x2013;4. This complexity may indicate process drift.&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Example: &#x201C;Your CRM uses an &#x2018;enum' field for status, but your code has 15 different values. True enums support 4&#x2013;6 values; more suggests state machine fragmentation.&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Example: &#x201C;Your &#x2018;users&#x2019; table has no soft-delete (is_deleted) column, but your 'orders&#x2019; table does. This inconsistency can cause compliance and reconciliation issues.&#x201D;")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("C. ROI Quantification")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Every actionable insight includes estimated ROI in terms of money or time.")
        ]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Cost: &#x201C;Archiving 100 GB of old logs = $250/month saved&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Time: &#x201C;Adding indexes reclaims 40 engineering hours/quarter (5% of ops time)&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Risk: &#x201C;Fixing this security issue prevents 95% of common breach vectors in your industry&#x201D;")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.3 Focus Modes")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Users can request Dibs with three focus modes that weight insights differently:")
        ]
      }),

      // Focus modes table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3510, 3510],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Mode"})] })]
              }),
              new TableCell({
                borders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Focus"})] })]
              }),
              new TableCell({
                borders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Example Questions"})] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Security"})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Unencrypted PII, access controls, audit trails, compliance gaps")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Is our database GDPR-compliant? Who can access PII? Are we encrypting sensitive columns?")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Performance"})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Missing indexes, slow queries, table bloat, N+1 patterns, lock contention")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Which queries are slowest? Can we add indexes? Are we table-scanning? Why is CPU high?")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Balanced"})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Balanced view of all three; weighted equally by industry baseline")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("What should we prioritize? What do healthy competitors look like? Where do we deviate?")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { after: 240 }, children: [new TextRun("")] }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.4 Free vs Premium Gating")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("The free Dib is the conversion hook. It must deliver enough insight to prove value, but not so much that users feel they have everything.")
        ]
      }),

      // Free vs Premium table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3510, 3510],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Feature"})] })]
              }),
              new TableCell({
                borders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Free"})] })]
              }),
              new TableCell({
                borders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({bold: true, text: "Premium"})] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Dibs per month")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("1 initial Dib (then upgrade to unlock)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("4 Dibs (monthly refresh)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Focus mode")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Balanced only")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("All (Security, Performance, Balanced)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Insight depth")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Top 5&#x2013;10 insights (ballpark ROI)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("All insights (precise ROI, deep drills)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Benchmarking")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Generic industry baseline")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Peer benchmarking (vs similar DBs)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Refresh")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("One-time (TBD)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Refreshable monthly (TBD crediting)")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { after: 240 }, children: [new TextRun("")] }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({bold: true, text: "Key principle: "}) + new TextRun("The free Dib must show enough depth that a user thinks &#x201C;This is amazing; if I pay $30/month, I can run deep security audits or performance optimization queries.&#x201D; But it should NOT show so much that they think &#x201C;I got everything I need for free.&#x201D;")]
      }),

      // Page break
      new Paragraph({
        pageBreakBefore: true,
        children: [new TextRun("")]
      }),

      // Section 4: Insight Examples
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("4. Insight Examples by Database Type")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.1 Example: SaaS CRM Database")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("Detected schema: contacts, accounts, deals, interactions, notes, custom_fields")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Free Dib (Balanced mode):")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("&#x201C;Your CRM holds data on 47k contacts. Email addresses are readable by 5 app roles. GDPR requires explicit data access controls. Estimated effort: 1 day. Estimated risk reduction: 60%.&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("&#x201C;Deals table lacks an index on &#x2018;updated_at&#x2019;. Your most common reports scan 200k rows. Adding an index would speed reports by 85% and save ~8 hours/month of frustration.&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("&#x201C;You have 14 custom status fields across tables. Industry standard is 2&#x2013;3. This suggests complexity that might indicate feature bloat or incomplete data modeling.&#x201D;")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("&#x201C;Notes table has 2.4M rows and no retention policy. At your data growth rate, it will cost $400/month in storage by Q4. Archive plan: move notes >1 year old to cold storage, save $200/month.&#x201D;")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Premium Dib (Security focus):")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Complete PII inventory: 8 columns expose personal data (name, email, phone, SSN, drivers license, home address, bank account, credit card). Current encryption: None. Compliance gap: GDPR article 32. Remediation: Enable TDE + field-level encryption (3 days). Risk impact: Prevents 90% of credential theft attacks.")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Foreign key analysis: 6/8 tables missing FKs to parent entities. This allows orphaned records. Example: 300 deals with deleted accounts. Remediation: Add FKs with CASCADE delete (1 day). Data quality impact: Prevents 12M annual invalid state records.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Audit trail gaps: No created_by or updated_by fields. Cannot trace who created a high-value deal. Remediation: Add audit triggers (2 days). Compliance impact: Enables GDPR audit trails required for fintech/healthcare.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Premium Dib (Performance focus):")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Query analysis: Top 5 slow queries. 'Get deals by account_id' scans 200k rows, takes 3.2s, runs 50x/day. 40 wasted CPU-seconds/day. Fix: Add index on (account_id, deal_status, updated_at). Estimated savings: 10 hours/month in ops time, $2k/month in CPU.")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Table bloat: Contacts table is 8.2 GB with 700 MB of dead rows (deletions without VACUUM). Full table scans are 10% slower than ideal. Remediation: ANALYZE, VACUUM FULL (1 hour outage). Benefit: Reclaim 700 MB, improve scan performance 10%.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Lock contention: High UPDATE rates on &#x2018;deals&#x2019; during end-of-month surge. Peak lock wait: 2.3s. Remediation: Partition &#x2018;deals&#x2019; by month (1 week). Benefit: 90% reduction in lock contention, enable concurrent month-end closes.")]
      }),

      // Section 5: Implementation Roadmap
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("5. Implementation Roadmap")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.1 Phase 1: Classifier & Data Collection (Sprint 2)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Implement database type classifier (rule-based + ML signals)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Build schema introspection queries (tables, columns, FKs, indexes, constraints)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Implement data profiling (row counts, cardinality, NULL rates, string length distribution)")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Collect baseline performance metrics (slow query log analysis, table size, index usage)")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.2 Phase 2: Insight Engine (Sprint 3&#x2013;4)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Define insight templates for each database type")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Implement ROI calculation rules (cost savings, time savings, risk reduction)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Build focus mode filtering (Security / Performance / Balanced)")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Create HTML rendering for Dibs (interactive, filterable, printable)")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.3 Phase 3: Free vs Premium & Payment (Sprint 4+)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Implement Dib credit system (free = 1 initial, premium = 4/month)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Wire payment flow (Stripe integration for subscription purchase)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Add 'Request Premium Dib' button + upsell messaging")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("A/B test free Dib quality to find conversion-optimized content")]
      }),

      // Section 6: Success Metrics
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("6. Success Metrics")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("The enhanced Dib engine is successful if:")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({bold: true, text: "Free Dib > 40% conversion to premium: "}) + new TextRun("Users see enough value to justify $30/month")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({bold: true, text: "Average Dib generates $2k+ in estimated ROI: "}) + new TextRun("The insights are big enough to matter")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({bold: true, text: "Classifier accuracy > 90%: "}) + new TextRun("Database type detection is reliable")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({bold: true, text: "Dib generation time < 5 minutes: "}) + new TextRun("Fast enough for user to wait")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({bold: true, text: "NPS > 60 from free Dib users: "}) + new TextRun("High satisfaction and likelihood to recommend")]
      }),

      // Section 7: Conclusion
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("7. Conclusion")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("The Dib engine v2 transforms database introspection from exploratory to decisive. By classifying databases, understanding pain points, and delivering personalized, quantified insights, DataBreef creates a tool that database admins can&#x2019;t refuse.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("The free Dib is the conversion hook. It must deliver 40%+ conversion to premium to justify the development investment. This requires careful balance: enough depth to wow users, but not so much that they feel they have everything.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("The $30/month price point is justified by ROI. If a typical Dib identifies $2k+ in cost savings or risk reduction, users will subscribe. If it identifies only minor optimizations, they won&#x2019;t.")]
      }),
      new Paragraph({
        children: [new TextRun("This spec sets the bar. Every insight must answer the question: &#x201C;Is this worth $30/month?&#x201D;")]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/eager-laughing-euler/mnt/databreef.io/DataBreef-Dib-Engine-v2-Design.docx", buffer);
  console.log("✓ Document created: DataBreef-Dib-Engine-v2-Design.docx");
});
