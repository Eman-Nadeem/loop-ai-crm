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

### Chunk 3: Projects Page & Shared UI UI Extras
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

### Chunk 5: Widescreen Analytics Dashboard (Current)
- **Performance Analytics Dashboard (`/dashboard/analytics`)**: Replaced placeholder with a dynamic, data-dense, full-width performance reporting interface.
- **Time-Series Mock Database (`src/lib/mock-data/analytics.ts`)**: Designed a 6-month historical monthly database (Jan - Jun 2026), dynamically deriving current month aggregates from clients/projects mock layers.
- **Dynamic Trend Indicators**: Stat cards calculate real growth trends comparing current and previous months (e.g. Revenue `+11.3%` and Projects `+25%`).
- **Interactive Recharts Graphs**:
  - Revenue vs Target Budget area chart.
  - Signed vs Negotiating contracts stacked area pipeline.
  - Platform Source stacked growth bar chart.
  - Projects status donut breakdown chart.
- **Full-Width Layout Refactor**: Configured the sidebar to collapse and main container to take up `lg:col-span-12` on the Analytics route.
- **Client-Side Mount Gates**: Set up standard hydration locks to guarantee absolute SSR compatibility.
- **Polished Landing Page**: Cleaned up dev markers and added all dashboard modules to the splash feature highlights list.

### Chunk 6: Client & Project Detail Views with Edit/Delete
- **Dynamic Navigation Wiring**: Wrapped directory card elements in route-highlighting Links pointing to their respect detail dynamic routes.
- **Unified Session Store (`src/lib/context/crm-context.tsx`)**: Lifted mock data collections into a shared React Context wrapper, enabling reactive session-based CRUD state propagation across all pages, metrics, and widgets.
- **Client Detail View (`/dashboard/clients/[id]`)**: Full-featured overview with platform badges, financial budget, dynamic deliverables lists, read-only communications previews, and edit/delete handlers.
- **Project Detail View (`/dashboard/projects/[id]`)**: Comprehensive detail view featuring progress bar tracking, deadlines, budgets, and clickable client owner reference link cards.
- **Custom Overlay Primitives**: Hand-rolled transition overlays (`Dialog` and `AlertDialog`) built with Framer Motion and Tailwind CSS v4 to keep forms and confirmation boxes lightweight and premium.
- **Toast Notifications**: Interactive slide-in notifications delivering toast signals for CRUD outcomes.

---

## Out of Scope / Upcoming Chunks

### 1. Interactive Extensions
- **Projects Interactive Expansion**
  - Interactive Kanban board toggle, Gantt chart timelines, and repository linkages.
- **AI Suggest-Reply Expansion**
  - Integrate a "Suggest Reply" hook in the Inbox chat pane that pulls current message history as system context to draft responses.

### 2. Client Interactions & Details
- **Add New Client Wizard**
  - A step-by-step form to onboard new clients, choose their primary source platform, input budgets, select sectors, and send initial agreement drafts.

### 3. Backend & Data Layer
- **Persistent Database Integration**
  - Set up Supabase PostgreSQL or SQLite with Drizzle/Prisma ORM.
  - Implement server actions for CRUD operations on clients, replacing `getClients()` in `src/lib/mock-data/clients.ts`.
- **Database Migrations & Seed Scripts**
  - Production database schema definition and testing seed datasets.

### 4. Advanced AI & Non-Free APIs
- **Real-Time Workspace Sync**
  - Let the AI Assistant inspect actual active deliverables and chats to answer complex questions (e.g. "What is the status of Daniel's wireframe deliverable?").
- **Alternative LLM Providers**
  - Integration with premium, non-free providers (e.g., OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Gemini Pro) with configurable temperature, cost-monitoring, and custom system-instruction toggles.
