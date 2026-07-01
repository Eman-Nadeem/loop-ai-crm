# LoopAI CRM — AI Agent Handoff Guide (GEMINI.md)

Welcome! This document provides context on the codebase, tech stack, and instructions for future AI models/agents to continue development from **Chunk 2** onwards.

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
│   │   ├── page.tsx        # Dashboard Landing/Splash page
│   │   ├── sign-in/        # Clerk standard login route
│   │   ├── sign-up/        # Clerk standard signup route
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts # AI assistant route handler
│   │   └── dashboard/
│   │       ├── layout.tsx  # Full-screen flat dashboard layout
│   │       └── clients/
│   │           └── page.tsx # Client Directory (search, filter pills, grid)
│   ├── components/
│   │   ├── clients/
│   │   │   └── client-card.tsx # Client profile cards (Framer Motion hovers)
│   │   ├── dashboard/
│   │   │   └── top-nav.tsx     # Full-width navigation bar
│   │   └── widgets/
│   │       ├── agreements-overview.tsx # Custom gradient contracts progress bar
│   │       ├── clients-source.tsx      # Proportional platform segmented bar
│   │       └── ai-assistant.tsx        # Interactive chat UI
│   └── lib/
│       ├── ai/
│       │   └── chat.ts                 # OpenRouter API client with mock fallback
│       └── mock-data/
│           └── clients.ts              # Typed client data loaders (12 records)
```

---

## 3. Core Features Implemented (Chunk 1)

1. **Clients Directory Page:** Responsive grid displaying client profiles matching the mockup. Supports real-time query search and platform-specific filtering ("Freelancer", "Fiverr", "Upwork").
2. **Interactive Cards:** Hovering on client cards triggers a spring-lift elevation and slides in message and bookmark action overlays.
3. **Agreements Overview Widget:** Hand-rolled visual progress bar displaying signed contracts vs negotiations, complete with directional markers and custom striped canvas backgrounds.
4. **Clients Source Widget:** Proportional segment bar displaying leads distribution, paired with auto-generated optimization recommendations.
5. **AI Assistant Chat:** An interactive sidebar chat UI. It communicates with a Next.js API handler which appends full CRM client metadata and metrics to the system prompt.

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

### AI Integration Details
- **Free Auto-Routing:** The API client in [src/lib/ai/chat.ts](file:///d:/loop-ai-crm/src/lib/ai/chat.ts) uses `model: "openrouter/free"`. This dynamically maps to active free models on OpenRouter, avoiding rate limits or deprecation errors.
- **Payload Limits:** The payload includes `max_tokens: 1000` to prevent token budget conflicts on unpaid/free OpenRouter accounts.
- **Graceful Fallback:** If `OPENROUTER_API_KEY` is missing, the code automatically falls back to an intelligent response simulator that replies using the database client details.

---

## 5. Next Development Step (Chunk 2)

Refer to **[TODO.md](file:///d:/loop-ai-crm/TODO.md)** for details on the upcoming modules:
- Create client detail profiles under `/dashboard/clients/[id]`.
- Implement server-side CRUD workflows and bind the application to a persistent database (Supabase/PostgreSQL).
- Scaffold the remaining navigation dashboards (Overview, Projects, Inbox, Analytics).
