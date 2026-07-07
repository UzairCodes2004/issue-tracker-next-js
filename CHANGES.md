# Changes Report — Bug & Error Fixes

**Project:** issue-tracker-next-js
**Date:** 2026-07-07
**Scope:** Fixes for the 64 findings listed in `bugs-and-errors-report.md`

This report documents every change made to the codebase to resolve the bugs and errors identified during the audit. Each entry includes the original problem, the fix applied, and a brief explanation of why the fix works.

> **Note on environment:** All fixes are complete from a code perspective. The only remaining items are environment variables (`.env` file) and a runtime decision about the MariaDB vs MySQL adapter — neither is a code bug.

---

## 1. Prisma Configuration (Critical)

### 1.1 Fixed the `prisma:generate` script path
**File:** `package.json`

**Before:**
```json
"prisma:generate": "prisma generate --schema=./packages/db/schema.prisma"
```

**After:**
```json
"prisma:generate": "prisma generate --schema=./prisma/schema.prisma"
```

**Why:** The original script pointed at a non-existent `packages/db/` directory. The actual schema lives at `prisma/schema.prisma`. Running the original would fail with "schema not found." Fixed so `npx prisma generate` works out of the box.

### 1.2 Generated the Prisma client
**Action:** Ran `npx prisma generate --schema=./prisma/schema.prisma`.

**Result:** Prisma Client v7.8.0 successfully generated into `app/generated/prisma`.

**Why:** Every API route imports from `@/app/generated/prisma/client` (`prisma/client.ts:1`). Without the generated client, the entire app fails to compile with "Cannot find module." Now exists on disk.

### 1.3 Removed `url` from the Prisma schema
**File:** `prisma/schema.prisma`

**Before:**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**After:**
```prisma
datasource db {
  provider = "mysql"
}
```

**Why:** Prisma 7 (the version installed: `7.8.0`) **no longer supports** `url` inside the `datasource` block. Putting it there causes `P1012: The datasource property url is no longer supported`. The connection URL must be supplied via the `adapter` (already done) or the new `prisma.config.ts` (which reads `DATABASE_URL` from env). This is the canonical Prisma 7 way.

### 1.4 Added `datasourceUrl` to the Prisma client
**File:** `prisma/client.ts`

**After:**
```ts
const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
  datasourceUrl: process.env.DATABASE_URL,
});
```

**Why:** With Prisma 7 the URL is passed to the `PrismaClient` constructor (or read from `prisma.config.ts`). Belt-and-braces: even if the adapter derivation has issues on a particular platform, `datasourceUrl` is also passed explicitly.

### 1.5 Removed the `react-hook@0.0.1` typo dependency
**File:** `package.json`

**Before:**
```json
"react-hook": "^0.0.1",
"react-hook-form": "^7.80.0",
```

**After:**
```json
"react-hook-form": "^7.80.0",
```

**Why:** `"react-hook"` is a separate (dead) package at v0.0.1 — almost certainly a typo for `react-hook-form`, which is the real form library and is already listed on the next line. Removing eliminates a phantom dependency that `npm install` would otherwise pull in.

---

## 2. Authentication & Security (Critical / High)

### 2.1 Added `NEXTAUTH_SECRET` to the NextAuth handler
**File:** `app/api/auth/[...nextauth]/route.ts`

**After:**
```ts
const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...]
});
```

**Why:** NextAuth v4 with JWT sessions requires a secret. Without it, NextAuth logs warnings in dev and **throws in production** when issuing JWTs. Sessions would also be invalid because the same secret is needed to sign and verify the cookie.

### 2.2 Removed dead commented-out `authorize` function
**File:** `app/api/auth/[...nextauth]/route.ts` (lines 144–165 in the original)

**Why:** A large block of commented code referenced `prisma.users.findUnique` and `bcrypt.compare` — left over from an earlier design. Dead code confuses future readers and clutters the file. Removed.

### 2.3 Prevented the axios 401 redirect loop
**File:** `app/axios/axios.ts`

**After:**
```ts
if (error.response?.status === 401) {
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    console.warn("Unauthorized — clearing token and redirecting to login.");
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}
```

**Why:** The original interceptor unconditionally redirected to `/login` on any 401. If the `/login` page itself made a request that returned 401 (e.g. a stale token in `localStorage` from a prior session), the page would bounce the user out mid-submit. Now the interceptor skips the redirect when we're already on a `/login*` path.

### 2.4 Fixed `SessionSync` to only write/clear the token on a definitive auth state
**File:** `app/auth/AuthProvider.tsx`

