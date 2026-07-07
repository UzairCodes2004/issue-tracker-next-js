# Codebase Audit Report — issue-tracker-next-js

**Project:** Next.js 16 + NextAuth + Prisma issue tracker with NestJS backend at `http://localhost:5000`.

**Date:** 2026-07-07
**Status:** Read-only audit — no files modified.

---

## 🔴 CRITICAL — Will break runtime or data integrity

### 1. Prisma client has not been generated
- `prisma/client.ts:1` imports from `@/app/generated/prisma/client` and `package.json:10` has `prisma:generate` script.
- **But `app/generated/` directory does not exist** on disk and `node_modules/` is also missing. The build will fail immediately with "Cannot find module '@/app/generated/prisma/client'".
- The project also imports `@/app/generated/prisma` indirectly — without running `npm install && npx prisma generate`, nothing compiles.

### 2. MariaDB adapter used against MySQL provider
- `prisma/schema.prisma:13` declares `provider = "mysql"`.
- `prisma/client.ts:2` imports `PrismaMariaDb` from `@prisma/adapter-mariadb`.
- `package.json:13` includes `@prisma/adapter-mariadb`, but no `adapter-mysql` package.
- **The adapter must match the provider** (e.g. `@prisma/adapter-mariadb` is for MariaDB, not MySQL). Even with MariaDB, the schema explicitly says `mysql`, which is a mismatch.

### 3. Prisma model name vs. table name mismatch
- `prisma/schema.prisma:35` defines model `Users` (Prisma client property is `prisma.users`).
- Migration `20260623144027_updated/migration.sql` creates the actual table as **`Users`** (uppercase). MySQL on case-sensitive filesystems (Linux) will treat `Users` and `users` differently. On macOS/Windows default (case-insensitive) it works, but on production Linux it would not.
- All app code uses `prisma.users` (lowercase) — combined with the table name `Users` it depends on platform case-folding.

### 4. `datasource db` is missing `url`
- `prisma/schema.prisma:12-14`:
  ```
  datasource db {
    provider = "mysql"
  }
  ```
- No `url = env("DATABASE_URL")`. Prisma will fail to instantiate at runtime. The URL is set in `prisma.config.ts` for the CLI, but the generated client also needs it in the schema.

### 5. JWT secret not configured
- `app/api/auth/[...nextauth]/route.ts` calls `NextAuth({...})` with **no `secret` option** and no `NEXTAUTH_SECRET` reference.
- In production this throws. Even in dev, NextAuth v4 with JWT sessions needs a secret (it logs a warning). Also missing `NEXTAUTH_URL`.

### 6. Auth/middleware race on protected routes
- `middleware.ts` runs `withAuth` against `/dashboard` and `/issues/:path*`. But `app/page.tsx` redirects authenticated users **client-side** (`useEffect` calls `router.replace('/dashboard')`). On the very first paint after login, the home page renders briefly before the effect runs — but the `middleware` will block `/dashboard` until the JWT cookie is set, and NextAuth's JWT cookie is only set *after* a `signIn` round-trip. Could produce a flash-loop on first login.

### 7. `prisma.user` (singular) used in migrations
- `prisma/migrations/20260623081532_created/migration.sql:6` and other migrations use the table name `Issue` (correct) but `User` (singular). The Prisma model is now `Users` (plural), and migration `20260623144027_updated` drops the old `user` table — **but the foreign key added in `20260624133907_added` references `Users(id)`** while the table column points at `issue` (lowercase). With case-insensitive defaults this *seems* to work, on a strict DB it will not.

---

## 🟠 HIGH — Logic bugs / broken features

### 8. `axios.ts` interceptor will infinite-loop on 401
- `app/axios/axios.ts:46`:
  ```
  window.location.href = "/login";
  ```
  On the `/login` page, if the request still gets a 401 (e.g. invalid token in localStorage from a prior session), the response interceptor will redirect again, bouncing the user out of the login page mid-submit.

