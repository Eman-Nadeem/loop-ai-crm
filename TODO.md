# LoopAI CRM — Product Roadmap & Progress (TODO)

This file tracks the implemented features and flags out-of-scope work serving as a roadmap for subsequent chunks.

## Completed / Implemented

### Chunk 1: Client Directory & Setup
- **Clients Directory Page (`/dashboard/clients`)**: Search, platform filter pills, and responsive client card grid.
- **Interactive Card Hover States**: Spring-lift animation, overlay actions.
- **Agreements Overview Widget**: Custom progress bar representing contract phases.
- **Clients Source Widget**: Platform proportional segmentation bar and tips.
- **AI Relationship Assistant**: Clerk-protected sidebar chat UI connected to OpenRouter.

### Chunk 2: Dashboard Overview & Real Navigation (Current)
- **Dashboard Overview Landing Page (`/dashboard/overview`)**: High-level financial reporting (Total Clients, Active Projects, Revenue Budget, Signed Agreements), inline widgets integration, and Recent Clients listing.
- **Real Navigation Wiring**: Real App Router routes and active route state highlighting on the TopNav bar.
- **Dynamic Data Aggregation (`src/lib/mock-data/overview.ts`)**: Dynamically computes stats from the mock database, maintaining synchronization between pages.
- **Placeholder Dashboards**: Scaffolding for Projects, Inbox, and Analytics.
- **Performance Optimizations**: Smoothed grid filtering animations to eliminate Framer Motion lag.

---

## Out of Scope / Upcoming Chunks

### 1. Dashboard Pages Detail
- **Projects Page (`/dashboard/projects`)**
  - Deliverable timelines, interactive Kanban board/Gantt chart, and repository linkages.
- **Inbox Page (`/dashboard/inbox`)**
  - Integrated customer communications hub aggregating Upwork messages, Freelancer messages, and Fiverr inbox.
- **Analytics Page (`/dashboard/analytics`)**
  - Deep-dive charts tracking monthly revenue growth, client acquisition cost, and average contract lifecycle.

### 2. Client Interactions & Details
- **Client Detail View**
  - A dedicated view (`/dashboard/clients/[id]`) showing historical contracts, active deliverables, payment history, and communication logs.
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
