# Splickets Admin Panel Design Guidelines

## Design Approach

**System Selected:** Material Design adapted for data-intensive admin interface
**Justification:** Admin panel with user/lead/booking management requires clarity, efficient scanning, and data hierarchy. Material Design's elevation system and structured layouts excel at organizing complex information while maintaining professional polish aligned with airline industry standards.

## Typography System

**Font Stack:** Inter (Google Fonts) for entire interface
- Page Headers: text-3xl font-semibold tracking-tight
- Section Titles: text-xl font-semibold
- Card Headers: text-lg font-medium
- Body Text: text-base font-normal
- Table Data: text-sm font-normal
- Labels/Meta: text-xs font-medium uppercase tracking-wide
- Numbers/Stats: font-mono for tabular alignment

## Layout & Spacing System

**Spacing Units:** Standardize on 4, 6, 8, 12, 16 (as in p-4, gap-6, my-8, etc.)

**Dashboard Structure:**
- Fixed sidebar navigation (w-64) with nested menu groups
- Main content area with max-w-7xl container, px-8 py-6
- Header bar with breadcrumbs, search, and user profile (h-16)
- Content cards with consistent p-6 padding, rounded-lg borders

**Grid Systems:**
- Stats Dashboard: 4-column grid (grid-cols-4 gap-6) for KPI cards
- Data Tables: Full-width with fixed header, alternating row treatment
- Form Layouts: 2-column grid (grid-cols-2 gap-8) for input fields
- Detail Pages: 2/3 main content + 1/3 sidebar split

## Component Library

**Navigation Sidebar:**
- Logo area at top (h-16)
- Collapsible menu sections with icons (Heroicons outline)
- Active state indication with subtle background fill
- User profile card at bottom with avatar, name, role

**Dashboard Cards:**
- Elevated cards (shadow-sm) with rounded-lg borders
- Card headers with title + action button/dropdown alignment
- Stat cards: Large number display (text-4xl font-bold) with icon, label, and trend indicator (+/- percentage)

**Data Tables:**
- Sticky header row with sort indicators
- Row actions (kebab menu) aligned right
- Pagination controls at bottom (items per page + page numbers)
- Checkbox column for bulk actions
- Status badges with rounded-full styling

**Forms:**
- Grouped fieldsets with legend styling
- Input fields with floating labels
- Inline validation messages beneath fields
- Action buttons right-aligned (Cancel left, Primary right)
- Required field indicators (asterisk)

**Booking Detail View:**
- Timeline component showing booking stages (vertical stepper)
- Passenger information cards in grid
- Flight segment cards with departure/arrival formatting
- Payment plan breakdown table
- Activity log with timestamps

**Lead Management:**
- Kanban board layout (grid-cols-4) with draggable cards
- Lead cards showing: contact info, flight interest, score indicator
- Quick action buttons on card hover
- Filters sidebar with collapsible sections

**Search & Filters:**
- Persistent search bar in header (w-96)
- Advanced filter panel (slide-out from right, w-80)
- Applied filters shown as dismissible chips below search
- Date range picker for booking/creation dates

**Modals & Overlays:**
- Centered modals with max-w-2xl width
- Backdrop blur effect
- Close button top-right
- Footer with action buttons

**Empty States:**
- Centered icon (w-24 h-24) with descriptive text
- Primary action button encouraging creation
- Helpful tips or onboarding links

**No Hero Images:** Admin panels prioritize functionality over marketing visuals. Focus on clean layouts and data presentation.

**Animations:** Minimal - only smooth transitions for dropdown menus (150ms) and modal appearances (200ms). No decorative animations.