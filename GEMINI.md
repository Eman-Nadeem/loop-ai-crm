# LoopAI CRM — AI Agent Handoff Guide (GEMINI.md)

Welcome! This document provides context on the codebase, tech stack, and instructions for future AI models/agents to continue development from **Chunk 5** onwards.

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

---

## 2. Directory Structure

```
d:\loop-ai-crm/
├── TODO.md                 # Product roadmap detailing out-of-scope/future chunks
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
│   │   │       └── route.ts # AI assistant route handler
│   │   └── dashboard/
│   │       ├── layout.tsx  # Shared shell layout (handles responsive and conditional viewports)
│   │       ├── page.tsx    # Redirects /dashboard -> /dashboard/overview
│   │       ├── overview/
│   │       │   └── page.tsx # Overview Dashboard (Stat cards, inline widgets, Recent Clients)
│   │       ├── clients/
│   │       │   └── page.tsx # Client Directory (search, filter pills, grid)
│   │       ├── projects/
│   │       │   └── page.tsx # Projects page (3-column layout grid, search/filter pills)
│   │       ├── inbox/
│   │       │   └── page.tsx # Inbox page (Full-width edge-to-edge split-pane messaging UI)
│   │       └── analytics/
│   │           └── page.tsx # Analytics "Coming soon" placeholder
│   ├── components/
│   │   ├── clients/
│   │   │   └── client-card.tsx # Client profile cards (Framer Motion hovers)
│   │   ├── projects/
│   │   │   └── project-card.tsx # Project info card (uses extracted ProgressBar)
│   │   ├── dashboard/
│   │   │   └── top-nav.tsx     # Fully responsive navigation bar (hamburger menu on mobile)
│   │   ├── ui/
│   │   │   └── progress-bar.tsx # Reusable ProgressBar UI component
│   │   └── widgets/
│   │       ├── agreements-overview.tsx # Agreements progress bar (dynamic metrics)
│   │       ├── clients-source.tsx      # Proportional platform segmented bar (dynamic metrics)
│   │       ├── project-status-overview.tsx # Proportional projects status segmented bar
│   │       ├── unread-summary.tsx      # Inbox unread messages summary sidebar card
│   │       └── ai-assistant.tsx        # Interactive chat UI
│   └── lib/
│       ├── ai/
│       │   └── chat.ts                 # OpenRouter API client with dynamic system context
│       └── mock-data/
│           ├── clients.ts              # Typed client data loaders (extended with agreements and project stats)
│           ├── projects.ts             # Typed project data loaders (linked referentially to clients)
│           ├── messages.ts             # Typed messaging threads database loader
│           └── overview.ts             # Mock data aggregator for overview metrics
```

---

## 3. Core Features Implemented

### Chunk 1
1. **Clients Directory Page:** Responsive grid displaying client profiles matching the mockup. Supports real-time query search and platform-specific filtering ("Freelancer", "Fiverr", "Upwork").
2. **Interactive Cards:** Hovering on client cards triggers a spring-lift elevation and slides in message and bookmark action overlays.
3. **Agreements Overview Widget:** Hand-rolled progress bar displaying signed contracts vs negotiations.
4. **Clients Source Widget:** Proportional segment bar displaying leads distribution, paired with auto-generated optimization recommendations.
5. **AI Assistant Chat:** Interactive sidebar chat UI communicating with a Next.js API handler which appends CRM metadata to the system prompt.

### Chunk 2
1. **Dashboard Overview Page (`/dashboard/overview`)**: Built the main landing dashboard incorporating a top row of summary stat cards (Total Clients, Active Projects, Revenue Budget, and Signed Agreements), inline widgets, and a Recent Clients grid.
2. **Real Nav Wiring**: Connected all TopNav tabs to actual Next.js App Router paths with route-based active visual highlighting. Added a responsive hamburger drawer for mobile viewports.
3. **Full-Browser Layout & Shell Flexibility**: Refactored the dashboard shell to span edge-to-edge in the browser, showing global gradient background glows. Configured sidebar widgets to only render the AI Assistant on non-clients pages.
4. **Dynamic Data Aggregations**: Removed all hardcoded metrics by writing a calculator module `overview.ts` to compute metrics dynamically from `clients.ts` (keeping metrics consistent across pages).
5. **Layout Shift & Animation Fixes**: Prevented layout jumps on navigation by reserving scrollbar space (`scrollbar-gutter: stable`) and tab sizes (transparent borders). Replaced CSS Grid layout transitions with `layout="position"` to fix filtering lag.

### Chunk 3
1. **Projects Directory Page (`/dashboard/projects`)**: Fully functional projects filter page with query search and status pills (All / Active / Completed / On Hold).
2. **Project Cards Grid**: Rendered in a spacious 3-column layout on desktop to prevent cramping, styled with custom badges, deadlines, budgets, and client info (avatar, name, company).
3. **ProgressBar UI Extraction**: Built a reusable, customizable `ProgressBar` UI component, integrated directly into the project cards.
4. **Project Status Sidebar Widget**: Built a segmented proportional bar displaying Active, Completed, and On Hold project counts, generating dynamic follow-up guidelines when projects are on hold.

### Chunk 4
1. **Inbox Messaging Hub (`/dashboard/inbox`)**: A responsive two-pane messaging dashboard (conversations list on left, chat feed on right).
2. **Full-Width Edge-to-Edge Chat layout**: Conditionally collapsed the widgets sidebar and main padding (`p-0`) on the Inbox route to dock the messaging pane flush against the navigation bar, maximizing viewport usage.
3. **Normalized Messages Data Model**: Designed messages data normalized at the message-level with `read: boolean` flags and seeded 6 back-and-forth threads interlinked with existing client profiles.
4. **Mobile Responsive Viewports**: Toggles showing only the thread list or only the chat window (equipped with a `< Back` button in the header) on mobile viewports.
5. **Unread Badge & Dynamic Marking**: Selecting threads immediately marks their client messages as read, clearing unread indicator dots and updating unread state feeds in real-time.

---

## 4. Key Conventions & Rules for Future Agents

> [!WARNING]
> **Next.js 16 Deprecations & Conventions**
> - **Proxy Matcher (`src/proxy.ts`):** Next.js 16 deprecates the `middleware.ts` naming convention in favor of `proxy.ts`. Route protection rules should remain in `src/proxy.ts` and export the matching configuration.
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

### AI Integration Details
- **Free Auto-Routing:** The API client in [src/lib/ai/chat.ts](file:///d:/loop-ai-crm/src/lib/ai/chat.ts) uses `model: "openrouter/free"`. This dynamically maps to active free models on OpenRouter, avoiding rate limits or deprecation errors.
- **Payload Limits:** The payload includes `max_tokens: 1000` to prevent token budget conflicts on unpaid/free OpenRouter accounts.
- **Graceful Fallback:** If `OPENROUTER_API_KEY` is missing, the code automatically falls back to an intelligent response simulator that replies using the database client details.

---

## 5. Next Development Step (Chunk 5)

Refer to **[TODO.md](file:///d:/loop-ai-crm/TODO.md)** for details on the upcoming modules:
- Build out the Analytics Dashboard (`/dashboard/analytics`) using dynamic project/agreement charts.
- Implement the "Suggest Reply" AI assistant integration in the Inbox.
- Create client detail profiles under `/dashboard/clients/[id]`.
- Bind persistent database configurations (Supabase/PostgreSQL) and server CRUD actions.
