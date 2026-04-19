# BudgetWise

> Personal Monthly Budget Management App

BudgetWise is a free, mobile-first personal finance app for individual users who want to take control of their monthly spending. It provides a clean, intuitive interface to log income and categorize expenses, with an intelligent notification system that builds financial awareness gradually — alerting users when they approach or exceed their budget and guiding them toward consistent saving habits.

**Platform:** iOS 16+ & Android 12+ · **Status:** Draft for Review · **Version:** 1.0

---

## Table of Contents

- [Overview](#overview)
- [Goals & Success Metrics](#goals--success-metrics)
- [User Personas](#user-personas)
- [Features](#features)
  - [User Accounts & Sync](#user-accounts--sync)
  - [Income Window](#income-window)
  - [Spending Window](#spending-window)
  - [Notification System](#notification-system)
- [Tech Stack](#tech-stack)
- [Release Milestones](#release-milestones)
- [Out of Scope (v1.0)](#out-of-scope-v10)

---

## Overview

| Field | Details |
|---|---|
| Product Name | BudgetWise |
| Category | Personal Finance / Budget Management |
| Target Users | Individual consumers aged 18+ managing personal monthly finances |
| Scope | Monthly income tracking + expense categorization with smart alerts |
| Platforms | iOS 16+ and Android 12+ |
| Monetization | Free — all core features available at no cost |

---

## Goals & Success Metrics

### Product Goals

- Help users understand where their money goes each month
- Alert users progressively when they are approaching or over budget in any category
- Guide users toward a savings mindset — making saving a visible, rewarding outcome
- Reduce friction in expense logging so users stay consistent day-to-day
- Ensure all core features are fully free — zero paywalls blocking essential budget visibility
- Provide actionable, category-level insights without requiring financial expertise

### Success Metrics (Month 6)

| Metric | Target |
|---|---|
| Monthly Active Users (MAU) | 50,000+ |
| Day-30 Retention Rate | >= 40% |
| Avg. expense entries per user/month | >= 15 entries |
| Notification open rate | >= 25% |
| Users who set a savings goal | >= 30% of MAU |
| Users who stay within budget 3+ months | >= 20% of MAU |
| App store rating | >= 4.5 stars |

---

## User Personas

**Linh, 24 — Fresh Graduate**
First salary, no budgeting experience. Spends impulsively on food delivery, entertainment, and flash sales. Wants to start saving but doesn't know where money goes.
Needs: Simple entry, visual clarity, gentle nudges.

**Minh, 30 — Mid-Level Professional**
Stable income, has financial goals (travel fund, emergency fund). Aware of budgeting but too busy to track consistently. Has tried spreadsheets and quit.
Needs: Monthly overview, category trends, smart summaries.

---

## Features

### User Accounts & Sync

- Email/password sign-up with optional Google or Apple ID (v1.1)
- **Guest mode:** full local feature access — no account required, no cloud sync
- Biometric login (Face ID / fingerprint) after first sign-in
- Cloud sync across up to 3 devices; offline-first with queued sync on reconnect
- Full data export as JSON or CSV
- GDPR-compliant account deletion — cloud data wiped within 30 days
- Security: TLS 1.3 in transit, AES-256 at rest, bcrypt passwords, suspicious login alerts
- Optional 2FA via authenticator app (v1.1)

### Income Window

- Log one or more monthly income sources (salary, freelance, side income)
- Multi-source income summed into a total monthly figure
- Income history chart (month-over-month)
- Real-time remaining balance: Income minus total spending
- Income locked after confirmation — requires intentional edit to change

### Spending Window

Six dedicated expense categories, each with its own logging flow and insights:

#### Entertainment
- Log outings with optional notes (venue, occasion)
- Auto-log recurring subscriptions (e.g., Spotify Premium)
- Quick-add shortcuts for frequent venues
- Monthly budget cap with alerts at 70%, 90%, and 100%
- Pie chart: hanging out vs. subscriptions vs. other

#### Food & Drinks
- Log meals by type: breakfast, lunch, dinner, snacks, beverages, coffee
- Delivery app tagging (Grab, ShopeeFood) for delivery vs. dine-in tracking
- Daily food spend summary in home widget
- Weekly trend: detects escalating food spend mid-month
- Smart flag if food spend exceeds 40% of income

#### Transportation
- Log ride-hailing (Grab, Be, Gojek), fuel, public transit, and parking
- Monthly budget with daily average calculator
- Commute pattern detection — suggests recurring entry for consistent daily commutes
- Fuel cost tracker (volume + price)

#### Shopping
- Dedicated category for e-commerce (Shopee, Lazada, TikTok Shop)
- Log by item type: clothing, electronics, household, beauty, flash sale
- Impulse purchase tagging: mark items as *impulse* vs. *planned* for self-awareness
- Month-over-month spend comparison surfaced automatically
- Gentle notification if 3+ purchases logged in one day
- Returns tracker: log refunds that subtract from monthly total

#### Bills & Payments
- Bill types: electricity, water, internet, phone, rent, building fees, and custom labels
- Credit card tracking with due-date reminders (5 days, 2 days, on due date)
- Due-date calendar: color-coded urgency (green > 7 days, orange 3–7 days, red < 3 days)
- Payment status: Paid / Unpaid / Partially Paid; overdue badge on home screen
- Bills auto-deducted from remaining budget once added
- Recurring bill auto-registration with confirm-or-edit flow each month
- Minimum payment warning for credit cards

#### Tax Obligations *(conditional — shown only for tax-flagged users)*
- Enabled via "Tax required" toggle in account profile
- Supports personal income tax (PIT), VAT, social insurance, and custom labels
- Income-based tax estimation using user-defined bracket (informational only)
- Tax set-aside tracker: reserve a monthly amount, visually deducted from available budget
- Tax payment due date reminders at 30 days, 7 days, and 1 day before deadline
- Tax payment history with date and reference number

> **Disclaimer:** BudgetWise provides estimates for budgeting awareness only. Consult a licensed tax professional for official tax advice.

---

### Notification System

Eight progressive notification tiers — always supportive, never shaming:

| Tier | Trigger | Tone |
|---|---|---|
| 1 — Friendly Check-in | Week 2 of month | Encouraging |
| 2 — Soft Nudge | 70% of category budget used | Informative |
| 3 — Budget Warning | 90% of category budget used | Cautionary |
| 4 — Out of Budget Alert | 100% of category budget reached | Urgent |
| 5 — Bill Due Reminder | 5 days, 2 days, and on due date | Actionable |
| 6 — Tax Due Reminder | 30 days, 7 days, 1 day before deadline | Actionable |
| 7 — Monthly Wrap + Savings | Last day of month | Reflective |
| 8 — Trend Alert | 3 months of category overspend | Advisory |

**Notification rules:**
- Max 3 push notifications per day (bill due reminders exempt from cap)
- Out-of-budget alerts (Tier 4) always delivered; can only be snoozed 24 hours
- Weekend notifications suppressed by default, except bill due reminders
- In-app notification center stores all alerts for users who prefer no push notifications

---

## Tech Stack

- **Framework:** React Native (shared iOS & Android codebase)
- **Minimum OS:** iOS 16+, Android 12+
- **Architecture:** Offline-first — all core features work without internet
- **Cloud Sync:** Firebase or Supabase (TBD)
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Auth:** bcrypt (min 12 rounds), session tokens expire after 30 days of inactivity

### Performance Targets

| Metric | Target |
|---|---|
| App launch to home screen | < 2 seconds on mid-range devices |
| Expense entry to confirmation | < 1 second |
| Monthly dashboard render | < 500ms with 12 months of history |

---

## Release Milestones

| Milestone | Target Date | Deliverables |
|---|---|---|
| M0 — Design Sprint | May 2026 | Wireframes, design system, user testing (10 participants) |
| M1 — MVP Build | July 2026 | F-01 to F-16: income, 6 categories, dashboard, alerts, accounts, cloud sync, guest mode |
| M2 — Beta Launch | August 2026 | TestFlight & Google Play internal beta; bug fixes, performance tuning |
| M3 — v1.0 Launch | September 2026 | Free public launch on App Store & Google Play (all P0 features) |
| M4 — v1.1 | November 2026 | Recurring bills, savings goal, trend alerts, Google/Apple sign-in, 2FA, tax estimation |
| M5 — v2.0 | Q1 2027 | CSV/PDF export, AI spending insights |

---

## Out of Scope (v1.0)

- Bank account integration or automatic transaction import
- Investment or stock portfolio tracking
- Multi-user or family budget sharing (planned for v2.0)
- Certified tax filing or official tax return preparation
- In-app bill payment processing
- Accountant or tax advisor marketplace

---

## UX Principles

| Principle | Description |
|---|---|
| Zero Friction Entry | Adding an expense takes fewer than 5 seconds. Default to today's date, last-used category, and smart number keyboard. |
| Show Don't Tell | Visual progress bars and color cues communicate budget status without requiring users to read numbers. |
| Gradual Awareness | Insights are surfaced progressively as the user builds comfort with their data. |
| Non-Judgmental Tone | All copy is supportive. No "overspent" or "failed" — instead: "You've reached your limit." |
| Monthly Mental Model | The entire app is anchored to the calendar month — the natural period most users think about money in. |
| Privacy First | All data stored locally by default. No account required for core features. Cloud sync is opt-in. |

---

*BudgetWise PRD v3 · April 2026*