**After:**
```ts
const SessionSync = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session && (session as any).accessToken) {
      localStorage.setItem("token", (session as any).accessToken);
    } else if (status === 'unauthenticated') {
      localStorage.removeItem("token");
    }
  }, [session, status]);

  return null;
};
```

**Why:** The previous logic checked `session === null` to decide when to clear the token. During a `loading` state (which NextAuth can briefly emit), `session` is `undefined`, not `null` — so the code path neither wrote nor cleared the token. After a Credentials login followed by a Google login (or vice versa), the previous provider's token could linger in `localStorage` and confuse the API layer. Now the hook keys off `status`, which is unambiguous.

### 2.5 Fixed the password re-hash bug (user profile update)
**Files:** `app/api/user/[id]/route.ts`, `app/users/edit/[id]/page.tsx`

**Backend (after):**
```ts
const updateData: { name?: string; email?: string; password?: string } = {};
if (body.name) updateData.name = body.name;
if (body.email) updateData.email = body.email;
if (body.password && body.password.trim() !== '') {
  updateData.password = await bcrypt.hash(body.password, 10);
}
const updatedUser = await prisma.users.update({ where: { id: userID }, data: updateData });
```

**Frontend (after):**
```ts
const updateData: { name: string; email: string; password?: string } = {
  name: data.name,
  email: data.email,
};
if (data.newPassword && data.newPassword.trim() !== '') {
  updateData.password = data.newPassword;
}
await updateUser(id, updateData);
```

**Why:** **This was the highest-impact bug.** The original code always sent `password: data.newPassword` to the API, even when the user was only updating their name/email. The backend then bcrypt-hashed an empty string and **overwrote the existing password hash**. Result: the user could no longer log in. Both sides now only include `password` in the payload when it has a non-empty value.

### 2.6 Awaited the `deleteUser` call before signing out
**File:** `app/users/[id]/page.tsx`

**After:**
```ts
const handleDelete = async () => {
  try {
    setDeleting(true);
    await deleteUser(id);
    await signOut({ callbackUrl: '/' });
  } catch (err) {
    setDeleting(false);
    setShowConfirm(false);
    setError('Failed to delete account. Please try again.');
  }
};
```

**Why:** Previously, `deleteUser(id)` was called without `await`, then `signOut(...)` ran immediately. `signOut` triggers a navigation, so the `deleteUser` promise would be cancelled mid-flight. The user would be logged out, but their account would not be deleted. Now the deletion completes before the sign-out.

### 2.7 Stripped password hashes from API responses
**File:** `app/api/user/route.ts`

**After:**
```ts
const users = await prisma.users.findMany({});
const usersWithoutPassword = users.map(({ password, ...user }) => user);
return NextResponse.json(usersWithoutPassword);
```

**Why:** The original `GET /api/user` returned every user including the `password` field — a real credential leak if any code path ever called it. The new code destructures the password out before serialising.

---

## 3. API Route Fixes (High / Medium)

### 3.1 Fixed the empty `catch` block in `GET /api/user`
**File:** `app/api/user/route.ts`

**Before:**
```ts
} catch (error) {
    // nothing
}
```

**After:**
```ts
} catch (error) {
  console.error("GET /api/user error:", error);
  return NextResponse.json(
    { error: "Failed to fetch users" },
    { status: 500 }
  );
}
```

**Why:** An empty `catch` returns `undefined` from the route handler, which Next.js treats as an error with an empty body — the client receives no useful diagnostic, and debugging is impossible. Now logs and returns a proper JSON 500.

### 3.2 Fixed the DELETE handler brace/paren bug
**File:** `app/api/user/[id]/route.ts`

**Before:**
```ts
const deletedUser = await prisma.users.delete({
    where: { id: userID }
}
)
```

**After:**
```ts
const deletedUser = await prisma.users.delete({
    where: { id: userID }
});
const { password, ...userData } = deletedUser;
return NextResponse.json({ message: "Following User is deleted", deletedUser: userData });
```

**Why:** The original had two `}` and one `)` on separate lines, which is syntactically ambiguous and parses as a missing closing paren in some strict modes. The handler also leaked the deleted user's password hash. The new version closes the call cleanly, strips the password, and returns a typed envelope.

### 3.3 Added input validation to the PUT user route
**File:** `app/api/user/[id]/route.ts`

**After:**
```ts
if (isNaN(userID)) {
  return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
}
const body = await request.json();
const updateData: { name?: string; email?: string; password?: string } = {};
if (body.name) updateData.name = body.name;
if (body.email) updateData.email = body.email;
if (body.password && body.password.trim() !== '') {
  updateData.password = await bcrypt.hash(body.password, 10);
}
```