### 9. `axios.ts` reads `localStorage` during render in SSR
- The request interceptor checks `typeof window !== "undefined"`, so it is *guarded*, **but** `withCredentials: true` plus the localStorage-attached token is duplicated state — NextAuth already has the token in its session. Two sources of truth. The login flow stores the token in `localStorage` via `SessionSync`; if those go out of sync (token rotated server-side), the API call uses a stale token.

### 10. `forgot-password/page.tsx:25` and other places read `err.message` from Axios errors
- ```
  setError(err.message || 'Something went wrong. Please try again.');
  ```
- Axios errors have a useful message at `err.response.data.message`, not `err.message` (which is just `"Request failed with status code 401"`). Same pattern in `reset-password/page.tsx:56`. Users will see a generic "Request failed with status code 401" instead of the server's actual error.

### 11. `SessionSync` in `auth/AuthProvider.tsx` clobbers token on every render
- The `useEffect` runs whenever `session` changes. On a normal page render where `session` is *unchanged*, the effect doesn't re-run. But because `useSession` returns a **new object reference** on every render, the `useEffect` dependency `[session]` may still see it as the same value. The bigger issue: when `session === null` (unauthenticated), the code removes the token. But during a sign-out, NextAuth can briefly emit `loading` state — fine. **However**, when a Google user has no `accessToken` set in the session, the `if` branch is skipped but the `else if (session === null)` branch is also skipped, leaving stale `localStorage` token from a prior credentials login. Mixed-provider sessions share storage.

### 12. `app/users/[id]/page.tsx:39` — missing `await`
- ```
  deleteUser(id)
  await signOut({ callbackUrl: '/' });
  ```
  `deleteUser` returns a Promise that is **not awaited**. If it fails, the user is still signed out and the account is not deleted. Also, `signOut` redirects immediately — there's no guarantee the deletion completed.

### 13. `register/page.tsx:30` — registers via frontend call, but `app/api/register/route.ts` uses Prisma
- The frontend calls `createUser(data)` (from `usersService.ts:30`) which posts to `ENDPOINTS.USERS = "/users"` on the **NestJS** backend (port 5000). Meanwhile the `app/api/register/route.ts` route exists and uses Prisma to create a user — but **no code path calls it**. The register page never goes through the local Next.js API. If the NestJS backend is down or the user is offline, registration is broken. The local route is dead code.

### 14. `dashboard/page.tsx:21-23` — `i.status` is compared as a string, but the type is `IssueStatus` enum
- The mapping from the backend uses the Prisma enum (`OPEN | IN_PROGRESS | CLOSED`). Comparing against the literal string `'OPEN'` works at runtime, but if the backend serializes a different casing (e.g. `"open"` or `"Open"`), all counts drop to zero silently.

### 15. `app/issues/page.tsx:13` and `dashboard/page.tsx:10` — same `queryKey: ['issues']`
- React Query deduplicates these, but on `createIssue` or `deleteIssue` (in `issuesService.ts`) **the cache is never invalidated**. The new/deleted issue won't show up until a hard refresh. The service functions do not use React Query mutations; they are bare axios calls.

### 16. `app/issues/new/page.tsx` — no status field, defaults to OPEN
- The form (`IssueForm` at line 8) only has `title` and `description`. `IssuePayload.status` is optional, so the default kicks in (`OPEN`). That's fine, but the UI has no way to choose a different initial status.

### 17. `app/issues/edit/[id]/page.tsx:23` — `useForm` not reset with async-loaded data
- The `useEffect` calls `reset({...})` but doesn't await it. If the form re-renders before `reset` finishes, the inputs show empty values. Using `useForm({ defaultValues: {...} })` and re-fetching is more reliable.

### 18. `app/issues/edit/[id]/page.tsx:48` — `updateIssue` called with `data` (form values) but `data` doesn't include `id`
- `updateIssue(id, data)` is correct. But `data` is of type `IssueForm` which has `{title, description, status}` — this matches `IssuePayload`. So this is fine. **However**, the backend route `app/api/issues/[id]/route.ts:41-48` writes all three fields, but if `body.status` is undefined (form bug above), it would set status to `undefined`. The Prisma `Status` enum would reject it.

