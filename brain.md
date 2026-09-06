# SmartGov Admin Dashboard — Project Brain

## Overview

A single-page **Admin Dashboard** for the **Smart Complaint Management System**
(SmartGov). It lets a government administrator log in, view complaint statistics,
review/manage citizen complaints, and see analytics. The entire app is a single
Next.js page (`src/app/page.tsx`) with client-side state management — there is
**no backend**; all data is hardcoded dummy data in memory.

## Tech Stack

- **Framework:** Next.js 15.5 (`app` router)
- **UI Library:** React 19
- **Language:** TypeScript (strict mode)
- **Icons:** `lucide-react`
- **Charts:** `recharts` (BarChart, PieChart)
- **Styling:** Plain CSS (`globals.css`) — no Tailwind/CSS modules
- **Scripts:** `dev`, `build`, `start`, `lint` (from `src/app/public/package.json`)

## Project Structure

```
├── package.json              # dependencies + scripts
├── package-lock.json         # lockfile
├── tsconfig.json             # TypeScript config
├── next.config.ts            # Next.js config
├── brain.md                  # this file
├── src/
│   └── app/
│       ├── globals.css       # all styling (single file)
│       ├── layout.tsx        # root layout (metadata + html/body wrapper)
│       └── page.tsx          # ENTIRE application logic (1441 lines)
└── .dist/                    # build output
```

> **Note:** The Next.js config files (`package.json`, `next.config.ts`,
> `tsconfig.json`) were originally misplaced inside `src/app/public/`, which
> prevented `next build`/`next dev` from finding them. They have been moved to
> the project root (where `src/app` lives) and the now-empty `public/` folder
> was removed — the standard Next.js project layout.

## Data Model

```ts
type Status   = "Pending" | "In Progress" | "Resolved" | "Rejected";
type Priority = "Low" | "Medium" | "High" | "Critical";
type Category = "Road" | "Garbage" | "Water" | "Streetlight";

type Complaint = {
  id, title, category, location, description,
  citizen, phone, date, department, staff,
  priority, status, photo, resolutionProof
};
```

- 6 dummy complaints (`initialComplaints`), IDs `CMP-001`–`CMP-006`, all in
  Kathmandu locations, with Unsplash stock photos.
- Analytics datasets (hardcoded, separate from the 6 complaints):
  - `monthlyData` — 9 months of complaint counts
  - `statusChartData` — Pending/In Progress/Resolved counts
  - `categoryChartData` — complaints per category

## Auth

- **Demo login:** `admin@gmail.com` / `admin123` (hardcoded in `handleLogin`).
- No real auth, persistence, or session handling — just flips `loggedIn` state.
- `logout()` resets state back to the login screen.

## Feature / Component Map

The `Home` component renders everything; sub-render-functions act as components:

| Function | Role |
|---|---|
| `Home` | Root: auth state, search/filters, page routing, renders everything |
| `DashboardHome` | Stats cards + category bar chart + status pie + recent complaints |
| `ComplaintsPage` | Full table with search + 3 filters (status/category/priority) |
| `ComplaintControls` | Search box + three filter dropdowns |
| `ComplaintTable` | Table view of complaints + empty state + "View" action |
| `ComplaintModal` | Detail modal: photo, info, description, admin controls, proof upload |
| `AnalyticsPage` | Monthly bar chart + status pie + category bar chart |
| `StatCard` | Reusable metric card (Total/Pending/In Progress/Resolved) |
| `StatusBadge` / `PriorityBadge` | Colored status/priority pills |

### Navigation & Pages
- Sidebar (fixed, 260px) with 3 functional pages: **Dashboard**, **Complaints**,
  **Analytics**. "Staff" and "Notifications" items are non-functional placeholders.
- Mobile: sidebar collapses to a drawer (`.sidebar-open`) toggled via hamburger
  menu + overlay.

### Complaint Management (modal)
- Admin can edit: `department`, `staff`, `priority`, `status` and upload a
  **resolution proof photo** (file input → object URL preview).
- "Save Changes" calls `updateComplaint` which updates the in-memory array.
- Cross-field search matches id, title, location, citizen.

## Key Patterns / Conventions

- **Single-file app:** All logic and sub-components live in `page.tsx`.
- `"use client"` directive at top of `page.tsx` (client-side interactivity).
- Styling uses BEM-ish flat class names in one `globals.css` file, with CSS
  custom section banners for organization.
- Responsive breakpoints at `1100px`, `800px`, `600px`.
- Recharts components wrapped in `ResponsiveContainer`.
- Consistent color palette: primary blue `#2563eb`, slate grays, status-colored
  badges (yellow/amber=orange progress, purple, green, red).

## Gotchas / Notes

- Types like `Status`/`Priority` and the `Complaint` interface are defined only
  in `page.tsx` and not exported — sub-components rely on type inference/props.
- The `monthlyData` `Sep` value and `statusChartData` totals do **not** match the
  6-item `initialComplaints` array — analytics charts use independent dummy data.
- `Rejected` status exists in code (badge CSS + filter options) but no dummy
  complaint uses it.
- Some nav items ("Staff", "Notifications") have no behavior.
- Backend integration, real authentication, database, file storage, and
  deployment are **not implemented** — all frontend-only demo.

## Build/Run

```bash
# from src/app/public
npm install
npm run dev       # start dev server
npm run build     # production build
```