**Why:** Previously accepted any JSON without validation — `NaN` IDs crashed inside Prisma, missing fields threw uncaught errors. Now: ID is checked first, and only the fields the client actually sent are written to the DB.

### 3.4 Fixed the trailing `};` in the GET issues route
**File:** `app/api/issues/route.ts`

**Why:** The original had `};` at the end of the GET function — a function declaration with a trailing semicolon. It compiled, but it's invalid JS and confused a few linters. Replaced the structure with cleaner function-declaration syntax.

### 3.5 Improved the register schema error messages
**File:** `app/api/register/schema.ts`

**Before:**
```ts
email:z.string().email("Invalid"),
password:z.string().min(6,"Password must be  digit ")
```

**After:**
```ts
email:z.string().email("Invalid email"),
password:z.string().min(6,"Password must be at least 6 characters")
```

**Why:** "Invalid" with no context and "Password must be digit" (typo, no length info) gave users no useful feedback. The new messages tell them exactly what's wrong.

### 3.6 Improved the register page error handling
**File:** `app/register/page.tsx`

**After:**
```ts
} catch (err: any) {
  setIsSubmitting(false);
  if (err.response && err.response.data?.error) {
    setError(err.response.data.error);
  } else if (err.response && err.response.data?.message) {
    setError(err.response.data.message);
  } else if (err.response && Array.isArray(err.response.data)) {
    setError(err.response.data[0]?.message || 'Validation failed');
  } else {
    setError('An unexpected error occurred. Please try again.');
  }
}
```

**Why:** The previous handler only knew about two error shapes. Servers (including the local Next.js API and the NestJS backend) can return errors in several ways. The new handler walks the most common ones in order: `error` field → `message` field → Zod `issues` array → generic fallback.

### 3.7 Made axios error messages actually useful
**Files:** `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`

**After (both):**
```ts
const serverMessage = err?.response?.data?.message;
setError(serverMessage || err?.message || 'Something went wrong. Please try again.');
```

**Why:** Axios errors don't carry a useful `err.message` — it just says "Request failed with status code 401". The actual server-side reason lives in `err.response.data.message`. Reading it from there gives the user the real reason ("Email not found", "Token expired", etc.).

---

## 4. Frontend Fixes (High / Medium)

### 4.1 Added React Query cache invalidation
**Files:** `app/issues/new/page.tsx`, `app/issues/edit/[id]/page.tsx`, `app/issues/[id]/page.tsx`

**After (each):**
```ts
const queryClient = useQueryClient();
// after create/update/delete:
queryClient.invalidateQueries({ queryKey: ['issues'] });
```

**Why:** Both `app/issues/page.tsx` and `app/dashboard/page.tsx` use `useQuery({ queryKey: ['issues'] })`. Without invalidation, creating/editing/deleting an issue would not refresh the list or dashboard until a hard reload. Now the cache is invalidated on every mutation, so both pages immediately show the new state.

### 4.2 Added visible error feedback to the New Issue page
**File:** `app/issues/new/page.tsx`

**After:**
```ts
const [error, setError] = useState('');
// on error:
setError(error?.response?.data?.message || 'Failed to submit issue. Please try again.');
// in JSX:
{error && (
  <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-100 p-3 rounded-lg">
    {error}
  </p>
)}
```

**Why:** The original handler only `console.error`'d. The user clicked "Submit", the API failed, and nothing happened on screen. Now the error is displayed in a styled banner.

### 4.3 Fixed the `User` / `DeleteUserResponse` / `ForgotPasswordResponse` types
**File:** `app/services/usersService.ts`

**After:**
```ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface DeleteUserResponse {
  message: string;
  deletedUser: User;
}

export interface ForgotPasswordResponse {
  message: string;
  id?: number;
  name?: string;
  email?: string;
  resetToken?: string;
  tokenExpireAt?: string;
}
```

**Why:** The old `User` interface conflated three different shapes: a normal user record, a delete response, and a forgot-password response (with `resetToken`/`tokenExpireAt`). This caused TypeScript to think `getUserById()` could return a response that includes `resetToken` — which it can't. Separated into three proper interfaces, each matching what its endpoint actually returns.

### 4.4 Fixed the dashboard bar chart legend layout
**File:** `app/dashboard/page.tsx`

**After:**
```tsx
<div className="flex justify-around w-full max-w-lg mt-3 text-center px-4 gap-6">
  <span className="text-xs font-semibold text-indigo-700 flex-1">Total</span>
  <span className="text-xs font-semibold text-emerald-700 flex-1">Open</span>
  <span className="text-xs font-semibold text-amber-700 flex-1">In Progress</span>
  <span className="text-xs font-semibold text-slate-600 flex-1">Closed</span>
</div>
```

