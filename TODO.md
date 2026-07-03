# LoopAI CRM — Product Roadmap & Progress (TODO)

This file tracks the implemented features and flags out-of-scope work serving as a roadmap for subsequent chunks.

## Completed / Implemented

### Chunk 1: Client Directory & Setup
- **Clients Directory Page (`/dashboard/clients`)**: Search, platform filter pills, and responsive client card grid.
- **Interactive Card Hover States**: Spring-lift animation, overlay actions.
- **Agreements Overview Widget**: Custom progress bar representing contract phases.
- **Clients Source Widget**: Platform proportional segmentation bar and tips.
- **AI Relationship Assistant**: Clerk-protected sidebar chat UI connected to OpenRouter.

### Chunk 2: Dashboard Overview & Real Navigation
- **Dashboard Overview Landing Page (`/dashboard/overview`)**: High-level financial reporting (Total Clients, Active Projects, Revenue Budget, Signed Agreements), inline widgets integration, and Recent Clients listing.
- **Real Navigation Wiring**: Real App Router routes and active route state highlighting on the TopNav bar.
- **Dynamic Data Aggregation (`src/lib/mock-data/overview.ts`)**: Dynamically computes stats from the mock database, maintaining synchronization between pages.
- **Placeholder Dashboards**: Scaffolding for Projects, Inbox, and Analytics.
- **Performance Optimizations**: Smoothed grid filtering animations to eliminate Framer Motion lag.

### Chunk 3: Projects Page & Shared UI Extras
- **Projects Directory Page (`/dashboard/projects`)**: Responsive grid displaying projects, search query filters, and status pills (All, Active, Completed, On Hold).
- **Referential Projects Database (`src/lib/mock-data/projects.ts`)**: Interlocked project records connected to existing client avatars, names, and organizations.
- **Project Card UI Component (`src/components/projects/project-card.tsx`)**: Reusable project cards displaying names, progress values, budgets, deadlines, and status badges.
- **Reusable Progress Bar (`src/components/ui/progress-bar.tsx`)**: Extracted component for multi-view progress representation.
- **Project Status Overview Widget (`src/components/widgets/project-status-overview.tsx`)**: Dynamic segmented ratios bar displaying status aggregates and context-aware client follow-up suggestions in the sidebar.

### Chunk 4: Inbox Hub & Unified Messaging
- **Inbox Messaging Hub (`/dashboard/inbox`)**: Responsive split-pane email/chat layout featuring a searchable left thread list and scroll-to-bottom right message feed (sent vs. received colored bubbles).
- **Mock Messages Database (`src/lib/mock-data/messages.ts`)**: Seeded conversation histories interlinked with client profiles, tracking read/unread flags per message.
- **Unread Status Sidebar Widget (`src/components/widgets/unread-summary.tsx`)**: Displays pending unread client messages count, and snippets in the sidebar.
- **Dynamic State Actions**: Toggling active threads automatically updates read states. Local message inputs push new messages straight to the active feed in real-time.
- **Responsive Viewport Toggles**: Implemented mobile active state switching with header back buttons to prevent column squishing.

### Chunk 5: Widescreen Analytics Dashboard
- **Performance Analytics Dashboard (`/dashboard/analytics`)**: Replaced placeholder with a dynamic, data-dense, full-width performance reporting interface.
- **Time-Series Mock Database (`src/lib/mock-data/analytics.ts`)**: Designed a 6-month historical monthly database (Jan - Jun 2026), dynamically deriving current month aggregates from clients/projects mock layers.
- **Dynamic Trend Indicators**: Stat cards calculate real growth trends comparing current and previous months (e.g. Revenue `+11.3%` and Projects `+25%`).
- **Interactive Recharts Graphs**: Revenue vs Target area chart, Signed vs Negotiating stacked pipeline, Platform Source growth bars, Projects status donut breakdown.
- **Full-Width Layout Refactor**: Configured the sidebar to collapse and main container to take up `lg:col-span-12` on the Analytics route.

### Chunk 6: Client & Project Detail Views with Edit/Delete
- **Dynamic Navigation Wiring**: Wrapped directory card elements in route-highlighting Links pointing to their respective dynamic detail routes.
- **Unified Session Store (`src/lib/context/crm-context.tsx`)**: Lifted mock data collections into a shared React Context wrapper, enabling reactive session-based CRUD state propagation across all pages, metrics, and widgets.
- **Client Detail View (`/dashboard/clients/[id]`)**: Full-featured overview with platform badges, financial budget, dynamic deliverables lists, read-only communications previews, and edit/delete handlers.
- **Project Detail View (`/dashboard/projects/[id]`)**: Comprehensive detail view featuring progress bar tracking, deadlines, budgets, and clickable client owner reference link cards.
- **Custom Overlay Primitives**: Hand-rolled transition overlays (`Dialog` and `AlertDialog`) built with Framer Motion and Tailwind CSS v4 to keep forms and confirmation boxes lightweight and premium.
- **Toast Notifications**: Interactive slide-in notifications delivering toast signals for CRUD outcomes.

