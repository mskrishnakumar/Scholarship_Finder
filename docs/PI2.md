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

## PI2.5: Donor Dashboard [COMPLETED]

| Issue | Title | Status |
|-------|-------|--------|
| #40 | ScholarshipForm component | Done |
| #41 | Donor dashboard page | Done |

### Changes delivered
- Created `ScholarshipForm.tsx` component with multi-section layout (Basic Info, Eligibility Criteria, Application Details)
- Form supports both create and edit modes via `initialData` prop
- Eligibility fields: searchable states list, categories, education levels, max income, gender, disability, religion, area, courses — all with "Select All" toggles
- Dynamic add/remove lists for `applicationSteps[]` and `requiredDocuments[]`
- Client-side validation (name + description required), inline error messages
- Replaced placeholder `DonorDashboard.tsx` with full donor dashboard
- Dashboard uses view state machine (`list` / `create` / `edit`)
- List view: stats row (total/approved/pending), scholarship cards with status badges (green/yellow/red), edit/delete actions
- Inline delete confirmation ("Delete? Yes / No") within each card
- Empty state with CTA when no scholarships exist
- Create/Edit views: "Back to list" navigation + ScholarshipForm integration
- Error banner with dismiss, loading spinner, disabled states during mutations
- Added `<LanguageToggle />` to header for language switching
- All UI strings support 4 languages (EN/HI/TA/TE) via `t()` function
- Amber accent color scheme (`amber-600` buttons, `amber-500` focus rings) consistent with donor role

---

## PI2.6: Admin Dashboard Enhancement [COMPLETED]

| Issue | Title | Status |
|-------|-------|--------|
| #42 | Admin CRUD/approvals | Done |
| #43 | Cleanup | Done |
| #44 | Separate role-specific Sign-up/Sign-in screens with Donor org details | Done |

### Changes delivered
- Replaced placeholder `AdminDashboard.tsx` with full admin dashboard
- Two-tab layout: Scholarships and Users management
- Scholarships tab: view all scholarships (public + private), stats (total/approved/pending/public/donor), status filter (all/pending/approved/rejected)
- Approve/Reject actions for pending scholarships, re-approve for rejected ones
- Full CRUD: create (as public/approved), edit, delete with confirmation
- Uses existing `ScholarshipForm` component for create/edit
- Users tab: view all registered users with stats (total/students/donors/admins), role filter, table view
- Type badges (Public/Donor) and Status badges (Approved/Pending/Rejected) on each scholarship
- Error banner with dismiss, loading spinners, disabled states during mutations
- Teal color scheme consistent with admin role
- `<LanguageToggle />` in header for language switching
- All UI strings support 4 languages (EN/HI/TA/TE) via `t()` function
- Codebase cleanup: no dead code, unused imports, or TODO placeholders found
- Replaced shared login page with role-specific login screens (`/login/student`, `/login/donor`, `/login/admin`)
- Each login screen clearly branded with role badge, role-specific accent colors, and no confusing role toggle
- Donor signup collects organization details: Organization Name (required), Organization Type (required), Designation, Website, Focus Areas (multi-select), Geographic Preference (state checkboxes)
- Admin login is sign-in only (no signup option)
- "Not a student/donor?" switch links between role pages
- Backward-compatible redirect: `/login?role=X` → `/login/X`
- Extended `AuthContext.signUp()` to accept `extraData` for donor org fields
- Extended `UserProfile` interface with donor-specific fields
- Landing page role cards navigate directly to `/login/<role>`

---

## Implementation Order
PI2.1 -> PI2.2 + PI2.4 (parallel) -> PI2.3 -> PI2.5 -> PI2.6

---

## Architecture Quick Reference (for next session)

### Project Structure
```
client/                         # React + Vite + Tailwind v4
  src/
    pages/                      # Route pages (StudentDashboard, DonorDashboard, AdminDashboard, LoginPage, LandingPage, StudentOnboarding)
    components/                 # UI (ChatWindow, GuidedFlow, ScholarshipCard, RecommendedScholarships, SuggestionChips, LanguageToggle)
    context/                    # AuthContext (Supabase auth, UserProfile, role), LanguageContext (en/hi/ta/te)
    services/apiClient.ts       # All API calls (chat, guided-flow, scholarships CRUD, recommendations, users)
    constants/                  # states.ts (INDIAN_STATES), onboardingOptions.ts (step options with 4-lang labels)
    lib/supabase.ts             # Supabase client init

api/                            # Azure Functions (Node/TS)
  src/
    functions/                  # HTTP endpoints: chat, guidedFlow, scholarships, users, recommendations, health, translate
    shared/                     # scholarshipData (load/filter/search/score), openai, translator, tableStorage, auth, supabaseAdmin
  data/
    scholarships.json           # 60+ public government schemes
    private-scholarships.json   # Donor-created (initially empty)
    embeddings.json             # Vector embeddings for RAG search
```

### Key Patterns
- **Styling**: Tailwind — `teal-700` primary, `amber-500` donor accent, `gray-50` bg
- **i18n**: `t('EN', 'HI', 'TA', 'TE')` via `useLanguage()` hook — all UI strings need 4 translations
- **Auth**: Supabase email+password; user_metadata stores `{name, role, state, category, ...profileFields, profileComplete}`
- **Auth headers for API**: `x-user-id` + `x-user-role` headers; validated by `requireRole()` in `api/src/shared/auth.ts`
- **Routes**: `RoleProtectedRoute` in App.tsx — redirects by role; `/donor` requires `donor` role
- **Scholarship types**: `public` (from JSON) vs `private` (donor-created); `status`: approved/pending/rejected
- **CRUD API**: `POST/GET/PUT/DELETE /api/scholarships`, `PATCH /api/scholarships/{id}/status` — requires donor/admin role

### What PI2.5 Needs (Donor Dashboard)
- **#40 ScholarshipForm**: Create/edit form component for donors to submit scholarships. Fields: name, description, eligibility (states, categories, maxIncome, educationLevels, gender, disability, religion, area, courses), benefits, deadline, applicationSteps[], requiredDocuments[], officialUrl. Use `createScholarship()` and `updateScholarship()` from apiClient.
- **#41 Donor Dashboard Page**: Replace placeholder `DonorDashboard.tsx` (`client/src/pages/DonorDashboard.tsx`). Show list of donor's own scholarships via `getScholarships({donorId: user.id}, userId, 'donor')`. Add "Create Scholarship" button → opens ScholarshipForm. Show status badges (pending/approved/rejected). Allow edit/delete of own scholarships.
- **Existing client functions**: `createScholarship`, `getScholarships`, `updateScholarship`, `deleteScholarship` already exist in apiClient.ts
- **Existing backend**: CRUD endpoints in `api/src/functions/scholarships.ts` already handle donor operations

### What PI2.6 Needs (Admin Dashboard)
- **#42 Admin CRUD/approvals**: Admin can see ALL scholarships (public + private), approve/reject pending ones via `updateScholarshipStatus()`. Admin can also manage users via `getUsers()`.
- **#43 Cleanup**: Remove any dead code, unused imports, TODO placeholders.
- **Existing pages**: `AdminDashboard.tsx` is a placeholder at `client/src/pages/AdminDashboard.tsx`
