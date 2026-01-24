# PI2 — Milestone Tracker

## PI2.1: Branding & Auth Roles [COMPLETED]

| Issue | Title | Status |
|-------|-------|--------|
| #27 | Rebrand app to Mission Possible | Done |
| #28 | Add role-based authentication to AuthContext | Done |
| #29 | Implement role-based route protection | Done |

### Changes delivered
- Renamed app from "Scholarship Finder" to "Mission Possible" (EN/HI/TA/TE)
- Replaced indigo color scheme with teal/amber palette (`teal-700` primary, `amber-500` donor accent)
- Updated gradients, theme-color, page title, and footer tagline
- Added `UserRole` type (`student | donor | admin`) and `profileComplete` flag to AuthContext
- Added `updateProfile()` method for updating user metadata
- `signUp` now accepts optional `role` parameter stored in Supabase `user_metadata`
- Replaced `ProtectedRoute` with `RoleProtectedRoute` (role-aware redirects)
- Added routes: `/student/onboarding`, `/donor`
- Created placeholder pages: `StudentOnboarding.tsx`, `DonorDashboard.tsx`

---

## PI2.2: Landing & Login Redesign (Parallel with PI2.4) [COMPLETED]

| Issue | Title | Status |
|-------|-------|--------|
| #30 | 3 role cards on landing page | Done |
| #31 | Role-aware login flow | Done |

### Changes delivered
- Replaced feature cards and single CTA with 3 role cards (Student/Donor/Admin)
- Hero text updated to "Every Student Deserves a Chance"
- Each card navigates to `/login?role=<role>` with role-specific accent colors
- Login page reads `?role=` query param and pre-selects role
- Role selector tabs (Student/Donor) shown in signup mode; Admin forced to signin-only
- Redirect logic uses `profileComplete` flag: student without profile → `/student/onboarding`
- Removed old feature cards, single CTA button, and hidden admin link

---

## PI2.3: Student Onboarding & Recommendations [COMPLETED]

| Issue | Title | Status |
|-------|-------|--------|
| #32 | Student onboarding form | Done |
| #33 | Student dashboard update | Done |
| #34 | Recommendations API | Done |
| #35 | Chat update | Done |

### Changes delivered
- Replaced placeholder `StudentOnboarding.tsx` with 9-step multi-step wizard (state, category, education, income, gender, disability, religion, area, course)
- All onboarding options support 4 languages (EN/HI/TA/TE) via `onboardingOptions.ts` constants
- Supports edit mode (`?edit=true`) to update existing profile data
- Saves profile fields to Supabase `user_metadata` with `profileComplete: true`
- Extended `UserProfile` interface in AuthContext with all onboarding fields
- Added "Recommended" tab (default) to `StudentDashboard.tsx` alongside Guided Search and Chat
- Created `RecommendedScholarships.tsx` component showing profile summary, edit link, and scored cards
- Extracted `ScholarshipCard.tsx` as reusable component with optional `matchScore`/`matchReasons` display
- Created `POST /api/recommendations` endpoint with scoring algorithm (0-100 scale across 9 criteria)
- Added `getRecommendations()` and `StudentProfileData` type to `apiClient.ts`
- Updated `ChatWindow.tsx` to pass full student profile to chat API
- Updated `chat.ts` backend to accept `studentProfile`, build profile-aware system prompt, and enrich RAG search query
- Updated `SuggestionChips.tsx` to generate profile-aware chips (category, course, state)

---

## PI2.4: Backend — Data Model & APIs (Parallel with PI2.2) [COMPLETED]

| Issue | Title | Status |
|-------|-------|--------|
| #36 | Schema extension | Done |
| #37 | CRUD endpoints | Done |
| #38 | Users API | Done |
| #39 | Client functions | Done |

### Changes delivered
- Extended `Scholarship` interface with `type`, `donorId`, `donorName`, `status`, `createdAt`, `updatedAt`
- Created `api/data/private-scholarships.json` for donor-submitted scholarships
- Added `loadPrivateScholarships()`, `loadAllScholarships()`, `loadApprovedScholarships()`, `savePrivateScholarship()`, `deletePrivateScholarship()`
- Updated `filterScholarships()` and `searchScholarships()` to use approved-only list
- Created auth helper (`api/src/shared/auth.ts`) with `requireRole()` and header-based auth
- Created CRUD endpoints (`api/src/functions/scholarships.ts`): POST, GET, PUT, DELETE, PATCH status
- Created admin-only users endpoint (`api/src/functions/users.ts`) using Supabase Admin SDK
- Added `@supabase/supabase-js` to API dependencies
- Added client API functions: `createScholarship`, `getScholarships`, `updateScholarship`, `deleteScholarship`, `updateScholarshipStatus`, `getUsers`

---

## PI2.5: Donor Dashboard

| Issue | Title | Status |
|-------|-------|--------|
| #40 | ScholarshipForm component | Pending |
| #41 | Donor dashboard page | Pending |

---

## PI2.6: Admin Dashboard Enhancement

| Issue | Title | Status |
|-------|-------|--------|
| #42 | Admin CRUD/approvals | Pending |
| #43 | Cleanup | Pending |

---

## Implementation Order
PI2.1 -> PI2.2 + PI2.4 (parallel) -> PI2.3 -> PI2.5 -> PI2.6