### 19. `app/users/edit/[id]/page.tsx:52-56` — `password` field always sent, even when blank
- ```
  await updateUser(id, {
    name: data.name,
    email: data.email,
    password: data.newPassword,
  });
  ```
- The form's `newPassword` is optional, but if the user submits without entering one, the field is `""` (empty string). The backend `app/api/user/[id]/route.ts:42` then bcrypt-hashes the empty string and overwrites the existing hash. **The user gets locked out**.
- Also, the backend doesn't check `if (body.password)`, so it always re-hashes.

### 20. `app/api/issues/route.ts:17-22` — no `status` field in create
- The schema only requires `title` and `description`, which matches the schema validator. But the Prisma `Issue.status` defaults to `OPEN`, so this is fine. **However**, the Prisma client expects `Status` enum value, not a string. If the client sends `status: "open"` (lowercase), Prisma will reject it.

---

## 🟡 MEDIUM — TypeScript / lint / Next 16 specifics

### 21. Next.js 16 `params` is a Promise
- All dynamic route files correctly use `params: Promise<{id: string}>` and `use(params)`. ✅
- But `app/api/issues/[id]/route.ts:6` uses `{ params }: { params: Promise<{ id: string }> }` — correct for Next 15+; the handler `await`s it. ✅
- **However**, Next 16 may require additional changes — the project's `AGENTS.md` warns about breaking changes; docs in `node_modules/next/dist/docs/` should be checked.

### 22. `next.config.ts` is essentially empty
- No `experimental`, no `images.domains`, no `transpilePackages` for the Prisma client. The Prisma generated client at `app/generated/prisma/` will need to be transpiled. **Tailwind 4** + PostCSS is configured via `postcss.config.mjs`. The setup looks fine, but the Prisma client at `app/generated/prisma` is *not* in any `include` of `tsconfig.json` either.

### 23. `tsconfig.json:8` — `target: "ES2017"`
- Next.js 16 likely requires `ES2020` or later for the React 19 features used (e.g. `use(params)`). This may produce TS errors.

### 24. `tsconfig.json` paths alias doesn't include Prisma client
- `paths: { "@/*": ["./*"] }` works for `@/app/services/...`, but the Prisma client is generated to `app/generated/prisma` — referenced as `@/app/generated/prisma/client` in `prisma/client.ts`. That maps to `./app/generated/prisma/client` — fine. ✅

### 25. `usersService.ts:19-50` — `User` interface is wrong
- ```
  export interface User {
    message: string;
    id: number;
    name: string;
    email: string;
    resetToken: string;
    tokenExpireAt: string
  }
  ```
- The `User` returned from `GET /users/:id` is a user record, not a reset-token object. This interface mixes the password-reset response shape with the user-list response. The `getUserById` return type is therefore misleading.

### 26. `usersService.ts:42` — `deleteUser` returns `User` but the backend returns `{ message, deletedUser }`
- The backend `app/api/user/[id]/route.ts:75` returns `{ message, deletedUser }`, not a `User`. The type signature lies.

### 27. `app/NavBar.tsx:80` — `signOut({ callbackUrl: '/' })`
- After sign-out the user is redirected to `/`. The home page client-side redirects to `/dashboard` only if `status === 'authenticated'`. After `signOut`, status goes through `loading` → `unauthenticated`, so the redirect does **not** fire. ✅ This is fine.

### 28. `app/NavBar.tsx:90-105` — Duplicate "SignIn with Google" button
- The same button is rendered for both desktop (`hidden md:flex`) and mobile menus, but the mobile menu (lines 137-156) does **not** include the Google button — only `Log in` and `Sign up` links. Inconsistent UX.

### 29. `app/NavBar.tsx:1` — Unused imports
- `import { signIn } from 'next-auth/react';` — used at line 101. ✅
- `import { FaBug, FaBars, FaTimes } from 'react-icons/fa';` — all used. ✅
- No dead imports here, but the file is a client component using the `Avatar`/`DropdownMenu` Radix primitives that need their CSS imported — `@radix-ui/themes/styles.css` is imported in `layout.tsx:4` but **not in the NavBar**. Should be fine since layout imports it.

