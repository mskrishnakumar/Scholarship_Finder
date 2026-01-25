# PI3 — UI Restructure: Sidebar Navigation

## Overview
Restructure the application UI from tab-based navigation to a consistent sidebar layout across all roles (Student, Donor, Admin). This follows the UI patterns established in EduTrackApp, using Heroicons, consistent component structure, and a professional color system.

---

## Design System Alignment (with EduTrackApp)

### Icons: Heroicons
Use `@heroicons/react/24/outline` for consistency:

```bash
npm install @heroicons/react
```

**Icon Mapping for Navigation:**
| Role | Menu Item | Heroicon |
|------|-----------|----------|
| All | Dashboard | `Squares2X2Icon` |
| All | Settings | `Cog6ToothIcon` |
| All | Logout | `ArrowRightOnRectangleIcon` |
| Student | My Profile | `UserCircleIcon` |
| Student | Recommendations | `AcademicCapIcon` |
| Student | Find Scholarships | `MagnifyingGlassIcon` |
| Student | Chat Assistant | `ChatBubbleLeftRightIcon` |
| Donor | My Scholarships | `AcademicCapIcon` |
| Donor | Create Scholarship | `PlusCircleIcon` |
| Donor | Organization | `BuildingOfficeIcon` |
| Admin | Scholarships | `AcademicCapIcon` |
| Admin | Pending Approval | `ClockIcon` |
| Admin | Users | `UsersIcon` |

**Additional UI Icons:**
- `Bars3Icon` - Mobile hamburger menu
- `XMarkIcon` - Close/dismiss
- `BellIcon` - Notifications
- `ChevronLeftIcon` / `ChevronRightIcon` - Sidebar collapse
- `CheckCircleIcon` - Success states
- `ExclamationCircleIcon` - Warnings

### Color Theming

**Student/Admin Theme (Teal-based):**
```css
primary: #14B8A6       /* teal-500 */
primary-dark: #0D9488  /* teal-600 */
primary-light: #CCFBF1 /* teal-100 */
```

**Donor Theme (Amber-based):**
```css
accent: #F59E0B        /* amber-500 */
accent-dark: #D97706   /* amber-600 */
accent-light: #FEF3C7  /* amber-100 */
```

**Common Colors:**
```css
text-primary: #1F2937    /* gray-800 */
text-secondary: #6B7280  /* gray-500 */
gray-bg: #F9FAFB         /* gray-50 */
gray-border: #E5E7EB     /* gray-200 */
sidebar-bg: #FFFFFF
sidebar-active: #CCFBF1  /* teal-100 for Student/Admin */
                #FEF3C7  /* amber-100 for Donor */
```

### Tailwind CSS v4 Theme Extension

Add to `client/src/index.css`:

