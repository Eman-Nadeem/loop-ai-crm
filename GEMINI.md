# LoopAI CRM — AI Agent Handoff Guide (GEMINI.md)

Welcome! This document provides context on the codebase, tech stack, and instructions for future AI models/agents to continue development from **Chunk 8** onwards.

---

## 1. Project Overview & Architecture

**LoopAI CRM** is a next-generation client dashboard and relationship intelligence platform built for freelancers and design agencies. It aggregates client metadata across Upwork, Freelancer, and Fiverr, showing status reports, agreements progress, and featuring an AI relationship coach.

### Technology Stack
- **Framework:** Next.js 16.2.9 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (incorporating modern class conventions)
- **Animations:** Framer Motion (hover transitions, card elevations, state reveals)
- **Authentication:** Clerk (`@clerk/nextjs` v5+) with B2B Multi-Tenant Organizations enabled
- **AI Integrations:** OpenRouter API (configured via Next.js server route handlers)
- **Database:** Supabase PostgreSQL via Drizzle ORM (`drizzle-orm` + `postgres` driver)

---

## 2. Directory Structure

```
d:\loop-ai-crm/
├── .env.local.example      # Safe env template committed to git (copy to .env.local)
├── TODO.md                 # Product roadmap detailing completed and upcoming chunks
├── drizzle.config.ts       # Drizzle Kit migration configuration
├── next.config.ts          # Next.js configurations (includes Unsplash image rules)
├── src/
│   ├── proxy.ts            # Clerk route protection (Next 16 Proxy convention)
│   ├── app/
│   │   ├── layout.tsx      # App wrapper (Inter font, ClerkProvider, global styles)
│   │   ├── page.tsx        # Landing/Splash page with Enter CRM CTA
│   │   ├── sign-in/        # Clerk standard login route
│   │   ├── sign-up/        # Clerk standard signup route
│   │   ├── api/
│   │   │   └── chat/
│   │   │       ├── route.ts              # AI assistant route handler
│   │   │       └── suggest-reply/
│   │   │           └── route.ts          # AI Suggest-Reply draft route handler
│   │   └── dashboard/
│   │       ├── layout.tsx  # Shared shell layout (handles responsive and conditional viewports)
│   │       ├── page.tsx    # Redirects /dashboard -> /dashboard/overview
│   │       ├── overview/
│   │       │   └── page.tsx # Overview Dashboard (Stat cards, inline widgets, Recent Clients)
│   │       ├── clients/
│   │       │   ├── page.tsx # Client Directory (search, filter pills, grid, add client dialog)
│   │       │   └── [id]/
│   │       │       └── page.tsx # Client Detail Page (Linked projects, messages preview, edit/delete)
│   │       ├── projects/
│   │       │   ├── page.tsx # Projects page (3-column grid, search/filter pills, add project dialog)
│   │       │   └── [id]/
│   │       │       └── page.tsx # Project Detail Page (ProgressBar, dates, client owner card, edit/delete)
│   │       ├── inbox/
│   │       │   └── page.tsx # Inbox (edge-to-edge split-pane, AI Suggest-Reply, read tracking)
│   │       └── analytics/
│   │           └── page.tsx # Analytics Dashboard (Recharts time-series charts)
│   ├── components/
│   │   ├── clients/
│   │   │   └── client-card.tsx # Client profile cards (clickable, routes to detail)
│   │   ├── projects/
│   │   │   └── project-card.tsx # Project info card (uses ProgressBar, condensed layout support)
│   │   ├── dashboard/
│   │   │   └── top-nav.tsx     # Fully responsive navigation bar (hamburger menu on mobile)
│   │   ├── ui/
│   │   │   ├── progress-bar.tsx # Reusable ProgressBar UI component
│   │   │   ├── dialog.tsx      # Custom transition modal overlay (Framer Motion)
│   │   │   └── alert-dialog.tsx # Custom warning confirmation overlay (Framer Motion)
│   │   └── widgets/
│   │       ├── agreements-overview.tsx     # Agreements progress bar (reads from Context)
│   │       ├── clients-source.tsx          # Proportional platform segmented bar (reads from Context)
│   │       ├── project-status-overview.tsx # Projects status segmented bar (reads from Context)
│   │       ├── unread-summary.tsx          # Inbox unread messages summary card (reads from Context)
│   │       └── ai-assistant.tsx            # Interactive sidebar chat UI
│   └── lib/
│       ├── actions/
│       │   └── crm-actions.ts          # Next.js Server Actions for all DB CRUD operations
│       ├── context/
│       │   └── crm-context.tsx         # Unified session state store provider & Toast portal
│       ├── db/
│       │   ├── index.ts                # Drizzle ORM client (postgres-js, prepare: false)
│       │   ├── schema.ts               # PostgreSQL table definitions (clients, projects, messages)
│       │   └── seed.ts                 # Standalone seeder script (tsx src/lib/db/seed.ts)
│       ├── ai/
│       │   ├── chat.ts                 # OpenRouter client: callLLM + callLLMForReply helpers
│       └── mock-data/
│           ├── clients.ts              # Typed client data (fallback + seed source)
│           ├── projects.ts             # Typed project data (fallback + seed source)
│           ├── messages.ts             # Typed messaging threads (fallback + seed source)
│           └── overview.ts             # Mock data aggregator for overview metrics
```