### 30. `app/issues/new/page.tsx:25-27` — silent failure
- On error, the code does `console.error` but shows no UI feedback. User clicks "Submit New Issue", the API fails, and the user is left staring at the form with no message.

### 31. `app/users/[id]/page.tsx:41` — `deleteUser` not awaited
- Already noted (#12). Also, `signOut` will navigate away, so the loading state is irrelevant.

### 32. `app/api/issues/route.ts:46` — `};` after `export async function GET`
- The trailing semicolon after a function declaration is invalid syntax in modules, but in this case it terminates the **statement** `const issues = await prisma.issue.findMany(...)` chain. Actually, looking more carefully, line 46 has `};` which would be a parse error — the function body `}` is on line 45 and `};` on line 46 is closing the object literal of the catch block **and** terminating the function with a semicolon. The `};` here is a syntax error.
  - Wait, re-reading: line 45 is `}`, line 46 is `};` — this is the closing `}` of the `try`/`catch` block? No, the function is `export async function GET() { try {...} catch {...} }`. After the `catch { ... }`, the function's `}` is on line 45, and line 46 is `};` which is `}` (function close) + `;` (extra semicolon on a declaration — harmless). But it's stylistically odd.

### 33. `prisma/migrations/20260623081532_created/migration.sql:6` — `status` enum created before `Users` model existed
- The first migration creates `Issue` (with `Status` enum). The `User` table is created in `20260623130834_init`, dropped and recreated as `Users` in `20260623144027_updated`. The relationship is added in `20260624133907_added`. This sequence is correct in dependency order. ✅

### 34. `prisma/migrations/20260624133907_added/migration.sql:2` — references `issue` (lowercase)
- The migration is:
  ```
  ALTER TABLE `issue` ADD COLUMN `assignedToUserId` INTEGER NULL;
  ```
  But the table was created as `Issue` (capitalized) in the first migration. **This is a real bug** — on a case-sensitive DB, this fails. On case-insensitive (default Windows/macOS MySQL), it works. The same migration also does:
  ```
  ALTER TABLE `Issue` ADD CONSTRAINT ...
  ```
  So it uses `issue` for one ALTER and `Issue` for another. Inconsistent.

### 35. ESLint config uses `nextVitals` and `nextTs` from `eslint-config-next`
- `eslint.config.mjs:1-4` — `import { defineConfig, globalIgnores } from "eslint/config";` comes from ESLint 9, and `eslint-config-next` v16 supports this. Should work, but no overrides for the React 19 / Next 16 specific rules.

### 36. `app/page.tsx:36` references `/grid.svg` in `bg-[url('/grid.svg')]`
- `public/` directory exists; need to verify `grid.svg` is present.

### 37. `prisma.config.ts` mixes CLI config with client init
- `defineConfig` is from `prisma/config` (a Prisma 7 thing). The schema `url = process.env["DATABASE_URL"]` is read in the config but **not in the schema**, so the generated client doesn't know the URL. Critical bug (#4).

---

## 🔵 LOW — Style / minor / dead code

### 38. Dead code in `app/api/auth/[...nextauth]/route.ts:147-165`
- The old `authorize` function with `prisma.users.findUnique` and `bcrypt.compare` is commented out and left in the file. Confusing for future readers; should be removed.

### 39. `app/issues/new/page.tsx` — no error feedback in UI
- Already noted (#30).

### 40. `app/api/user/route.ts:5-15` — empty catch block
- ```
  } catch (error) {
      
  }
  ```
- The catch swallows the error and returns undefined from the handler. Next.js will return a 500 with empty body, or hang. **Real bug** — should at least log and return a JSON error.

### 41. `app/api/user/route.ts:8` — `findMany` returns users **with password hashes**
- The `GET /api/user` returns all users including `password` field. No stripping. The frontend `usersService.getUsers` would expose password hashes if it were ever called (it's not used in the current code).

### 42. `app/api/user/[id]/route.ts:62-78` — DELETE handler has mismatched braces
- Line 70-74:
  ```
  const deletedUser = await prisma.users.delete({
      where: {
          id: userID
      }
  }
  )
  ```
  Two closing parens on separate lines. The function call is `prisma.users.delete({where:{id:userID}})` — closing parens are `}` for the `where` object, `)` for `delete` call, `)` for the `try`? No — the `try {` opens and the closing `)` on line 74 is the close of the `delete()` call, not the try. Actually it's:
  - `prisma.users.delete(` — needs `)` 
  - `{` opens the argument object
  - `where: {` opens nested
  - `id: userID`
  - `}` closes `where`
  - `}` closes argument
  - `)` closes `delete()` call
  - That's 3 closers; the code has 2 (`}` and `)` on the next line). **Bug: missing one closing paren.**

### 43. `prisma/schema.prisma:9` — `output = "../app/generated/prisma"`
- Relative path from `prisma/schema.prisma` → `app/generated/prisma`. ✅

### 44. `app/users/[id]/page.tsx:8-12` — `UserProfile` type duplicates `User`
- `UserProfile = { id, name, email }` — same shape as the `User` interface in `usersService.ts` minus the auth-related fields. Just a type alias would do.

### 45. `app/users/edit/[id]/page.tsx:18-22` — Same `UserProfile` duplicated
- The same type is declared in two files.

### 46. `app/issues/[id]/page.tsx:14` — unused `use` import?
- `import { useState, useEffect, use } from 'react';` — `use` is used at line 14. ✅

### 47. `app/NavBar.tsx` — `React` imported but not used (line 1)
- `import React, { useState } from 'react';` — `React` is not used. This is a default ESLint warning.

### 48. `app/QueryClientProvider.tsx:6` — `queryClient` is created in `useState`
- Fine, but no devtools setup; not a bug.

### 49. `app/globals.css:22-26` — `font-family: Arial, Helvetica, sans-serif;` overrides Geist
- The Geist fonts are loaded in `layout.tsx:10-18` and set as CSS variables, but the `body` hardcodes Arial. The Geist fonts will not render. **Real bug** for the visual design.

### 50. `app/api/register/route.ts` — Zod validation error response uses `.issues` (Zod 4)
- The `validation.error.issues` API is Zod 4 (`zod ^4.4.3` in `package.json`). In Zod 3 it was `validation.error.errors`. ✅

### 51. `app/api/register/route.ts:18` — `prisma.users.findUnique`
- Same case-mismatch risk as elsewhere — model is `Users`, Prisma client property is `users`. The generated client may be case-sensitive.

### 52. `app/api/user/[id]/route.ts:34-58` — PUT does not validate input
- No `registerSchema` or similar. Accepts any JSON, including missing `name` or `email`. The Prisma `update` will fail with a non-user-friendly error.

### 53. `prisma/schema.prisma:21-22` — `createdAT` and `updatedAT` capitalization
- Conventionally Prisma uses `createdAt` and `updatedAt`. Migrations and the Prisma client property names use `createdAT` and `updatedAT`. App code doesn't seem to use these fields directly.

### 54. `app/api/issues/[id]/route.ts:6-8` — `request` is unused
- The `request: NextRequest` parameter is unused in GET, PUT, and DELETE handlers. ESLint may warn.

### 55. `app/dashboard/page.tsx:73-99` — Bar chart legend missing
- The legend at line 105-108 uses `w-full` for each `<span>`, but it's outside a flex container with `gap-6`. Without `flex` on the parent, the gap doesn't apply, and the spans wrap as block elements.

### 56. `app/issues/page.tsx:74` — `i.status.replace('_', ' ')` shows "IN PROGRESS" not "In Progress"
- Cosmetic. The status badge will show "IN PROGRESS" (all caps). Fine for now.

### 57. `app/api/issues/route.ts:7` — `import { NextRequest, NextResponse } from "next/server";`
- `NextRequest` is imported but not used in this file. Dead import.

### 58. `app/api/issues/[id]/route.ts:1` — same dead `NextRequest` import
- It IS used (`request: NextRequest`). ✅

### 59. `prisma.config.ts:1-2` — file lives at project root, `schema: "prisma/schema.prisma"` is correct
- ✅

### 60. `package.json:25` — `react-hook@0.0.1`
- `"react-hook": "^0.0.1"` — this package has 0.0.1 version, looks like a typo for `react-hook-form` (which is also listed on line 26). Dead dependency, should be removed.

---

## 🟢 SUSPICIOUS — Could be intentional, but worth verifying

### 61. The app mixes two different API surfaces
- Some pages call local Next.js API routes (`/api/...`), and the `axiosInstance` is configured to call the **NestJS backend** at `http://localhost:5000` (`BASE_URL` in `constants/endpoints.ts:4`).
- The login flow goes to NestJS (`route.ts:34`), but the `register` page goes via `createUser` → NestJS, while a local `app/api/register/route.ts` exists. Inconsistent.
- The dashboard/issues pages go via `axiosInstance` → NestJS. The middleware's `withAuth` validates NextAuth's JWT cookie, but that cookie is only set after a successful credentials login through the NextAuth route. The NestJS backend probably uses a different token (stored in `localStorage`). **Authentication is split between two systems** — likely the source of "Fixed redirect issue" commit messages.

### 62. `package.json:11` — `prisma:generate` script has custom path
- The Prisma CLI is invoked with `--schema=./packages/db/schema.prisma`, but the actual schema is at `prisma/schema.prisma` (per `prisma.config.ts:7` and `prisma/schema.prisma` itself). **The script points at a non-existent path** — `packages/db/schema.prisma` does not exist in this project.

### 63. Prisma `prisma.config.ts` uses new Prisma 7 format
- `import { defineConfig } from "prisma/config";` is the new Prisma 7 way. But the schema is still using the Prisma 6-style `datasource` block (without explicit `url`). The new way requires `url` in `prisma.config.ts`, but the schema still needs it for the client to find the DB.

### 64. `tsconfig.json:4` — `"lib": ["dom", "dom.iterable", "esnext"]` missing `ES2020.Promise`
- Needed for `await` at the top level and for `Promise<{id: string}>` types in Next 16. May cause TS errors.

---

## Summary Table

| Severity | Count | Notes |
|----------|------:|-------|
| 🔴 Critical | 7 | Prisma not generated, no DB URL, adapter/provider mismatch, no JWT secret |
| 🟠 High | 12 | Missing await, password hash overwrite, token storage race |
| 🟡 Medium | 17 | Next 16 specifics, dead code, type duplications |
| 🔵 Low | 18 | Style, dead imports, typos |
| 🟢 Suspicious | 4 | Two API surfaces, broken prisma:generate script |

## Top 5 to fix first

1. **Generate Prisma client** (`npm install && npx prisma generate`) and add `url = env("DATABASE_URL")` to `schema.prisma` — nothing else compiles.
2. **Fix `package.json:10`** — `--schema=./packages/db/schema.prisma` should be `--schema=./prisma/schema.prisma`.
3. **Add JWT secret** to `app/api/auth/[...nextauth]/route.ts` via env (`NEXTAUTH_SECRET`).
4. **Stop re-hashing blank password** in `app/api/user/[id]/route.ts:42` and frontend `users/edit/[id]/page.tsx:52` — it locks users out.
5. **Await `deleteUser`** in `app/users/[id]/page.tsx:39` before `signOut`.

---

## Audit Method

- Read all 20 source files in `app/` (pages, components, services, API routes, auth, layout, NavBar).
- Read all 5 SQL migrations in `prisma/migrations/`.
- Reviewed `package.json`, `tsconfig.json`, `next.config.ts`, `middleware.ts`, `prisma.config.ts`, `prisma/schema.prisma`, `eslint.config.mjs`, `postcss.config.mjs`, `app/globals.css`, `AGENTS.md`, `README.md`, `implementation.md`.
- Verified `node_modules/` and `app/generated/` directories are missing from disk.
- No files were modified during this audit.