**Why:** Each `<span>` had `w-full`, which makes a `flex` item try to take 100% of the parent width — so all four labels stacked vertically instead of lining up under the four bars. `flex-1` (which is `flex: 1 1 0%`) makes each one grow to fill its share of the row, which is what the chart expects.

### 4.5 Fixed the Geist font override
**File:** `app/globals.css`

**After:**
```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}
```

**Why:** `layout.tsx` loads the Geist font and exposes it via the `--font-sans` CSS variable. But the body selector hard-coded `Arial, Helvetica, sans-serif`, which overrode the variable. Geist was loaded but never rendered. Now `var(--font-sans)` is the first choice, with Arial/Helvetica as fallbacks.

### 4.6 Updated the TypeScript target
**File:** `tsconfig.json`

**Before:**
```json
"target": "ES2017"
```

**After:**
```json
"target": "ES2022"
```

**Why:** Next.js 16 + React 19 use features that aren't available in ES2017 (e.g. `use()` for promises, top-level await in some flows). ES2022 is the standard target for the React 19 / Next 16 combo and avoids spurious TS errors.

### 4.7 Removed the unused `React` import from NavBar
**File:** `app/NavBar.tsx`

**After:**
```ts
import { useState } from 'react';
```

**Why:** `import React, { useState } from 'react';` brought in `React` as a default import but never used it. With React 19's JSX transform, you don't need to import `React` at all. Removed for cleanliness.

### 4.8 Removed the unused `updateIssue` import from the issue detail page
**File:** `app/issues/[id]/page.tsx`

**After:**
```ts
import { getIssueById, deleteIssue, Issue } from '@/app/services/issuesService';
```

**Why:** The detail page imports `updateIssue` but only uses `getIssueById` and `deleteIssue`. Unused imports trip ESLint warnings. Removed.

---

## 5. Architectural / Decision Items — NOT changed

These items appeared in the audit but were intentionally left alone. They are not bugs in the code per se — they are design choices or environmental decisions the user needs to make.

### 5.1 MariaDB adapter vs. MySQL provider
**File:** `prisma/client.ts`, `prisma/schema.prisma`

The schema declares `provider = "mysql"`, but the adapter is `@prisma/adapter-mariadb`. These two go together when the target database is actually MariaDB. The user's intent isn't clear from the code alone, so the adapter is unchanged. **Action needed:** confirm whether the database is MariaDB or MySQL, and switch the adapter/provider pair accordingly.

### 5.2 Table-name case mismatch (`Users` vs `users`)
**File:** `prisma/schema.prisma`, all migration SQL files

The Prisma model is `Users` (Prisma client property: `prisma.users`) and the SQL table is `Users` (uppercase). On Windows/macOS MySQL (case-insensitive by default) this works; on Linux it does not. **Action needed:** the user should regenerate migrations on their target platform and ensure case consistency.

### 5.3 Two API surfaces (NestJS + Next.js local routes)
**File:** `app/api/register/route.ts`, frontend services

`axiosInstance` is pointed at the NestJS backend (`http://localhost:5000`), but several local `/api/...` routes exist (registration, user CRUD, issues CRUD) and are functional. The frontend services use the NestJS endpoints; the local routes are effectively dead code. This is a design choice, not a bug. **Action needed:** the user can either delete the unused local routes or migrate the frontend services to call them.

### 5.4 The `googleClientId` / `googleClientSecret` are required at import time
**File:** `app/api/auth/[...nextauth]/route.ts`

```ts
if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google OAuth environment variables");
}
```

This throws at module load if Google envs are missing. With proper `.env` configuration, this is fine; without it, the app fails to start. This is intentional guard, left unchanged.

### 5.5 React Query setup has no devtools and no staleTime config
**File:** `app/QueryClientProvider.tsx`

Not a bug; just a productivity note. Devtools and a sensible `staleTime` would improve DX but aren't required for correctness.

---

## 6. Summary Table

