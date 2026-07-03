# Implementation Report: Decoupled Service Architecture & Authentication Sync

This document details the refactoring, bug fixes, and integration improvements made to connect the Next.js frontend with the NestJS backend.

---

## 1. Centralized Routing & API Constants
- **Configuration File**: `/app/constants/endpoints.ts`
  - Created a single source of truth for base configuration (`BASE_URL = "http://localhost:5000"`).
  - Created dynamic mappings for NestJS routes under a unified `ENDPOINTS` dictionary.
- **Global HTTP Client**: `/app/axios/axios.ts`
  - Refactored `axiosInstance` to consume `BASE_URL` dynamically.
  - Implemented request/response interceptors to attach authorization headers automatically.

---

## 2. Decoupled Services Layer
- **Issues Service**: `/app/services/issuesService.ts`
  - Formulated clean interfaces (`Issue`, `IssuePayload`, `IssueStatus`) aligned with NestJS entity schemas.
  - Fixed a critical bug in `updateIssue` where the function reference itself was passed instead of the payload argument.
- **Users Service**: `/app/services/usersService.ts`
  - Defined `UserPayload` to capture user account variables.
  - Fixed an empty `catch` block in `updateUser` to let errors bubble up and display in the UI.

---

## 3. NestJS Authentication & NextAuth Sync
- **Backend Response Parsing**: `/app/api/auth/[...nextauth]/route.ts`
  - Updated the NextAuth credentials `authorize` callback to handle the NestJS `AuthService` response format (`accessToken`, `userId`, `userName`) rather than expecting a nested `user` key.
- **Access Token Synchronization**: `/app/auth/AuthProvider.tsx`
  - Built a `SessionSync` hook to automatically copy the NestJS JWT `accessToken` from the NextAuth session into `localStorage` under `"token"` upon login, and clear it upon logout.
- **Automatic Auth Redirection**: `/app/api/auth/[...nextauth]/route.ts`
  - Added a NextAuth `redirect` callback that intercepts default homepage or login redirects and routes successfully authenticated users directly to `/dashboard`.
- **Google Sign-In on Login**: `/app/login/page.tsx`
  - Added a styled Google sign-in button that initiates authorization and specifies a redirect to `/dashboard` upon success.

---

## 4. TypeScript Type Safety Updates
- **Type Safety Alignment**:
  - `/app/issues/[id]/page.tsx`
  - `/app/issues/edit/[id]/page.tsx`
  - `/app/issues/page.tsx`
  - `/app/dashboard/page.tsx`
  - Replaced duplicate, local `type Issue` declarations with imported `Issue` and `IssueStatus` types from `/app/services/issuesService.ts` to ensure unified entity definitions.
