# HRMS Frontend Rules & Regulations

This document defines the standards, conventions, and design rules for the HRMS frontend codebase. All new and modified code must align with these rules unless explicitly overridden by product or design.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [File System & Project Structure](#2-file-system--project-structure)
3. [Naming Conventions](#3-naming-conventions)
4. [Design Tokens & Theming](#4-design-tokens--theming)
5. [Colors](#5-colors)
6. [Typography](#6-typography)
7. [Spacing, Radius & Layout](#7-spacing-radius--layout)
8. [Shadows & Depth (Neumorphism)](#8-shadows--depth-neumorphism)
9. [Component Conventions](#9-component-conventions)
10. [Styling Approach](#10-styling-approach)
11. [Accessibility](#11-accessibility)
12. [Responsive Design](#12-responsive-design)
13. [State, Data & APIs](#13-state-data--apis)
14. [Imports, Exports & Dependencies](#14-imports-exports--dependencies)
15. [Anti-Patterns (Do Not Do)](#15-anti-patterns-do-not-do)

---

## 1. Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite 5 |
| Framework | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS 3.x |
| UI Library | Ant Design 5 (selective: Button, DatePicker, TimePicker, Calendar) |
| Icons | Lucide React |
| State | Redux Toolkit |
| Routing | React Router DOM 6 |
| HTTP | Axios (via RTK Query) |
| Utilities | clsx, tailwind-merge (`cn()`), dayjs, moment-timezone |
| Animations | Framer Motion (where needed) |
| Notifications | react-hot-toast |

- **Entry**: `index.html` → `src/main.tsx` → `App.tsx`. Global styles: `src/index.css`. Ant Design reset: `antd/dist/reset.css` imported in `main.tsx`.

---

## 2. File System & Project Structure

```
HRMS_Final_FE/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx              # Entry: providers, Toaster, root render
│   ├── App.tsx                # Router, routes, Layout, ProtectedRoute
│   ├── index.css              # Global styles, Tailwind directives, utilities
│   ├── components/            # All React components
│   │   ├── common/            # Shared primitives (Button, Input, Modal, Table, etc.)
│   │   │   ├── index.ts       # Single re-export for common components
│   │   │   └── *.tsx
│   │   ├── layout/            # Header, Sidebar
│   │   ├── auth/              # Login, AuthLayout, ForgotPassword, ChangePassword
│   │   ├── dashboard/         # AdminDashboard, UserDashboard
│   │   ├── employees/         # Employee management + sub-components
│   │   ├── leave/             # Leave flows
│   │   ├── timesheet/         # Timesheet flows
│   │   ├── survey/            # Survey builder, responses, etc.
│   │   └── ...                # One folder per feature/module
│   ├── store/                 # Redux store, slices, RTK Query APIs, hooks
│   ├── hooks/                 # Custom hooks (e.g. useSidebarMenu, useAuth)
│   ├── contexts/              # React contexts (e.g. FeatureFlagsContext)
│   ├── utils/                 # Helpers (cn, constants, rbac, nameUtils, etc.)
│   ├── services/              # API or service layer (and __mock__ if any)
│   └── ...
└── docs/                      # Documentation (e.g. this file)
```

**Rules:**

- **Feature-based folders** under `src/components/`: one directory per domain (auth, dashboard, leave, employees, survey, resource-management, etc.).
- **Shared UI** lives in `src/components/common/`. All common components are re-exported from `src/components/common/index.ts`; consumers import from `"../common"` or `"@/components/common"` (if path alias is set).
- **No component folder** for single-file components; use `FeatureName.tsx` inside the feature folder. Use subfolders (e.g. `employees/components/`, `survey/builder/components/`) when a feature has many related components.
- **Store**: `src/store/` holds the Redux store, slices, and RTK Query API definitions. Hooks like `useAuth`, `useRbac` live under `store/hooks/` or `hooks/`.
- **Utils**: Pure helpers and constants in `src/utils/`. No UI in utils.
- **Single global CSS file**: `src/index.css`. Prefer Tailwind utilities; add custom classes or keyframes here when necessary.

---

## 3. Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| **React components** | PascalCase | `EmployeeFormModal.tsx`, `LeaveCredits.tsx` |
| **Files (components)** | PascalCase for components | `Header.tsx`, `AuthLayout.tsx` |
| **Files (non-components)** | camelCase or kebab-case as project standard | `useAuth.ts`, `nameUtils.ts` |
| **Folders** | camelCase or PascalCase to match feature | `organization-Onboarding`, `resource-management` |
| **CSS classes** | Tailwind utilities only; custom classes in kebab-case | `scrollbar-thin`, `line-clamp-1` |
| **Constants / enums** | UPPER_SNAKE or PascalCase | `FEATURE_FLAGS`, `RoleTypeEnum` |
| **Custom hooks** | `use` prefix | `useAuth`, `useSidebarMenu`, `useRbac` |
| **Boolean props** | `is*`, `has*`, `show*`, `can*` | `isOpen`, `hasPermission`, `showPassword` |
| **Event handlers** | `handle*` or `on*` for props | `handleSubmit`, `onClose` |
| **Component props interfaces** | `ComponentNameProps` or `ComponentNameProps` | `ModalProps`, `InputProps` |

- **Exports**: Default export for the main component; named exports for sub-components or types (e.g. `Modal`, `ModalFooter`, `ModalButton`).

---

## 4. Design Tokens & Theming

- **Single source of truth**: Theme and design tokens are defined in **Tailwind** (`tailwind.config.js`). Extend `theme.extend` for colors, fonts, radius, shadows, and keyframes.
- **Current theme (legacy)**:
  - **Font**: `sans` = Gilroy, Inter, Segoe UI, Helvetica Neue, Arial.
  - **Primary color**: blue scale (`primary` with DEFAULT `#1677ff` and 50–900).
  - **Screens**: `xs: 475px`, `xl3: 1280px`.
  - **Animation**: `shimmer` keyframes and `animate-shimmer`.
- **Design system target (Neumorphism / Soft UI)**:
  - **Background**: `#E0E5EC` (cool grey “clay”).
  - **Foreground**: `#3D4852` (primary text).
  - **Muted**: `#6B7280` (secondary text).
  - **Accent**: `#6C63FF` (CTAs, focus); **Accent Light**: `#8B84FF`; **Accent Secondary**: `#38B2AC` (success).
  - **Borders**: Prefer no borders; use shadows for edges in neumorphic UI.
  - **Fonts**: Display = Plus Jakarta Sans; Body = DM Sans (load with `display=swap`).
  - **Radius**: Containers/cards 32px; buttons/base 16px; inner 12px or full.
  - **Shadows**: RGBA-based dual shadows (light top-left, dark bottom-right); see [Shadows & Depth](#8-shadows--depth-neumorphism).

When adding or changing tokens, update `tailwind.config.js` and use the same tokens across components. Avoid hardcoding hex/rgba in component classNames when a token exists.

---

## 5. Colors

**Current (legacy) usage:**

- **Primary actions**: `primary` (blue) or `blue-600` / `blue-700`.
- **Backgrounds**: `bg-white`, `bg-gray-50`, `bg-gray-100`.
- **Text**: `text-gray-900`, `text-gray-700`, `text-gray-500`, `text-red-600` for errors.
- **Borders**: `border-gray-200`, `border-gray-300`.
- **Focus**: `#3b82f6` (blue) in `index.css` for `button:focus-visible` and `[role="button"]:focus-visible`.

**Design system (Neumorphism) rules:**

- **Background**: Use `#E0E5EC` for page and card surfaces. Do not use `bg-white` for cards in neumorphic screens.
- **Text**: Primary `#3D4852` (WCAG AAA on background); secondary/muted `#6B7280` (WCAG AA).
- **Accent**: `#6C63FF` for primary buttons and focus rings; use sparingly.
- **Placeholder**: `#A0AEC0` for input placeholders only; do not use for body text (contrast).
- **Shadows**: Use RGBA values (e.g. `rgb(163,177,198,0.6)`, `rgba(255,255,255,0.5)`). Do not use opaque hex for shadows.
- **Borders**: Prefer `transparent` or no border; edges are defined by shadows in neumorphic UI.

---

## 6. Typography

- **Font stack**: Defined in Tailwind `theme.extend.fontFamily`. Current: Gilroy, Inter, etc. Target: Plus Jakarta Sans (display), DM Sans (body), with `display=swap` in the font link.
- **Weights**: Use Tailwind: `font-normal` (400), `font-medium` (500), `font-bold` (700), `font-extrabold` (800). Display headings: `font-extrabold` + `tracking-tight`.
- **Scale**: Prefer Tailwind scale: `text-sm` (14px) through `text-7xl` (72px). Responsive: e.g. `text-7xl` on desktop, `text-5xl` on mobile for heroes.
- **Body**: Default font from `body` in global CSS; no margin/padding on headings and paragraphs (reset in `index.css`).
- **Contrast**: Use foreground (#3D4852) and muted (#6B7280) for text on #E0E5EC to meet WCAG AA/AAA. Do not use low-contrast grays (e.g. #8B95A5, #A0AEC0) for body text.

---

## 7. Spacing, Radius & Layout

- **Spacing**: Use Tailwind spacing scale (e.g. `p-4`, `p-8`, `gap-12`, `py-32` for hero sections). Keep layouts “open and airy” where the design system applies.
- **Radius**:
  - **Containers / cards**: `rounded-[32px]` (or a token like `rounded-neumorphic-card`).
  - **Buttons / base UI**: `rounded-2xl` (16px). Avoid `rounded-lg` for primary surfaces in neumorphic design.
  - **Inner elements**: `rounded-xl` (12px) or `rounded-full` for pills.
- **Layout**:
  - **Max width**: `max-w-7xl` for main content where appropriate.
  - **Root background**: In neumorphic screens, set page background to `#E0E5EC`; no gradient on root unless specified.
- **Grids**: Responsive columns (e.g. 3-col → 1-col on mobile); use `gap-*` for spacing.

---

## 8. Shadows & Depth (Neumorphism)

Shadows define the “physics” of the UI. Use RGBA for smooth blending.

**Extruded (raised, default):**

- Standard: `9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)`.
- Hover (lifted): `12px 12px 20px rgb(163,177,198,0.7), -12px -12px 20px rgba(255,255,255,0.6)`.
- Small: `5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5)`.

**Inset (pressed / wells):**

- Standard: `inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255,0.5)`.
- Deep (inputs, wells): `inset 10px 10px 20px rgb(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)`.
- Small: `inset 3px 3px 6px rgb(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)`.

Define these as Tailwind utilities (e.g. `shadow-neumorphic-extruded`, `shadow-neumorphic-inset-deep`) in config or a small CSS layer so components stay consistent. Buttons: default extruded; hover = lift + stronger extruded; active = slight press + inset. Cards: extruded; hover = lift + stronger shadow. Inputs: default inset; focus = inset-deep + accent ring.

---

## 9. Component Conventions

- **Common components**: Implement in `src/components/common/`, export via `common/index.ts`. Use TypeScript interfaces for props (e.g. `InputProps`, `ModalProps`).
- **Props**: Prefer explicit props with sensible defaults. Use `className?: string` for layout/overrides. Support `disabled`, `loading`, `error` where relevant.
- **Composition**: Prefer composition (e.g. `Modal` + `ModalFooter` + `ModalButton`) over one giant component with many variants.
- **Sizes**: Standardize sizes (e.g. `sm` | `md` | `lg`) and map to Tailwind (height, padding, text).
- **Variants**: Use an `appearance` or `variant` prop for primary/secondary/danger/etc. Map to Tailwind (and Ant Design only where the component wraps Ant Design).
- **Icons**: Use Lucide React; consistent size (e.g. `w-4 h-4` or `w-5 h-5`) unless the design specifies otherwise.
- **Class merging**: Use `cn()` from `src/utils/cn.ts` (clsx + tailwind-merge) when combining conditional classes with component `className`.
- **Ant Design**: Used only where needed (Button, DatePicker, TimePicker, Calendar). Override styles via `className` and Tailwind; avoid scattering Ant Design across many features.

---

## 10. Styling Approach

- **Tailwind-first**: Use utility classes for layout, spacing, colors, typography, and responsive behavior. Avoid inline styles for layout/visual design.
- **Custom CSS**: Only in `src/index.css` for resets, scrollbars, focus, keyframes, or when a utility is not practical. Prefer `@layer components` or `@layer utilities` if adding custom utilities.
- **No duplicate tokens**: Use theme colors (e.g. `primary`, `gray-500`) instead of raw hex in classNames when a token exists.
- **Transitions**: Use `transition-all duration-200` or `duration-300 ease-out` for interactive elements. Design system specifies 300ms for UI, 500ms for heavier motion.
- **Focus**: All interactive elements must have a visible focus state (see Accessibility). Use `focus:ring-2 focus:ring-[#6C63FF]` (or accent token) with offset on background color where applicable.

---

## 11. Accessibility

- **Contrast**: Primary text on background ≥ 7:1 (AAA); secondary ≥ 4.5:1 (AA). Use design system foreground and muted colors.
- **Focus**: Visible 2px focus ring (accent color) with offset on all buttons, links, and form controls. Do not remove outline without replacing with a visible ring.
- **Touch targets**: Minimum 44×44px for interactive elements on touch devices. Use `min-h-[44px] min-w-[44px]` or equivalent padding (e.g. `p-3`).
- **Keyboard**: Support keyboard navigation; focus order and focus traps in modals must be correct.
- **Labels**: Associate labels with inputs (`htmlFor` / `id`); use `aria-label` or `aria-labelledby` for icon-only buttons.
- **Loading / disabled**: Expose state to assistive tech (`aria-busy`, `disabled`, etc.) and avoid removing focus in a way that traps users.

---

## 12. Responsive Design

- **Mobile-first**: Write base styles for small screens; use `sm:`, `md:`, `lg:` to enhance.
- **Breakpoints**: Use Tailwind defaults plus project `xs: 475px`, `xl3: 1280px`. `md:` = 768px, `lg:` = 1024px.
- **Layout**: Stack columns on mobile (e.g. 3-col → 1-col); reduce padding and font sizes on small screens (e.g. `p-16` → `p-8`, `text-7xl` → `text-5xl`).
- **Navigation**: Sticky header; sidebar collapses to hamburger below `lg`. Mobile menu must be usable with touch and keyboard.
- **Touch**: 44px minimum touch targets; avoid hover-only interactions for critical actions on mobile.

---

## 13. State, Data & APIs

- **Global state**: Redux (Redux Toolkit) in `src/store/`. Use slices and RTK Query for server state.
- **Server state**: Prefer RTK Query (`createApi`, `use*Query`, `use*Mutation`) for fetching and caching. Use hooks from `store/apis/*` and `store/hooks/*`.
- **Local UI state**: `useState` for modals, toggles, form draft state. Use `useEffect` for sync (e.g. closing sidebar on resize, refetch on mount).
- **Auth**: `useAuth()` and permission hooks (e.g. `useHasPermission`, `useEffectivePermissions`) from store/hooks. Protect routes via `ProtectedRoute` and `PermissionGate`.
- **Feature flags**: `FeatureFlagsProvider` and `useFeatureFlags()`; use `FeatureFlagRoute` to gate features by flag.

---

## 14. Imports, Exports & Dependencies

- **Component imports**: Prefer `@/` or relative paths consistently. Common components: `import { Button, Modal, Input } from "../common";` (or from `@/components/common`).
- **Barrel exports**: Use `common/index.ts` for common components and types; avoid deep imports from common (e.g. prefer `from "../common"` over `from "../common/Button"` unless needed to avoid circular deps).
- **Types**: Export prop types and shared types from the component file or a dedicated `types` file in the feature folder.
- **Third-party**: Add dependencies to `package.json` with a clear reason. Prefer existing stack (Tailwind, Lucide, RTK Query) over new libraries for the same need.
- **Entry**: `main.tsx` imports `index.css`, Ant Design reset, and sets up Provider, Toaster; keep it minimal.

---

## 15. Anti-Patterns (Do Not Do)

- **Hard hex shadows**: Do not use opaque hex for box-shadow; use RGBA for neumorphic shadows.
- **White card backgrounds in neumorphic UI**: Do not use `bg-white` for cards when the design system is neumorphic; use the same surface as page (`#E0E5EC`).
- **Flat buttons without depth**: In neumorphic screens, buttons must have shadow states (extruded/inset), not flat fills only.
- **Sharp corners**: Avoid `rounded-lg` alone for main containers in neumorphic design; use at least `rounded-2xl` or `rounded-[32px]`.
- **Low-contrast text**: Do not use `#8B95A5` or `#A0AEC0` for body text; use design system foreground/muted.
- **Missing focus states**: Do not remove or hide focus indicators on interactive elements.
- **Font loading**: Use `display=swap` for web fonts, not `display=block`.
- **Scattered magic numbers**: Prefer theme tokens and Tailwind scale over one-off pixel/hex values in components.
- **Mixing design systems**: Within a screen or flow, stick to one visual language (either legacy blue/gray or neumorphic), or clearly separate (e.g. auth vs app shell) by design.
- **Heavy Ant Design spread**: Do not introduce new Ant Design components broadly; prefer common components and Tailwind for new features unless justified.

---

## Summary Checklist for New Work

- [ ] File and folder names follow naming conventions.
- [ ] Component lives in the correct feature or `common` folder and is exported from barrel if shared.
- [ ] Props are typed; `className` and size/variant props are supported where appropriate.
- [ ] Styling uses Tailwind and design tokens; no raw hex/spacing when a token exists.
- [ ] Focus and contrast meet accessibility requirements; touch targets ≥ 44px where applicable.
- [ ] Layout is responsive (mobile-first, breakpoints used correctly).
- [ ] No anti-patterns (flat buttons where depth is required, white cards in neumorphic UI, missing focus, etc.).

---

*Last updated: March 2025. Align with product and design for any exception to these rules.*
