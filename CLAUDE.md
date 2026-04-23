# DataBreef — Agent Guidelines

This file provides critical context and constraints for AI coding agents working on the DataBreef repository.

## 📏 Efficiency & Context Management

To ensure maximum efficiency and prevent rate limiting / context window bloat, follow these rules:

- **File Size Limit**: Keep source code files (`.ts`, `.tsx`, `.css`) under **300 lines** whenever possible.
- **Proactive Splitting**: If a file approaches or exceeds the 300-line threshold, refactor it by splitting logic into sub-components, helper utilities, or separate logic files.
- **Modular Architecture**: Prefer deep, nested directory structures (e.g., `components/features/auth/LoginForm/...`) over "junk drawer" files.

## 🛠 Technology Stack

- **Core**: Next.js 15 (App Router), Astro 5
- **Styling**: Vanilla CSS Modules (standard)
- **Database**: Drizzle ORM + Postgres.js
- **Auth**: Auth.js v5

## ⚓ The Reef Metaphor

DataBreef uses an oceanic metaphor for its UI and logic:
- **Reef**: A data source (Postgres database)
- **Anchor**: Connecting to a source
- **Dive**: Introspecting or querying
- **Surface**: Presenting insights
- **Dib**: Data Intelligence Brief (The core output)

## 🐳 Security First

- **Read-Only**: Every database adapter MUST enforce read-only transactions.
- **Encryption**: Connection strings MUST be encrypted with AES-256 before persistence.
- **Transparency**: Live audit logs MUST show the security enforcement commands to the user.