### Chunk 7: Add Client/Project, Database Persistence & AI Suggest-Reply
- **Add New Client Dialog (`/dashboard/clients`)**: Full creation form (name, role, company, sector, platform, budget, agreement status, client-since date) mounted on the "Add new Client" button using the custom `Dialog` overlay. Auto-assigns a portrait from a preset Unsplash avatar pool.
- **Add New Project Dialog (`/dashboard/projects`)**: Full creation form with a dynamic Client Owner dropdown sourced from context, status, budget, dates, and progress slider. Validates that at least one client exists before enabling submission.
- **Supabase PostgreSQL Integration (Drizzle ORM)**: Configured Drizzle ORM with a PostgreSQL schema (`clients`, `projects`, `messages` tables with cascade deletes). Added `drizzle.config.ts`, `db:push`, and `db:seed` npm scripts.
- **Server Actions CRUD Layer (`src/lib/actions/crm-actions.ts`)**: All create/update/delete operations call Next.js Server Actions that write directly to Supabase. Reads are resolved on mount via `fetchCRMState()`.
- **Resilient Context Fallback**: If `DATABASE_URL` is not set, the app silently falls back to the in-memory mock session store — no crashes.
- **AI Suggest-Reply in Inbox**: Clicking "Suggest Reply" in the Inbox chat pane calls `/api/chat/suggest-reply`, which builds a context-aware system prompt (client profile + last N messages) and loads the LLM draft directly into the message input for review before sending. Falls back to keyword-matched mock drafts if OpenRouter key is missing.
- **Environment Template (`.env.local.example`)**: Safe placeholder env file committed to GitHub; `.env.local` is blocked in `.gitignore`.

### Chunk 8: Projects Kanban & Gantt Views
- **View Switcher:** Added a segmented button group at the top of the Projects page to switch between Grid, Kanban, and Gantt views.
- **Kanban Board View:** Designed a three-column drag-and-drop board (**On Hold**, **Active**, and **Completed**) using `@dnd-kit/core`.
  - Redesigned Kanban cards to be super compact, rendering only the project name and the status-matching progress bar.
  - Locked completed project cards by setting `disabled: true` on the draggable hook. Dragging a project to Completed automatically marks its progress as 100% and triggers a success Toast.
  - Hidden scrollbars while maintaining column list scrollability.
- **Custom Gantt Timeline:** Built a custom CSS Grid-based horizontal project timeline displaying start dates and deadlines, color-coded by status.
  - Added an interactive Pointer resize handle on the right edge of each project bar. Resizing modifies deadlines dynamically on drag, displaying a real-time dark date tooltip.
  - Introduced a floating "Save Deadlines" action banner fixed at the bottom-right viewport position, styled exactly like a toast notification.
  - Set timeline bars to use rectangular shapes (`rounded-none`) to align with grid lines.
  - Configured background lines at both month starts and month ends using `border-l last:border-r` with visible `z-0` rendering behind timeline rows.
  - Modified responsiveness: on viewports smaller than 1024px (`lg` breakpoint), the sticky left deliverables list is hidden to make room, showing only the horizontally scrollable timeline.
  - Reduced the sticky left deliverables column width from `w-72` to `w-56` (224px).
  - Added an absolute z-indexed hover overlay card that expands to reveal the full project name and its client owner details over the timeline, preventing any deliverables layout shifting.
- **Widescreen Projects Grid:** Updated the project directory grid view to display 4 project cards per row on larger desktop widths (`xl:grid-cols-4`).
- **Numeric Fields Cleared Typing Fix:** Fixed input locks on budget numeric fields across both creation forms and edit dialogs on the project and client detail pages, allowing the fields to be cleared and typed freely.

