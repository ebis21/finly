# Hybrid Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve Finly's localStorage demo for signed-out users while authenticated users use Supabase and automatically import the local portfolio into an entirely empty cloud account.

**Architecture:** Keep authentication in `lib/auth.tsx`, move deterministic validation/mapping/migration decisions into testable helpers, and let `FinlyProvider` select the existing local adapter or Supabase from the current session. The account modal owns user-facing auth state; database mutations update React state only after a confirmed backend success.

**Tech Stack:** Next.js 14, React 18, TypeScript 5, Supabase JS v2, Vitest, Testing Library, localStorage.

## Global Constraints

- Preserve all existing uncommitted Claude Code changes; do not revert unrelated work.
- Signed-out users retain the current localStorage behavior and demo seed.
- Import local data only when transactions, goals, and assets in Supabase are all empty.
- Never delete local data after import and never merge two non-empty portfolios.
- Do not expose or commit real Supabase keys.
- Run tests, lint, and production build before completion.

---

### Task 1: Test foundation and pure hybrid-data rules

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `lib/hybrid-data.ts`
- Create: `lib/hybrid-data.test.ts`

**Interfaces:**
- Produces: `shouldImportLocalData(cloud: FinlyData, local: FinlyData): boolean`
- Produces: typed `TransactionRow`, `GoalRow`, `AssetRow` and `rowToTransaction`, `rowToGoal`, `rowToAsset`
- Produces: `toTransactionInsert`, `toGoalInsert`, `toAssetInsert`

- [ ] **Step 1: Install test and Supabase dependencies**

Run: `npm install @supabase/supabase-js && npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

Add scripts: `"test": "vitest run"` and `"test:watch": "vitest"`.

- [ ] **Step 2: Write failing rule and mapping tests**

Test that import is true only when every cloud collection is empty and local data contains at least one record. Test numeric Supabase fields, nullable category/note, description/title, target amounts, and timestamp/date conversion.

- [ ] **Step 3: Verify RED**

Run: `npm test -- lib/hybrid-data.test.ts`

Expected: FAIL because `lib/hybrid-data.ts` and its exports do not exist.

- [ ] **Step 4: Implement minimal typed helpers**

Use explicit row and insert interfaces. `shouldImportLocalData` must be equivalent to:

```ts
const cloudIsEmpty =
  cloud.transactions.length === 0 &&
  cloud.goals.length === 0 &&
  cloud.assets.length === 0;
const localHasData =
  local.transactions.length > 0 ||
  local.goals.length > 0 ||
  local.assets.length > 0;
return cloudIsEmpty && localHasData;
```

- [ ] **Step 5: Verify GREEN and commit**

Run: `npm test -- lib/hybrid-data.test.ts`

Expected: PASS.

Commit: `test: add hybrid Supabase data rules`

---

### Task 2: Authentication behavior and account-form validation

**Files:**
- Create: `lib/auth-utils.ts`
- Create: `lib/auth-utils.test.ts`
- Modify: `lib/auth.tsx`
- Modify: `components/Header.tsx`

**Interfaces:**
- Produces: `validateCredentials(email: string, password: string): string | null`
- Produces: `translateAuthError(message: string): string`
- Extends `useAuth()` with `user`, `loading`, `configured`, `signIn`, `signUp`, and `signOut`

- [ ] **Step 1: Write failing validation and translation tests**

Cover blank/invalid email, passwords shorter than six characters, valid credentials, invalid login, duplicate account, unconfirmed email, rate limiting, and an unknown backend error.

- [ ] **Step 2: Verify RED**

Run: `npm test -- lib/auth-utils.test.ts`

Expected: FAIL because the helper exports do not exist.

- [ ] **Step 3: Implement minimal helpers and connect AuthProvider**

Trim and lowercase the submitted e-mail. Reject invalid input before calling Supabase. Always translate returned auth errors and expose `isSupabaseConfigured` as `configured` through context.

- [ ] **Step 4: Build the account modal states**

Signed out and configured: show login/register tabs, e-mail/password fields, submit progress, inline errors, and confirmation guidance. Signed in: show e-mail and logout. Unconfigured: explain that local mode works and list the two required environment-variable names without displaying values.

- [ ] **Step 5: Verify GREEN and commit**

Run: `npm test -- lib/auth-utils.test.ts`

Expected: PASS.

Commit: `feat: add Supabase account controls`

---

### Task 3: Hybrid store selection and one-time empty-cloud import

**Files:**
- Create: `lib/cloud-store.ts`
- Create: `lib/cloud-store.test.ts`
- Modify: `lib/store.tsx`
- Modify: `components/AddTransactionSheet.tsx`
- Modify: `components/CategoryDashboard.tsx`
- Modify: `app/cele/page.tsx`
- Modify: `app/aktywa/page.tsx`

**Interfaces:**
- Produces: `loadCloudData(client): Promise<FinlyData>`
- Produces: `importLocalData(client, userId, local): Promise<FinlyData>`
- Produces CRUD functions returning `Promise<{ error: string | null }>`
- Consumes mapping and insert helpers from Task 1

- [ ] **Step 1: Write failing cloud-store tests**

With a small injected fake query adapter, verify that load throws on any table error, empty-cloud import inserts all local collections with `user_id`, and partial insert failure is surfaced rather than reported as success.

- [ ] **Step 2: Verify RED**

Run: `npm test -- lib/cloud-store.test.ts`

Expected: FAIL because `lib/cloud-store.ts` does not exist.

- [ ] **Step 3: Implement cloud operations with checked results**

Every Supabase call must inspect `error`. Deletes and updates must not mutate React state until the backend succeeds. Loads must not convert an error into an empty collection.

- [ ] **Step 4: Select local or cloud mode in FinlyProvider**

While auth is loading, retain the last stable state and expose loading. Without a user, subscribe to the existing local store and write all changes locally. With a user, load cloud data; if `shouldImportLocalData` is true, import the local snapshot, then reload cloud data. Keep local data unchanged.

- [ ] **Step 5: Handle stale async work and user-visible errors**

Ignore results from a previous user/session after cleanup. Expose a store-level error and retry action. Update callers to await mutations, keep forms open on failure, disable duplicate submits, and show the returned Polish error message.

- [ ] **Step 6: Verify GREEN and commit**

Run: `npm test -- lib/cloud-store.test.ts lib/hybrid-data.test.ts`

Expected: PASS.

Commit: `feat: add hybrid local and Supabase storage`

---

### Task 4: Documentation and full verification

**Files:**
- Modify: `context.txt`
- Modify if required by implementation: `README.md`

**Interfaces:**
- Documents the final user workflow and operational setup.

- [ ] **Step 1: Update project truth**

Change the MVP scope to local-plus-account cloud storage, add Supabase Auth/Database to the stack, document automatic import into an empty cloud account, and append a dated journal entry without rewriting earlier history.

- [ ] **Step 2: Run the entire automated test suite**

Run: `npm test`

Expected: all tests PASS with no unhandled rejections.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: exit code 0 and no ESLint errors.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: exit code 0 and successful Next.js compilation.

- [ ] **Step 5: Review repository state and commit**

Run: `git diff --check` and inspect `git status --short` plus the final diff. Confirm no `.env.local` or secret value is staged.

Commit: `docs: document hybrid Supabase mode`

- [ ] **Step 6: Manual handoff**

Remind the user to run `supabase/schema.sql` in Supabase SQL Editor and set the two public environment variables locally/Vercel. State that real registration and persistence require those external steps and were not claimed as verified without credentials.
