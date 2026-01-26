# Architecture Decision Records

## ADR-001: React + Vite + Tailwind CSS for Frontend

**Status:** Accepted
**Context:** Need a modern, fast frontend framework suitable for a hackathon with good developer experience.
**Decision:** Use React with Vite as the build tool and Tailwind CSS for styling.
**Rationale:** Vite provides fast HMR and builds. Tailwind enables rapid UI development without custom CSS. React has extensive ecosystem support and pairs well with Azure SWA.

---

## ADR-002: Azure Functions for Backend API

**Status:** Accepted
**Context:** Need a serverless backend that integrates natively with Azure Static Web Apps.
**Decision:** Use Azure Functions (Node.js, v4 programming model) for all API endpoints.
**Rationale:** Native SWA integration, no server management, auto-scaling, and pay-per-use pricing suitable for a demo/hackathon project.

---

## ADR-003: Azure OpenAI for LLM and Embeddings

**Status:** Accepted
**Context:** Need an LLM for chat responses and an embedding model for semantic search.
**Decision:** Use Azure OpenAI with a GPT model for chat and text-embedding-ada-002 for embeddings.
**Rationale:** Enterprise-grade, Azure-native integration, supports RAG patterns. ada-002 provides high-quality embeddings for semantic similarity search.

---

## ADR-004: Vector Semantic Search over Keyword Matching

**Status:** Accepted
**Context:** Need to match user queries (potentially vague or in natural language) to relevant scholarships.
**Decision:** Use vector-based semantic search with pre-computed embeddings rather than keyword/filter matching.
**Rationale:** Handles natural language queries better than exact keyword matching. Students may not know exact scheme names or use official terminology. Semantic search bridges the vocabulary gap.

---

## ADR-005: Azure Translator API for Bilingual Support

**Status:** Accepted
**Context:** Target users include Hindi-speaking students who may not be comfortable with English.
**Decision:** Use Azure Translator API with a full UI + chat language toggle (English/Hindi).
**Rationale:** Azure Translator integrates well with the existing Azure stack. A toggle switch provides clear UX for language switching rather than auto-detection alone.

---

## ADR-006: Supabase for Authentication

**Status:** Accepted
**Context:** Need user authentication with role-based access (Student vs Admin) without building auth from scratch.
**Decision:** Use Supabase Auth with email/password login and two roles: Student and Admin.
**Rationale:** Supabase provides a generous free tier, easy integration with React, JWT-based auth that Azure Functions can validate, and built-in role management. Faster to set up than Azure AD B2C for a hackathon.

---

## ADR-007: Curated Sample Dataset for Hackathon Demo

**Status:** Accepted
**Context:** Need scholarship data to power the chatbot but don't have time to scrape all government portals.
**Decision:** Start with a manually curated sample dataset of ~20-30 real Indian government scholarships in JSON format.
**Rationale:** Sufficient for demo purposes. Real data ensures authenticity. Can be expanded post-hackathon. JSON format allows easy embedding generation and filtering.

---

## ADR-008: Comprehensive Eligibility Filters

**Status:** Accepted
**Context:** Need to match students to scholarships based on their profile.
**Decision:** Support comprehensive filters: state, caste category (SC/ST/OBC/General), income level, education level, gender, disability status, religion/minority, urban/rural, and specific course/field.
**Rationale:** Indian government schemes have diverse eligibility criteria across all these dimensions. Comprehensive filters ensure accurate matching and prevent students from missing schemes they qualify for.

---

## ADR-009: Dual Interaction Mode (Guided + Free-form)

**Status:** Accepted
**Context:** Users have varying levels of familiarity with scholarship systems and technology.
**Decision:** Support both a guided step-by-step conversation flow and free-form natural language chat.
**Rationale:** First-time users benefit from guided questions that ensure all eligibility info is captured. Experienced users can quickly ask specific questions. Both flows ultimately use the same matching/RAG backend.

---

## ADR-010: Landing Page with Role-based Login

**Status:** Accepted
**Context:** Need a clear entry point that separates student and admin experiences.
**Decision:** Create a landing page with distinct Student and Admin login options, backed by Supabase auth.
**Rationale:** Different roles have different needs (students search scholarships, admins manage data). A clear landing page with role selection sets expectations and routes users to the appropriate experience.

---

## ADR-011: Google OAuth for Student Authentication

**Status:** Accepted
**Context:** Students may find email/password signup friction-heavy, especially on mobile devices. Many students already have Google accounts.
**Decision:** Add Google OAuth as an authentication option for students, alongside the existing email/password method.
**Rationale:**
- Reduces signup friction for students (one-click sign-in)
- Most students already have Google accounts
- Supabase provides built-in OAuth support with minimal code changes
- Google OAuth is not offered for Donors/Admins as these require more deliberate account creation

**Implementation Notes:**
- Uses Supabase's `signInWithOAuth` with Google provider
- Callback page (`/auth/callback`) handles role assignment for new users
- New Google users are assigned `role: 'student'` and redirected to onboarding
- Returning users are redirected directly to dashboard
