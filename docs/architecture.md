# Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Azure Static Web Apps                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React + Tailwind CSS (Vite)                              │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │  │
│  │  │ Landing Page │  │  Chat Window │  │ Guided Flow UI │   │  │
│  │  │ (Login)      │  │  (Free-form) │  │ (Step-by-step) │   │  │
│  │  └─────────────┘  └──────────────┘  └────────────────┘   │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌──────────────┐                       │  │
│  │  │ Lang Toggle │  │ Auth Context │                        │  │
│  │  │ (EN/HI)     │  │ (Supabase)   │                        │  │
│  │  └─────────────┘  └──────────────┘                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Azure Functions                             │
│                                                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────────┐  │
│  │ /api/chat    │  │ /api/translate│  │ /api/guided-flow    │  │
│  │              │  │               │  │                     │  │
│  │ - RAG query  │  │ - EN <-> HI  │  │ - Step management   │  │
│  │ - LLM call   │  │ - Azure API  │  │ - Filter collection │  │
│  │ - Response   │  │               │  │ - Match & respond   │  │
│  └──────┬───────┘  └───────┬───────┘  └──────────┬──────────┘  │
└─────────┼───────────────────┼─────────────────────┼─────────────┘
          │                   │                     │
          ▼                   ▼                     ▼
┌──────────────────┐ ┌────────────────┐  ┌──────────────────────┐
│  Azure OpenAI    │ │Azure Translator│  │  Scholarship Data    │
│                  │ │                │  │                      │
│ - GPT (chat)    │ │ - Text transl. │  │ - JSON files         │
│ - ada-002       │ │ - Language det.│  │ - Vector embeddings  │
│   (embeddings)  │ │                │  │ - Azure Table Store  │
└──────────────────┘ └────────────────┘  └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Supabase                                  │
│  - Authentication (Email/Password + Google OAuth for Students)   │
│  - Roles: Student, Donor, Admin                                  │
│  - Session management                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Free-form Chat

1. User types a natural language query (e.g., "scholarships for SC students in Maharashtra")
2. If Hindi detected, Azure Translator converts to English
3. Query sent to `/api/chat`
4. Azure OpenAI ada-002 generates embedding for the query
5. Cosine similarity search against pre-computed scholarship embeddings
6. Top-K relevant scholarships retrieved
7. GPT model generates a natural language response with scholarship details
8. If user language is Hindi, response translated back
9. Response displayed in chat UI

## Data Flow: Guided Conversation

1. Bot asks structured questions one by one:
   - State → Category → Income → Education → Gender → Disability → Religion → Urban/Rural → Course
2. Each answer narrows the eligible scholarships via filter matching
3. After all relevant questions answered, system returns matching scholarships
4. Results include: eligibility, benefits, deadlines, application steps, required documents

## Authentication Flow

1. User lands on the landing page
2. Chooses Student, Donor, or Admin login
3. Supabase handles authentication:
   - Students: Google OAuth or Email/Password
   - Donors: Email/Password
   - Admins: Email/Password
4. For Google OAuth (students only):
   - User redirected to Google consent screen
   - After approval, redirected to `/auth/callback`
   - Callback page sets role and redirects to onboarding (new) or dashboard (returning)
5. JWT token stored in client, user ID/role sent with API requests via headers
6. Azure Functions validate headers for protected routes
7. Role-based access:
   - Students: Search scholarships, chat, recommendations
   - Donors: Create/manage private scholarships
   - Admins: Approve scholarships, manage users

## Embedding Strategy

- Each scholarship record is converted to a descriptive text string
- Text includes: name, description, eligibility criteria, benefits, state, category
- ada-002 generates a 1536-dimension vector for each scholarship
- Vectors stored as JSON alongside scholarship data
- At query time: embed user query → cosine similarity → top-K results → GPT response