---

## 3. Core Features Implemented

### Chunk 1
1. **Clients Directory Page:** Responsive grid with real-time search and platform filtering.
2. **Interactive Cards:** Spring-lift hover elevation and message/bookmark overlay actions.
3. **Agreements Overview Widget:** Progress bar for signed vs negotiating contracts.
4. **Clients Source Widget:** Proportional segment bar for lead platform distribution.
5. **AI Assistant Chat:** Sidebar chat UI backed by OpenRouter via Next.js API handler.

### Chunk 2
1. **Dashboard Overview Page (`/dashboard/overview`)**: Stat cards, inline widgets, Recent Clients grid.
2. **Real Nav Wiring**: App Router paths with active highlighting; responsive hamburger drawer.
3. **Full-Browser Layout**: Edge-to-edge shell with gradient glows; widgets collapse on non-client pages.
4. **Dynamic Data Aggregations**: `overview.ts` calculator module keeps metrics consistent.
5. **Layout Shift & Animation Fixes**: `scrollbar-gutter: stable`, `layout="position"` transition fix.

### Chunk 3
1. **Projects Directory Page (`/dashboard/projects`)**: Query search + status pills (All / Active / Completed / On Hold).
2. **Project Cards Grid**: 3-column desktop layout with badges, deadlines, budgets, client info.
3. **ProgressBar UI Extraction**: Reusable `ProgressBar` component integrated into project cards.
4. **Project Status Sidebar Widget**: Segmented proportional bar with dynamic follow-up guidelines.

### Chunk 4
1. **Inbox Messaging Hub (`/dashboard/inbox`)**: Two-pane messaging UI (thread list + chat feed).
2. **Edge-to-Edge Chat Layout**: `p-0` and full-width on inbox route for maximum viewport usage.
3. **Normalized Messages Data Model**: Message-level `read: boolean` flags; 6 seeded threads.
4. **Mobile Responsive Viewports**: Thread-list / chat-view toggle with `< Back` header button.
5. **Unread Badge & Dynamic Marking**: Real-time read state clearing on thread selection.

### Chunk 5
1. **Analytics Dashboard (`/dashboard/analytics`)**: Full-width Recharts performance interface.
2. **Growth Metrics & Time-Series Data**: 6-month historical datasets with month-over-month trends.
3. **Interactive Charts**: Area, stacked Bar, and Status donut charts for revenue, pipeline, and channels.

### Chunk 6
1. **Dynamic Navigation**: Client and Project cards route to `[id]` detail pages.
2. **Client & Project Detail Views**: Financial portfolios, milestone bars, message previews, cross-links.
3. **Unified CRM Context Provider**: Single state store for session-wide CRUD across all pages.
4. **Custom Framer Motion Overlays**: `Dialog` and `AlertDialog` for edits and delete confirmations.
5. **Toast Alerts**: Slide-in notifications for success/info CRUD outcomes.