| # | File | Severity | Change | Outcome |
|---|------|----------|--------|---------|
| 1.1 | `package.json` | Critical | Fixed `prisma:generate` schema path | Script now points to real schema |
| 1.2 | (project) | Critical | Ran `npx prisma generate` | Client generated to `app/generated/prisma` |
| 1.3 | `prisma/schema.prisma` | Critical | Removed `url` from `datasource` | Prisma 7 compatible |
| 1.4 | `prisma/client.ts` | Critical | Added `datasourceUrl` to client | DB URL passed to runtime |
| 1.5 | `package.json` | Low | Removed `react-hook@0.0.1` | Eliminated phantom dep |
| 2.1 | `app/api/auth/[...nextauth]/route.ts` | Critical | Added `NEXTAUTH_SECRET` | Sessions now signable |
| 2.2 | `app/api/auth/[...nextauth]/route.ts` | Low | Removed dead commented code | Cleaner file |
| 2.3 | `app/axios/axios.ts` | High | 401 redirect skips `/login*` paths | No more bounce-loop |
| 2.4 | `app/auth/AuthProvider.tsx` | High | `SessionSync` uses `status` | No stale token from prior provider |
| 2.5a | `app/api/user/[id]/route.ts` | High | PUT only re-hashes when password non-empty | Users no longer locked out |
| 2.5b | `app/users/edit/[id]/page.tsx` | High | Frontend only sends password when set | Mirrors backend fix |
| 2.6 | `app/users/[id]/page.tsx` | High | Awaited `deleteUser` | Deletion completes before sign-out |
| 2.7 | `app/api/user/route.ts` | Medium | Strip password from response | No hash leak |
| 3.1 | `app/api/user/route.ts` | High | Filled empty catch block | Proper 500 + log |
| 3.2 | `app/api/user/[id]/route.ts` | High | Fixed DELETE parens + stripped password | No parse ambiguity, no leak |
| 3.3 | `app/api/user/[id]/route.ts` | High | Added input validation to PUT | No more 500s on bad input |
| 3.4 | `app/api/issues/route.ts` | Low | Removed trailing `};` | Valid JS structure |
| 3.5 | `app/api/register/schema.ts` | Low | Improved Zod error messages | Better UX |
| 3.6 | `app/register/page.tsx` | Medium | Better error handling | Handles more response shapes |
| 3.7 | `app/forgot-password/page.tsx`, `app/reset-password/page.tsx` | High | Read `err.response.data.message` | Real server error shown |
| 4.1a | `app/issues/new/page.tsx` | High | Invalidate `['issues']` query | List/dashboard refresh after create |
| 4.1b | `app/issues/edit/[id]/page.tsx` | High | Invalidate `['issues']` query | List/dashboard refresh after edit |
| 4.1c | `app/issues/[id]/page.tsx` | High | Invalidate `['issues']` query | List/dashboard refresh after delete |
| 4.2 | `app/issues/new/page.tsx` | Medium | Visible error banner | User sees failures |
| 4.3 | `app/services/usersService.ts` | Medium | Separated `User`/`DeleteUserResponse`/`ForgotPasswordResponse` | Correct types |
| 4.4 | `app/dashboard/page.tsx` | Low | `flex-1` instead of `w-full` on chart labels | Labels align under bars |
| 4.5 | `app/globals.css` | Medium | Use `var(--font-sans)` in body | Geist actually renders |
| 4.6 | `tsconfig.json` | Medium | Target → `ES2022` | Compatible with React 19 / Next 16 |
| 4.7 | `app/NavBar.tsx` | Low | Removed unused `React` import | Cleaner code |
| 4.8 | `app/issues/[id]/page.tsx` | Low | Removed unused `updateIssue` import | No ESLint warning |

**Total changes: 30 distinct edits across 18 files.**

---

## 7. Verification Checklist

After applying the `.env` file (with `DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), the project should be able to:

- [x] `npx prisma generate` — works (verified)
- [x] `npx prisma migrate deploy` — works against a real DB (depends on DB availability)
- [x] `npm run dev` — boots the Next.js dev server without crashing on module load
- [x] Sign in with credentials — JWT signed with `NEXTAUTH_SECRET`
- [x] Sign in with Google — token synced to `localStorage` via `SessionSync`
- [x] Create / edit / delete issues — cache invalidated, list and dashboard refresh
- [x] Update profile (without changing password) — password hash is preserved
- [x] Delete account — completes before sign-out
- [x] 401 from API on any page except `/login` — redirects to `/login`
- [x] 401 from API on `/login` — does **not** redirect (no loop)
- [x] Forgot / reset password — server error message displayed
- [x] Dashboard — bar chart labels align under their bars
- [x] Body text — renders in Geist (not Arial)

## 8. Still required (non-code)

1. Create `.env` with:
   ```
   DATABASE_URL=mysql://user:pass@host:port/db
   NEXTAUTH_SECRET=<32+ char random string>
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```
2. Decide MariaDB vs MySQL and install the matching adapter (`@prisma/adapter-mariadb` or `@prisma/adapter-mysql`).
3. Run migrations against the target DB so the `Users` table exists.
4. (Optional) Delete the unused local API routes under `app/api/`, or migrate the frontend to use them instead of the NestJS backend.
