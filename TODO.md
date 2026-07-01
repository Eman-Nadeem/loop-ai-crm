# LoopAI CRM — Future Implementation Roadmap (TODO)

This file flags the out-of-scope features and pages for Chunk 1, serving as a roadmap for subsequent chunks.

## Out of Scope / Upcoming Chunks

### 1. Dashboard Pages
- **Overview Page (`/dashboard/overview`)**
  - High-level financial reporting, active projects status count, and team allocation details.
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