### Chunk 7
1. **Add Client Form Dialog**: 8-field creation form (name, role, company, sector, platform, budget, agreement, date). Auto-assigns Unsplash portrait. Creates empty inbox thread immediately.
2. **Add Project Form Dialog**: 6-field creation form with dynamic Client Owner dropdown from context state, progress slider, and status selector. Increments client's active project count on creation.
3. **Supabase PostgreSQL + Drizzle ORM**: Relational schema (`clients`, `projects`, `messages` with cascade FK). `npm run db:push` deploys schema; `npm run db:seed` loads mock data.
4. **Server Actions (`crm-actions.ts`)**: All CRUD operations run as `"use server"` functions — no API routes needed for DB writes.
5. **Resilient Context Fallback**: If `DATABASE_URL` is absent or unreachable, context falls back to in-memory mock arrays — app stays fully functional.
6. **AI Suggest-Reply**: `/api/chat/suggest-reply` route + `callLLMForReply()` helper drafts contextual replies from client profile + thread history, loaded directly into the chat input box. Keyword mock fallback when API key is absent.
7. **Environment Template**: `.env.local.example` committed to git with blank placeholders; `.env.local` is gitignored.

### Chunk 8
1. **Projects View Switcher:** Segmented toggles to display projects in Grid, Kanban board, or Gantt timeline.
2. **Kanban Board View:** Three-column layout (**On Hold**, **Active**, and **Completed**) with drag-and-drop operations powered by `@dnd-kit/core`. On drop, calls `updateProject` to update Supabase.
   - Cards are highly compact, showing only the project name and the status-matching progress bar.
   - Completed cards are locked in place (`disabled: true` draggable) and dragging to Completed sets progress to 100%.
   - Column lists hide scrollbars using custom `.scrollbar-none` classes.
3. **Custom Gantt Timeline:** Built using native CSS Grid showing start dates and deadlines. Bars are color-coded and use rectangular shapes (`rounded-none`).
   - Gantt bars support drag-to-resize on the right edge via pointer handlers, with a real-time floating date tooltip preview.
   - Unsaved deadline modifications render a floating "Save Deadlines" action banner fixed at the bottom-right viewport position, styled like a toast.
   - Configured background lines at both month starts and month ends (`border-l last:border-r` with `z-0`).
   - Sticky deliverables left column collapses under `1024px` (`lg` breakpoint), has width reduced to `w-56`, and hovering truncated names expands an absolute z-indexed card overlay detailing project and client owner details.
4. **Widescreen Projects Grid:** Displays 4 project cards per row on larger desktop viewports (`xl:grid-cols-4`).
5. **Clearable Budget Numeric Fields:** Corrected React state and input `onChange` handlers on all project/client creation forms and detail edit dialogs, allowing budget inputs to be cleared and typed freely without reset locks.

### Chunk 9
1. **Gmail OAuth & Sync Integration:** Connected the CRM Inbox to real Gmail API (read-only) for incoming/outgoing client messages.
2. **Schema & Seed Migrations:** Altered `clients` with `email`, added `gmailMessageId` and `subject` to `messages`, and created `user_oauth_tokens` table. Seeded mock data with distinct client emails.
3. **Encryption at Rest:** Implemented AES-256-CBC encryption using native Node `crypto` to store user refresh tokens securely in `user_oauth_tokens` table. Scoped per Clerk `userId` for data privacy.
4. **Redirection Compose Deep Links:** Custom sending flow constructs pre-filled `https://mail.google.com/mail/` compose tab deep links containing the AI-suggested draft, recipient, and subject, letting the user verify and send from their native Gmail tab. Always opens deep links regardless of authentication connection, using local mock data fallback when disconnected.
5. **Inbox Sync UI:** Created frosted-glass connection CTA empty state panels and left sidebar toolbar actions (Sync / Disconnect) using Clerk-resolved user contexts.
6. **Full-Width Inbox Sub-paths Layout:** Configured the dashboard layout to resolve inbox sub-paths (individual thread and email views) as `isInboxPage`, spanning the entire viewport (`lg:col-span-12`, `p-0`) and hiding the AI Assistant sidebar.
7. **Dynamic Route Catch-All & Flat List Redesign:** Refactored dynamic paths using catch-all route `/dashboard/inbox/[[...slug]]`:
   - **Right Panel (Default List):** Renders a clean list of the selected client's emails (received `↙` vs. sent `↗` arrows, subject line, text preview, timestamp, and unread dots). Clicking an email opens the card in the Viewer.
   - **Email Viewer state (`[clientId]/[emailId]`):** Standalone email reader detailing sender/receiver metadata, full message body, mock paperclip attachment cards, and a reply box with AI suggestions triggers (hidden for outgoing sent emails).
   - **Infinite Render Loop Fix:** Added an unread check to `useEffect` trigger before invoking `markThreadAsRead` context state changes, breaking recursive rendering loops.