### Chunk 9: Real Gmail Integration for Inbox
- **Database Schema Updates:** Added `email` to `clients` table, `gmailMessageId` and `subject` to `messages` table, and created the `user_oauth_tokens` database table.
- **Client Onboarding Email Field:** Added mandatory `email` inputs in Add Client and Edit Client dialog forms.
- **Google OAuth Consent Flow:** Built `/api/auth/google` and `/api/auth/google/callback` endpoints to securely request the read-only `gmail.readonly` scope, keeping it in Testing mode for personal use.
- **Secure Token Encryption:** Implemented an AES-256-CBC encryption utility (`src/lib/utils/encryption.ts`) to store Google refresh tokens securely at rest, matching them per-user (Clerk `userId`).
- **Gmail Sync Engine:** Implemented background token rotation and Gmail API sync engine that decodes Base64Url MIME contents, matches incoming/outgoing emails to clients by email, and caches them in the local database.
- **Gmail Compose Deep Links:** Replaced local message send action with dynamic Gmail deep link redirection, allowing users to review and send AI-suggested draft replies from their native Gmail compose window in a new tab. Corrected the behavior to always open the deep link compose tab regardless of whether OAuth token connection is active, with fallback local message logging if disconnected.
- **Full-Width Inbox Sub-paths Layout:** Resolved layout constraints so that visiting individual inbox threads or messages hide the sidebar (AI Assistant) and span the entire window (`lg:col-span-12`, `p-0`), matching the root inbox route layout.
- **Inbox Sync UI:** Created frosted-glass connection CTA empty state panels and left sidebar toolbar actions (Sync / Disconnect) using Clerk-resolved user contexts.
- **Dynamic Inbox Routing & Flat List Redesign:** Refactored the Inbox interface into an App Router catch-all dynamic path `/dashboard/inbox/[[...slug]]`:
  - **Right Panel (Default):** Displays a flat chronological list of that client's emails with received (↙) vs. sent (↗) direction arrows, subject lines, text previews, timestamps, and unread dots.
  - **Email Viewer Route:** Dynamic subpath `/dashboard/inbox/[clientId]/[emailId]` opens the email detail page with a `< Back` button, full email body, paperclip attachment indicator, and a context-aware AI Draft suggestions composer box (hidden for sent outgoing messages).
  - **Infinite Render Loop Fix:** Patched a React update depth error by ensuring `markThreadAsRead` is only invoked when unread client messages are actively present.
### Chunk 10: Real-Time AI Workspace Sync
- **Dedicated AI Page (`/dashboard/ai`)**: Added a premium dedicated page for AI interaction, replacing the platform badges shortcut on the top navigation bar with a direct "AI Copilot" button.
- **Sidebars & Widgets Cleanup**: Removed sidebar instances of `AIAssistant`, `AgreementsOverview`, `ClientsSource`, and `ProjectStatusOverview` from Overview, Clients, and Projects directory subpages, resizing main content areas to full-width viewport grids.
- **Workspace Context Assembler (`src/lib/ai/workspace-context.ts`)**: Built a deterministic queries assembler resolving current clients, projects, unread messages, and budgets, with resilient mock data fallbacks if the Postgres URL is unreachable.
- **Intent-Based Keyword Routing**: Programmed logic classifying user queries for overdue projects, unread mail threads, active budgets, or specific client/company names to retrieve only matching database rows.
- **Grounding Badges**: Added a visual check indicator `"Based on your live workspace data"` beneath assistant messages that fetched database context.
- **Suggested Chips**: Rendered 3 preset question chips ("Which projects are overdue?", "Do I have unread emails?", "What is my total active budget?") to guide users on grounded search capabilities.
- **Resilient Fallback Mode**: If `OPENROUTER_API_KEY` is absent, the assistant compiles and formats the raw database context table beautifully in the chat feed instead of returning generic text.

### Chunk 11: Responsiveness Polish & Layout Gaps
- **Responsive Header Breakpoint Shift**: Adjusted the `TopNav` desktop layout visibility and mobile drawer toggles from `md` (768px) to `lg` (1024px) to prevent element overflow and horizontal scroll layout shifts on tablet devices.
- **Scrollbar Gutter Gap Eliminated**: Removed `scrollbar-gutter: stable` and hid root page scrollbars (`scrollbar-width: none` / Webkit scrollbar hidden styling) to remove the default Windows gray track scrollbar layout space and allow headers to span the full viewport width cleanly.
- **Responsive Metadata Grids**: Converted layout columns on client and project detail views to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, resolving mobile text layout clipping.
- **Proportional Directory Grids**: Updated page directories to use `lg:grid-cols-3` instead of keeping 2 columns from `md` up to `xl` to balance white space on large monitors.

---

## Out of Scope / Upcoming Chunks

### 1. Advanced AI & Workspace Intelligence
- **Alternative LLM Providers**
  - Integration with premium models (e.g., OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Gemini Pro) with configurable parameter controls.

### 2. Production Hardening
- **Row-Level Security (RLS)**: Define Supabase RLS policies to scope data access per authenticated user/organization. *CRITICAL: This is now highly urgent since Chunk 10 introduces the Real-Time AI Workspace Sync, which queries and summarizes potentially sensitive organization data across the entire database.*
- **Multi-Tenant Org Support**: Bind clients and projects to Clerk Organization IDs so each organization sees only its own data.
- **Real-Time Subscriptions**: Use Supabase Realtime channels to push live updates across browser tabs without polling.

