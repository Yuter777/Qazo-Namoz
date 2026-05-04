# CLAUDE.md

## Project Overview
This project is a **Qazo-Namoz tracker**: users record missed (qazo) prayers, track progress, and complete them in an ordered way.

## Goals
- Track qazo prayer counts daily.
- Provide a simple, clear, and motivating dashboard.
- Keep a mobile-first experience.
- Deliver consistent UX in both **Light** and **Dark** modes.
- Ensure each user sees only their own account-based statistics.

## Auth & Backend (Firebase)
- Use **Firebase** as the backend.
- Auth must support reliable **Google Sign in / Sign up**.
- Every user must only access data linked to their own UID.
- Prayer completion status (done/pending) must be read from and saved to Firebase.
- Every tracking record must include a **timestamp**.

## Design Direction (Notion-like + Element Plus)
The UI should be minimal, clean, and focused (Notion-like), while using **Element Plus** as the main component base.

### 1) Visual Principles
- Use generous white space.
- Use soft borders (`rounded-xl` / `rounded-2xl`) and subtle dividers.
- Avoid heavy shadows; use light shadows (`shadow-sm`) only.
- Keep spacing rhythm consistent: 4 / 8 / 12 / 16 / 24 / 32.
- Keep custom styling over Element Plus minimal.

### 2) Colors (Light + Dark)
- **Light**:
  - Background: `#FAFAF9` / `#FFFFFF`
  - Primary text: `#111827`
  - Secondary text: `#6B7280`
- **Dark**:
  - Background: `#0B0F19` / `#111827`
  - Primary text: `#F3F4F6`
  - Secondary text: `#9CA3AF`
- Accent colors (both themes):
  - Success: `#22C55E`
  - Info/In-progress: `#3B82F6`
  - Warning: `#F59E0B`

### 3) Typography
- Use simple sans-serif (Inter/System UI).
- Keep headings clear and body text easy to read.
- Ensure one primary CTA is clearly visible per screen.
- Keep copy simple and user-friendly.

### 4) Component Style (Element Plus only)
- Main UI components should be based on **Element Plus**.
- Card-based layout (`el-card`).
- Buttons (`el-button`):
  - Primary: filled with clear contrast.
  - Secondary: neutral with border.
- Inputs (`el-input`, `el-select`, `el-date-picker`): large click target, clear labels, subtle border.
- Lists/Tables (`el-table`): no zebra required; use spacing and dividers.
- Feedback (`el-alert`, `el-message`, `el-skeleton`) should follow one consistent style.

### 5) UX Rules
- Keep flows short (add, edit, mark done).
- Show key metrics at the top:
  - Total qazo
  - Completed today
  - Remaining
- Empty states should include useful helper text.
- Keep loading indicators minimal (skeleton/spinner).
- Dark mode toggle should be visible in Header or Profile.

## Qazo Completion Order (Done order)
The app should clearly enforce this completion sequence:
1. **Bomdod farz**
2. **Peshin farz**
3. **Asr farz**
4. **Shom farz**
5. **Xufton farz**
6. **Vitr qazo**

## Recommended Main Pages
- **Dashboard**: progress, today’s plan, quick add.
- **Plan/Tracker**: daily/weekly completed entries with date-time.
- **Profile**: account, language, goals, theme (light/dark).
- **Info**: short onboarding and usage guide.

## Frontend Technical Direction
- Continue with Vue 3 + Composition API.
- UI framework: **Element Plus**.
- State management: **Pinia** (global state, user settings, theme, stats cache).
- Backend integration: Firebase Auth + Firestore/Realtime Database.
- Tailwind can be used for layout/utilities, but core UI components should remain Element Plus based.

## Store Architecture (Pinia)
- `useAuthStore`:
  - Google sign in/sign up
  - currentUser, uid, auth status
- `usePrayerStore`:
  - qazo entries (done/pending)
  - tracking based on done order
  - date-time based records
- `useUiStore`:
  - theme (`light | dark`)
  - loading states
  - global notifications

## Minimal Data Model
Each record should include:
- `userId`
- `prayerType` (`bomdod`, `peshin`, `asr`, `shom`, `xufton`, `vitr`)
- `status` (`done` or `pending`)
- `trackedAt` (timestamp)
- `createdAt`, `updatedAt`

## Content & Language
- Default language: Uzbek.
- RU/EN translations should be complete and semantically consistent through i18n.
- Religious terms must be written respectfully.
- User-facing text should be short, simple, and clear.

## Done Criteria (UI + Data)
A feature is considered done when:
1. Layout works on both mobile and desktop.
2. Minimal Notion-like style is preserved.
3. Element Plus components are used consistently.
4. Dark mode readability and contrast are maintained.
5. Google Sign in/Sign up works reliably.
6. Users can only view and save their own data.
7. Qazo order is preserved: bomdod → peshin → asr → shom → xufton → vitr.
8. Text is managed with i18n keys.
9. Loading/empty/error states are implemented.
10. State is centralized via Pinia stores.