```css
@import "tailwindcss";

@theme {
  /* Primary - Teal (Student/Admin) */
  --color-primary: #14B8A6;
  --color-primary-dark: #0D9488;
  --color-primary-light: #CCFBF1;

  /* Accent - Amber (Donor) */
  --color-accent: #F59E0B;
  --color-accent-dark: #D97706;
  --color-accent-light: #FEF3C7;

  /* Text */
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;

  /* Layout */
  --spacing-sidebar: 240px;
  --spacing-sidebar-collapsed: 64px;
  --spacing-topbar: 64px;

  /* Border Radius */
  --radius-card: 12px;
  --radius-input: 8px;
  --radius-badge: 6px;

  /* Shadows */
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-card-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

---

## PI3.1: Core Layout Components

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| #47 | Create Sidebar component | Todo | M |
| #48 | Create DashboardLayout wrapper | Todo | S |
| #49 | Mobile-responsive sidebar (hamburger menu) | Todo | M |

### Sidebar Component Specification

**File:** `client/src/components/layout/Sidebar.tsx`

```tsx
// Key features matching EduTrackApp:
interface SidebarProps {
  role: 'student' | 'donor' | 'admin';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Structure:
// ├── Header (Logo + App name, hidden when collapsed)
// ├── Navigation (Role-based menu items)
// │   └── NavItem (icon + label + optional badge)
// └── Footer (User info + Logout)
```

**Sizing (matching EduTrackApp):**
- Expanded: `w-60` (240px)
- Collapsed: `w-16` (64px)
- Transition: `duration-300`

**Active State Styling:**
```tsx
// Active item
className="bg-primary-light text-primary-dark font-medium"

// Inactive item
className="text-text-secondary hover:bg-gray-50 hover:text-text-primary"
```

### DashboardLayout Component

**File:** `client/src/components/layout/DashboardLayout.tsx`

```tsx
// Layout structure:
// ├── Sidebar (fixed, z-50)
// ├── Mobile Overlay (when sidebar open on mobile)
// └── Main Content Area
//     ├── Header/Topbar (sticky, z-40)
//     │   ├── Mobile menu button (lg:hidden)
//     │   ├── Page title
//     │   ├── Language toggle
//     │   └── User avatar/menu
//     └── Content (Outlet)
//         └── Padding: p-6 lg:p-8
```

### Menu Configuration

**File:** `client/src/components/layout/menuConfig.ts`

```typescript
import {
  Squares2X2Icon,
  UserCircleIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  PlusCircleIcon,
  BuildingOfficeIcon,
  ClockIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const studentMenu: MenuItem[] = [
  { label: 'Dashboard', path: '/student', icon: Squares2X2Icon },
  { label: 'My Profile', path: '/student/profile', icon: UserCircleIcon },
  { label: 'Recommendations', path: '/student/recommendations', icon: AcademicCapIcon },
  { label: 'Find Scholarships', path: '/student/search', icon: MagnifyingGlassIcon },
  { label: 'Chat Assistant', path: '/student/chat', icon: ChatBubbleLeftRightIcon },
  { label: 'Settings', path: '/student/settings', icon: Cog6ToothIcon },
];

export const donorMenu: MenuItem[] = [
  { label: 'Dashboard', path: '/donor', icon: Squares2X2Icon },
  { label: 'My Scholarships', path: '/donor/scholarships', icon: AcademicCapIcon },
  { label: 'Create Scholarship', path: '/donor/scholarships/new', icon: PlusCircleIcon },
  { label: 'Organization', path: '/donor/organization', icon: BuildingOfficeIcon },
  { label: 'Settings', path: '/donor/settings', icon: Cog6ToothIcon },
];

export const adminMenu: MenuItem[] = [
  { label: 'Dashboard', path: '/admin', icon: Squares2X2Icon },
  { label: 'Scholarships', path: '/admin/scholarships', icon: AcademicCapIcon },
  { label: 'Pending Approval', path: '/admin/pending', icon: ClockIcon, badge: 0 },
  { label: 'Users', path: '/admin/users', icon: UsersIcon },
  { label: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
];
```

### Acceptance Criteria
- [ ] `Sidebar.tsx` with Heroicons, collapsible, role-based menus
- [ ] `DashboardLayout.tsx` wrapper combining Sidebar + Header + Content
- [ ] `Header.tsx` with mobile menu button, language toggle, user info
- [ ] `menuConfig.ts` with typed menu definitions per role
- [ ] Collapsed mode (icon-only) with smooth expand/collapse toggle
- [ ] Mobile: hamburger menu (`Bars3Icon`) that slides sidebar as overlay
- [ ] Badge support on menu items (e.g., pending count on Admin)
- [ ] Logout button at bottom of sidebar using `ArrowRightOnRectangleIcon`
- [ ] Language toggle in header (reuse `LanguageToggle.tsx`)
- [ ] Color theming: teal for Student/Admin sidebar-active, amber for Donor

### Technical Notes
- Create `client/src/components/layout/` folder
- Use `NavLink` from react-router-dom for active state detection
- Icon sizing: `w-5 h-5` for menu items
- Responsive breakpoint: `lg:` for desktop sidebar visibility
- Mobile overlay: `fixed inset-0 bg-black/50 z-40`

---

## PI3.2: Student Dashboard Restructure

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| #50 | Student Dashboard overview page | Todo | M |
| #51 | Extract Recommendations to separate route | Todo | S |
| #52 | Extract Guided Search to separate route | Todo | S |
| #53 | Extract Chat to separate route | Todo | S |
| #54 | Create Student Profile page | Todo | M |
| #55 | Student Settings page | Todo | S |

### New Route Structure
```
/student                    → Dashboard (overview with stats, quick actions)
/student/profile            → View/edit profile (integrate onboarding in edit mode)
/student/recommendations    → AI-powered recommendations (existing component)
/student/search             → Guided search flow (existing component)
/student/chat               → Chat assistant (existing component)
/student/settings           → Language preference, notification settings
```

### Student Dashboard Overview Design

**Stats Cards (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6):**
1. **Matches Found** - `AcademicCapIcon` with teal background
2. **Deadlines This Week** - `CalendarIcon` with amber background
3. **Profile Completion** - `UserCircleIcon` with blue background

**Quick Actions:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <QuickActionCard
    icon={MagnifyingGlassIcon}
    title="Find Scholarships"
    description="Search for matching opportunities"
    to="/student/search"
  />
  <QuickActionCard
    icon={ChatBubbleLeftRightIcon}
    title="Chat Assistant"
    description="Get personalized help"
    to="/student/chat"
  />
  <QuickActionCard
    icon={UserCircleIcon}
    title="Update Profile"
    description="Improve your matches"
    to="/student/profile"
  />
</div>
```

### Acceptance Criteria
- [ ] New `/student` overview page with stat cards (matching EduTrackApp StatCard style)
- [ ] Quick action cards linking to main features
- [ ] Recommendations, GuidedFlow, ChatWindow moved to dedicated routes
- [ ] Profile page shows current profile data with "Edit Profile" button
- [ ] Edit Profile opens onboarding wizard in edit mode
- [ ] Settings page with language selector
- [ ] All existing functionality preserved, just reorganized
- [ ] Remove tab-based navigation from StudentDashboard

### Technical Notes
- Create `client/src/pages/student/` folder
- `StudentDashboard.tsx` becomes overview only (remove tabs)
- Create: `StudentRecommendations.tsx`, `StudentSearch.tsx`, `StudentChat.tsx`, `StudentProfile.tsx`, `StudentSettings.tsx`
- Update `App.tsx` with nested routes under `/student/*`

---

## PI3.3: Donor Dashboard Restructure

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| #56 | Donor Dashboard overview page | Todo | M |
| #57 | Scholarships list as separate route | Todo | S |
| #58 | Create Scholarship as separate route | Todo | S |
| #59 | Organization Profile page | Todo | M |
| #60 | Donor Settings page | Todo | S |

### New Route Structure
```
/donor                      → Dashboard (overview with stats)
/donor/scholarships         → List of created scholarships
/donor/scholarships/new     → Create new scholarship form
/donor/scholarships/:id     → Edit existing scholarship
/donor/organization         → View/edit organization profile
/donor/settings             → Preferences
```

### Donor Dashboard Overview Design

**Stats Cards (Amber theme):**
1. **Total Scholarships** - `AcademicCapIcon`
2. **Approved** - `CheckCircleIcon`
3. **Pending Review** - `ClockIcon`

### Acceptance Criteria
- [ ] New `/donor` overview page with stats (amber color scheme)
- [ ] Quick actions on dashboard (Create Scholarship, View All)
- [ ] Scholarships list moved to `/donor/scholarships`
- [ ] Create form at `/donor/scholarships/new`
- [ ] Edit form at `/donor/scholarships/:id` (dynamic route)
- [ ] Organization page shows donor org details with edit capability
- [ ] Settings page with language selector
- [ ] Remove view-state machine from DonorDashboard, use routes instead

### Technical Notes
- Create `client/src/pages/donor/` folder
- Split current `DonorDashboard.tsx` into multiple pages
- Use React Router `useParams()` for edit route
- Reuse existing `ScholarshipForm` component

---

## PI3.4: Admin Dashboard Restructure

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| #61 | Admin Dashboard overview page | Todo | M |
| #62 | Scholarships management as separate route | Todo | S |
| #63 | Pending Approvals as separate route | Todo | S |
| #64 | Users management as separate route | Todo | S |
| #65 | Admin Settings page | Todo | S |

### New Route Structure
```
/admin                      → Dashboard (platform overview)
/admin/scholarships         → All scholarships management
/admin/pending              → Pending approvals queue
/admin/users                → User management
/admin/settings             → Platform settings
```

### Admin Dashboard Overview Design

**Stats Cards (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4):**
1. **Total Users** - `UsersIcon`
2. **Total Scholarships** - `AcademicCapIcon`
3. **Pending Approval** - `ClockIcon` (with count badge)
4. **Active Students** - `UserCircleIcon`

**Requires Attention Section:**
```tsx
<Card>
  <CardHeader>
    <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />
    <span>Requires Attention</span>
  </CardHeader>
  {/* List of pending items with quick approve/reject actions */}
</Card>
```

### Acceptance Criteria
- [ ] New `/admin` overview with platform stats
- [ ] "Requires Attention" section highlighting pending approvals
- [ ] Scholarships page with full CRUD and filtering
- [ ] Dedicated pending approvals page with approve/reject actions
- [ ] Users page with role filtering and user list
- [ ] Settings page
- [ ] Pending count badge on sidebar menu item (dynamic)
- [ ] Remove tab-based navigation from AdminDashboard

### Technical Notes
- Create `client/src/pages/admin/` folder
- Split current `AdminDashboard.tsx` into multiple pages
- Pending approvals = scholarships filtered by `status: 'pending'`
- Badge count fetched on layout mount

---

## PI3.5: Reusable UI Components

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| #66 | Create common UI components (Card, Badge, Button) | Todo | M |
| #67 | Create StatCard component | Todo | S |

### Common Components to Create

**File:** `client/src/components/common/`

```
common/
├── Button.tsx         # Primary, secondary, danger variants
├── Card.tsx           # Card, CardHeader exports
├── Badge.tsx          # Status badges (pending, approved, rejected)
├── StatCard.tsx       # Dashboard stat cards with icon
├── Modal.tsx          # Reusable modal component
└── index.ts           # Barrel export
```

**StatCard Example (matching EduTrackApp):**
```tsx
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'teal' | 'amber' | 'blue' | 'cyan';
  trend?: { value: number; label: string };
}

// Color mappings
const colorClasses = {
  teal: 'bg-teal-100 text-teal-600',
  amber: 'bg-amber-100 text-amber-600',
  blue: 'bg-blue-100 text-blue-600',
  cyan: 'bg-cyan-100 text-cyan-600',
};
```

---

## PI3.6: Routing & Navigation Polish

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| #68 | Update App.tsx with nested routes | Todo | M |
| #69 | Active menu item highlighting | Todo | S |
| #70 | 404 page for unknown routes | Todo | S |

### Acceptance Criteria
- [ ] All new routes configured in App.tsx with role protection
- [ ] Sidebar highlights current active menu item (using NavLink)
- [ ] Smooth transitions between pages
- [ ] 404 page for unmatched routes within dashboard
- [ ] Back navigation works correctly
- [ ] Deep linking works (e.g., `/student/chat` loads correctly on refresh)

---

## Implementation Order

```
PI3.1 (Layout Components + Theme Setup)
    ↓
PI3.5 (Common UI Components)
    ↓
PI3.2 (Student) + PI3.3 (Donor) + PI3.4 (Admin) — can be parallel
    ↓
PI3.6 (Routing Polish)
```

---

## File Structure After PI3

```
client/src/
  components/
    layout/
      Sidebar.tsx           # NEW: Collapsible sidebar with Heroicons
      DashboardLayout.tsx   # NEW: Wrapper with sidebar + header + content
      Header.tsx            # NEW: Top header with user info, language
      menuConfig.ts         # NEW: Menu definitions per role
      index.ts              # NEW: Barrel export
    common/
      Button.tsx            # NEW: Button variants
      Card.tsx              # NEW: Card, CardHeader
      Badge.tsx             # NEW: Status badges
      StatCard.tsx          # NEW: Dashboard stat cards
      Modal.tsx             # NEW: Modal component
      index.ts              # NEW: Barrel export
    ... (existing components unchanged)
  pages/
    student/
      StudentDashboard.tsx  # Refactored: Overview only
      StudentProfile.tsx    # NEW: Profile view/edit
      StudentRecommendations.tsx  # NEW: Moved from tab
      StudentSearch.tsx     # NEW: Moved from tab
      StudentChat.tsx       # NEW: Moved from tab
      StudentSettings.tsx   # NEW: Settings page
      index.ts              # NEW: Barrel export
    donor/
      DonorDashboard.tsx    # Refactored: Overview only
      DonorScholarships.tsx # NEW: List view
      DonorScholarshipForm.tsx  # NEW: Create/Edit form
      DonorOrganization.tsx # NEW: Org profile
      DonorSettings.tsx     # NEW: Settings page
      index.ts              # NEW: Barrel export
    admin/
      AdminDashboard.tsx    # Refactored: Overview only
      AdminScholarships.tsx # NEW: All scholarships
      AdminPending.tsx      # NEW: Pending approvals
      AdminUsers.tsx        # NEW: User management
      AdminSettings.tsx     # NEW: Settings page
      index.ts              # NEW: Barrel export
    LandingPage.tsx         # Unchanged
    LoginPage.tsx           # Unchanged
    StudentOnboarding.tsx   # Unchanged (used by Profile page)
    NotFound.tsx            # NEW: 404 page
```

---

## Dependencies to Add

```bash
cd client
npm install @heroicons/react
```

---

## Estimates Key
- **S** = Small (< 2 hours)
- **M** = Medium (2-4 hours)
- **L** = Large (4-8 hours)

**Total Estimated Effort: ~20-25 hours**

---

## Parallel Execution Plan

### Wave 1: Foundation (4 parallel agents)
Run these tasks simultaneously - no file conflicts:

| Agent | Issues | Files Created | Est. |
|-------|--------|---------------|------|
| **Agent A** | #79, #80 | Theme CSS + `components/common/` (Button, Card, Badge, Modal) | M |
| **Agent B** | #47 | `components/layout/Sidebar.tsx`, `menuConfig.ts` | M |
| **Agent C** | #68 | `pages/NotFound.tsx` | S |
| **Agent D** | #72 (PI4) | `.github/workflows/azure-functions.yml` | M |

### Wave 2: Layout Integration (2 parallel agents)
After Wave 1 completes:

| Agent | Issues | Dependencies |
|-------|--------|--------------|
| **Agent E** | #48, #49 | DashboardLayout + Header + Mobile | Wave 1 Agent B |
| **Agent F** | #81 | StatCard component | Wave 1 Agent A |

### Wave 3: Role Pages (3 parallel agents)
These are **completely independent** - can run simultaneously:

| Agent | Issues | Files |
|-------|--------|-------|
| **Agent G** | #50, #51, #52, #53, #54, #55 | `pages/student/*.tsx` (6 files) |
| **Agent H** | #56, #57, #58, #59, #60 | `pages/donor/*.tsx` (5 files) |
| **Agent I** | #61, #62, #63, #64, #65 | `pages/admin/*.tsx` (5 files) |

### Wave 4: Integration (2 parallel agents)

| Agent | Issues | Dependencies |
|-------|--------|--------------|
| **Agent J** | #66, #67 | App.tsx routes + menu highlighting | Waves 1-3 |
| **Agent K** | #74, #75 (PI4) | Frontend API URL + endpoint testing | PI4 Wave 0 |

### Dependency Graph
```
WAVE 1              WAVE 2           WAVE 3              WAVE 4
────────────────────────────────────────────────────────────────

#79,80 ──────→ #81 ─────────┐
                            │
#47 ─────────→ #48,49 ──────┼──→ #50-55 (Student) ──┐
                            │                        │
                            ├──→ #56-60 (Donor) ─────┼──→ #66,67
                            │                        │
#68 (404) ──────────────────┴──→ #61-65 (Admin) ────┘
```

### How to Activate Sub-Agents

In Claude Code, request parallel execution:

```
Run Wave 1 tasks in parallel:
1. #79 + #80: Theme setup and common UI components
2. #47: Sidebar component with menuConfig
3. #68: 404 page
4. #72: GitHub Actions workflow (PI4)
```

Or for Wave 3:
```
Execute these 3 agents in parallel for role-specific pages:
1. Student pages (#50-55)
2. Donor pages (#56-60)
3. Admin pages (#61-65)
```

---

## Key Differences from Original PI3

| Aspect | Original | Updated (EduTrackApp aligned) |
|--------|----------|------------------------------|
| Icons | Emojis | `@heroicons/react/24/outline` |
| Sidebar width | Unspecified | 240px expanded, 64px collapsed |
| Color system | Basic teal/amber | Extended theme with Tailwind v4 CSS variables |
| Component structure | Flat | Organized in `layout/` and `common/` folders |
| Active states | Unspecified | `bg-primary-light text-primary-dark` pattern |
| Common components | None | Button, Card, Badge, StatCard, Modal |
| Transitions | None | `duration-300` for sidebar, `duration-200` for hovers |