---

## 4. Key Conventions & Rules for Future Agents

> [!IMPORTANT]
> **Google OAuth Configuration (Gmail read-only)**
> - **OAuth Console Settings:** The Google Cloud Project OAuth consent screen MUST remain in **Testing mode** (not Published) with developer accounts registered as test users. This bypasses CASA verification / security audits for personal use/demos.
> - **Requested Scope:** Request ONLY `https://www.googleapis.com/auth/gmail.readonly` to pull and match inbox/outbox history. Never request write permissions (`gmail.send` or `gmail.modify`) as compose deep links are used to draft.
> - **Redirect URI:** Match the registered console URI exactly: `http://localhost:3000/api/auth/google/callback`.
> - **Refresh Tokens:** Refresh tokens must be encrypted with `OAUTH_ENCRYPTION_KEY` (AES-256-CBC) before writing to `user_oauth_tokens`. Never log plain tokens or email bodies to server outputs.

> [!WARNING]
> **Next.js 16 Deprecations & Conventions**
> - **Proxy Matcher (`src/proxy.ts`):** Next.js 16 deprecates the `middleware.ts` convention in favor of `proxy.ts`. Route protection rules should remain in `src/proxy.ts` and export the matching configuration.
> - **Clerk `<UserButton />`:** In Clerk v5+, `afterSignOutUrl` is deprecated on the React components. Omit this prop; Clerk handles redirect rules directly from environment variables.

> [!IMPORTANT]
> **Tailwind CSS v4 Class Names**
> Ensure any new UI additions use Tailwind v4 standards:
> - Use `bg-linear-to-r` or `bg-linear-to-tr` instead of `bg-gradient-to-*` gradients.
> - Use `shrink-0` instead of `flex-shrink-0`.
> - Use `rounded-4xl` instead of custom Arbitrary values like `rounded-[2rem]`.
> - Use `-ml-px` instead of `-ml-[1px]`, and `mt-[-4px]` instead of `-mt-[4px]`.

> [!IMPORTANT]
> **Responsive-First Design Requirements**
> Ensure all new pages, layouts, and components are fully responsive across all breakpoints (mobile, tablet, desktop):
> - Avoid hardcoded fixed-width elements (e.g., `w-[400px]`) that can clip or cause horizontal overflow on mobile.
> - Utilize Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) to structure grids and flex containers adaptively.
> - Nav bars, filters, and action buttons rows must wrap (`flex-wrap`) or support horizontal scrolling (`overflow-x-auto`) to fit small viewports.

> [!IMPORTANT]
> **Database Client (Drizzle + Supabase Pooler)**
> - The `postgres` client in `src/lib/db/index.ts` uses `{ prepare: false }` — required for Supabase transaction pooler (port 6543). Do not remove this option.
> - `drizzle.config.ts` calls `loadEnvConfig(process.cwd())` from `@next/env` so drizzle-kit can read `.env.local` at migration time.
> - The seed script (`seed.ts`) uses dynamic imports (`await import(...)`) after calling `loadEnvConfig` to guarantee env vars are resolved before the DB client initializes.

### AI Integration Details
- **Free Auto-Routing:** `src/lib/ai/chat.ts` uses `model: "openrouter/free"` — dynamically routes to active free OpenRouter models.
- **Payload Limits:** `max_tokens: 1000` (general chat) and `max_tokens: 500` (suggest-reply) prevent token budget issues on free accounts.
- **Graceful Fallback:** Both `callLLM` and `callLLMForReply` detect a missing/placeholder API key and return keyword-matched mock responses so the UI stays functional without a real key.

---

## 5. Database Quick Reference

```bash
# Push schema changes to Supabase
npm run db:push

# Seed tables with mock data (clears existing rows first)
npm run db:seed
```

Schema location: `src/lib/db/schema.ts`  
Server Actions: `src/lib/actions/crm-actions.ts`  
Context (state + DB sync): `src/lib/context/crm-context.tsx`

---

## 6. Next Development Step (Chunk 9)

Refer to **[TODO.md](file:///d:/loop-ai-crm/TODO.md)** for the upcoming modules:
- **Real-Time Workspace Sync**: Connect the AI Assistant to live DB queries so it can answer questions about specific client deliverables.
- **Production Hardening**: RLS policies, Clerk Org-scoped data, Supabase Realtime subscriptions.

