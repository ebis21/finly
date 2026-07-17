# Entry Gate and Empty Guest Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require every new visitor to choose authentication or an explicitly remembered guest mode, with an empty local portfolio for new users and existing Supabase data for accounts.

**Architecture:** Add a small localStorage-backed entry-choice module and an `EntryGate` component rendered before the application shell. Reuse a shared account form in both the gate and header, keep `AuthProvider` responsible for Supabase sessions, and retain the existing empty-cloud-only import rule in `FinlyProvider` while removing demo seeding.

**Tech Stack:** Next.js 14, React 18, TypeScript 5, Supabase JS v2, localStorage, Vitest, Testing Library.

## Global Constraints

- Do not change the Supabase database schema.
- Do not delete existing local or cloud data.
- A new browser profile starts with empty transactions, goals, and assets.
- Existing `finly-data-v1` data remains available in guest mode.
- Guest data imports only when all cloud collections are empty.
- Logout returns to the entry gate and does not delete financial data.
- Run tests, lint, and production build before completion.

---

### Task 1: Persisted entry-choice state

**Files:**
- Create: `lib/entry-choice.ts`
- Create: `lib/entry-choice.test.ts`

**Interfaces:**
- Produces: `readGuestChoice(): boolean`
- Produces: `rememberGuestChoice(): void`
- Produces: `clearGuestChoice(): void`
- Produces: `shouldShowEntryGate(authLoading: boolean, userPresent: boolean, guestChosen: boolean): boolean`

- [ ] **Step 1: Write failing unit tests**

Test that the gate is hidden while auth loads, hidden for a user, shown with neither user nor guest choice, and hidden for a remembered guest. With jsdom localStorage, test that remember/read/clear uses a dedicated key and does not touch `finly-data-v1`.

- [ ] **Step 2: Verify RED**

Run: `npm test -- lib/entry-choice.test.ts`

Expected: FAIL because `lib/entry-choice.ts` does not exist.

- [ ] **Step 3: Implement minimal functions**

Use a versioned key such as `finly-entry-choice-v1` with the value `guest`. Guard localStorage access so SSR returns false.

- [ ] **Step 4: Verify GREEN and commit**

Run: `npm test -- lib/entry-choice.test.ts`

Expected: PASS.

Commit: `test: add persisted guest entry choice`

---

### Task 2: Shared authentication form and full-screen gate

**Files:**
- Create: `components/AuthForm.tsx`
- Create: `components/EntryGate.tsx`
- Create: `components/EntryGate.test.tsx`
- Modify: `components/Header.tsx`
- Modify: `lib/auth.tsx`

**Interfaces:**
- Produces: `<AuthForm initialMode="signin" | "signup" onSuccess?: () => void />`
- Produces: `<EntryGate onContinueAsGuest: () => void />`
- Consumes: `useAuth()` and entry-choice functions from Task 1

- [ ] **Step 1: Write failing gate tests**

Render the gate with controlled auth context and verify visible Polish actions: `Zaloguj się`, `Utwórz konto`, and `Kontynuuj bez logowania`. Verify the guest callback and that submitting is disabled during an auth request.

- [ ] **Step 2: Verify RED**

Run: `npm test -- components/EntryGate.test.tsx`

Expected: FAIL because `EntryGate` does not exist.

- [ ] **Step 3: Extract and implement shared AuthForm**

Move the current sign-in/sign-up state, validation messages, confirmation message, and progress state from `Header.tsx` into `AuthForm.tsx`. Keep `Header` signed-in details and logout action, and render `AuthForm` for a guest who opens the account modal.

- [ ] **Step 4: Implement EntryGate**

Render a full viewport Finly card with login/register mode selection and a secondary guest action. During session loading render only a branded loading state. The gate must not render application-shell children behind it.

- [ ] **Step 5: Verify GREEN and commit**

Run: `npm test -- components/EntryGate.test.tsx lib/auth-utils.test.ts`

Expected: PASS.

Commit: `feat: add authentication entry gate`

---

### Task 3: Gate the shell and remove demo seed

**Files:**
- Create: `components/AppEntry.tsx`
- Create: `lib/empty-data.test.ts`
- Modify: `app/layout.tsx`
- Modify: `lib/store.tsx`
- Modify: `components/Header.tsx`

**Interfaces:**
- Produces: `<AppEntry>{application shell}</AppEntry>`
- Changes local fallback from demo seed to `{ transactions: [], goals: [], assets: [] }`
- Consumes: `shouldShowEntryGate`, guest-choice storage, and `useAuth()`

- [ ] **Step 1: Write a failing empty-start regression test**

Extract/export `createEmptyData(): FinlyData` and assert that all three collections are empty and independent calls do not share mutable arrays.

- [ ] **Step 2: Verify RED**

Run: `npm test -- lib/empty-data.test.ts`

Expected: FAIL because `createEmptyData` does not exist.

- [ ] **Step 3: Implement AppEntry and layout gating**

Read the remembered guest choice after mount. Render `EntryGate` until a session or guest decision exists. On guest continuation, persist the choice and render the shell. On logout, clear the choice before/with sign-out so the gate returns.

- [ ] **Step 4: Replace demo seed with new empty data**

Use a fresh empty object when no `finly-data-v1` record exists. Preserve and load any existing local record unchanged. Keep `shouldImportLocalData` behavior so only real guest-created data migrates to an empty cloud account.

- [ ] **Step 5: Verify GREEN and commit**

Run: `npm test -- lib/empty-data.test.ts lib/entry-choice.test.ts lib/hybrid-data.test.ts`

Expected: PASS.

Commit: `feat: start new users with an empty portfolio`

---

### Task 4: Documentation, full verification, and deployment handoff

**Files:**
- Modify: `README.md`
- Modify: `context.txt`

**Interfaces:**
- Documents the entry gate, remembered guest mode, empty initial state, and unchanged migration rule.

- [ ] **Step 1: Update documentation**

Describe the three entry actions, empty local start, preservation of existing local data, and logout returning to the gate. Append a dated journal entry without rewriting prior history.

- [ ] **Step 2: Run all tests**

Run: `npm test`

Expected: all tests PASS with zero failures.

- [ ] **Step 3: Run lint and build**

Run separately: `npm run lint` and `npm run build`

Expected: ESLint has no errors and Next.js finishes type checking plus static generation.

- [ ] **Step 4: Review secrets and repository state**

Run: `git diff --check`, `git status --short`, and verify `.env.local` remains ignored. Do not stage `etap-deploy.md` or `etap2-prompt.md`.

- [ ] **Step 5: Commit and push after verification**

Commit: `docs: document authenticated entry flow`

Push `master` to the existing `origin` only after the final verification succeeds, allowing Vercel to deploy automatically.
