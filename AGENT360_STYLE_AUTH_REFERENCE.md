# Agent360 CRM — Styling, Theming, Sidebar & Auth Reference

> **Purpose:** This document is a portable reference extracted from the Agent360 CRM codebase
> (Next.js 15 + Ant Design + Tailwind + Supabase Auth). Give it to Claude in another project as
> a style/architecture guide when you want that project's sidebar, theming system, and
> authentication flow to follow the same logic, code quality, and UX conventions used here.
>
> This is a **reference, not a copy-paste kit** — adapt names, routes, and DB models to the
> target project. What should transfer 1:1 is the *architecture*, the *design-token strategy*,
> and the *code-quality patterns* (comments explaining WHY, defensive fallbacks at integration
> boundaries, SSR/hydration discipline).

---

## 1. Theming System — CSS Variables as the Source of Truth

### Core principle
**Every color is a CSS custom property, never a hardcoded hex in a component.** Tailwind classes
and Ant Design's `ConfigProvider` both resolve to the *same* CSS variables, so a single theme
switch repaints Tailwind-styled elements and Ant Design components simultaneously.

```
Tailwind (tailwind.config.ts)  ──┐
                                 ├──► both read var(--color-*)
Ant Design (ConfigProvider)  ────┘
```

### Token layers (`src/app/globals.css`)

1. **`:root`** — the default (light) palette: brand, semantic status (success/warning/danger/info),
   surfaces, borders, text, shadows, radius, transitions, z-index scale, layout dimensions.
2. **`html.dark`** — dark-mode overrides for every token above (Tailwind `darkMode: 'class'`).
3. **`[data-theme='midnight'|'violet'|'rose'|'orange'|'green'|'sky']`** — a full second palette
   per named theme, so the app supports *multiple* branded themes, not just light/dark.
4. **Per-org custom theme** — colors picked by an org admin, injected at runtime via
   `element.style.setProperty(...)` (see `ThemeProvider.tsx`), so no rebuild is needed for a
   client's brand colors.

Token naming convention — always `--color-<role>[-<variant>]`:
```css
--color-primary        /* sidebar/nav background */
--color-accent         /* interactive/brand accent */
--color-accent-dark    /* accent hover state */
--color-accent-light   /* accent tint background */
--color-surface        /* page background */
--color-card           /* elevated surface (cards, modals, inputs) */
--color-border
--color-text / -2 / -3 /* primary / secondary / muted text */
--color-success / -warning / -danger / -info  (+ -bg / -fg pairs)
--shadow-xs … --shadow-2xl
--radius-xs … --radius-full
--transition-fast / -base / -slow / -spring
--z-dropdown / -sticky / -sidebar / -topbar / -drawer / -modal / -toast
```

**Why this matters for code quality:** any new component just writes `var(--color-text)` or a
Tailwind class like `bg-surface` / `text-brand-accent` and it is automatically theme-correct in
light, dark, all 6 named themes, and any future custom org theme — with zero per-component
theme logic.

### Tailwind wiring (`tailwind.config.ts`)
Tailwind's `colors` extension maps semantic names to the CSS vars, so components can write
`bg-brand-primary`, `text-surface-2`, `border-ok` etc. instead of arbitrary values:

```ts
colors: {
  brand: { primary: 'var(--color-primary)', accent: 'var(--color-accent)', ... },
  surface: { DEFAULT: 'var(--color-surface)', 2: 'var(--color-surface-2)', card: 'var(--color-card)' },
  border: { DEFAULT: 'var(--color-border)', 2: 'var(--color-border-2)' },
  ok: { DEFAULT: 'var(--color-success)' }, warn: { ... }, err: { ... },
},
darkMode: 'class',
```
`darkMode: 'class'` + a `dark` class toggled on `<html>` is what makes Tailwind's own `dark:`
variants line up with the CSS-variable dark overrides.

### Ant Design wiring (`src/components/Layout/ThemeProvider.tsx`)
Ant Design 5's `ConfigProvider` takes a `ThemeConfig` object built per theme name
(`buildAntdTheme(name, custom)`), using `antdTheme.defaultAlgorithm` for light themes and
`antdTheme.darkAlgorithm` for dark ones. Key practices worth copying:

- **`cssVar: true, hashed: false`** on every theme config — lets Ant Design emit real CSS
  variables instead of hashed class names, so `!important` overrides in `globals.css` can target
  `.ant-btn-primary` etc. reliably across theme switches.
- **A single `buildComponents(mode, accent, card, surface, accentLight)` helper** generates
  per-component token overrides (Table, Modal, Input, Select, Menu, Tabs, Drawer, …) from just
  4 colors — new themes don't need to hand-write 15 component overrides, they derive them.
- **Custom/org themes compute derived values**, e.g. text-on-accent contrast is computed via
  relative luminance, not hardcoded:
  ```ts
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  root.style.setProperty('--color-text-on-accent', lum > 0.38 ? '#101828' : '#FFFFFF');
  ```
- **Theme persistence order:** `localStorage` (applied synchronously on mount, before any DB
  round-trip, to avoid a flash-of-wrong-theme) → then reconciled against the server truth in a
  `useEffect` once tRPC queries resolve: personal preference → org-wide default → built-in
  fallback (`royal`). A `mounted` flag hides children (`visibility: hidden`) until this
  reconciliation completes, preventing a theme flicker on first paint.
- **Themes are user-scoped AND org-scoped**: `getMyThemes`, `getOrgDefault`, `getMyPreference`
  are three separate tRPC queries — a user can pick a personal theme, or inherit the org
  admin's default, or fall back to a built-in.

### Global CSS override strategy (Ant Design)
Rather than fight Ant Design's runtime class hashing, `globals.css` applies **`!important`
overrides keyed to Ant's stable class names** (`.ant-btn`, `.ant-modal-content`,
`.ant-select-selector`, …), every value pointing at a CSS variable. This is the pragmatic
middle ground between "component library owns styling" and "we need pixel-perfect brand
control" — copy this pattern if the target project also uses Ant Design (or any component
library that doesn't fully expose a token API).

---

## 2. Sidebar / Navigation — Structure & UX

File: `src/components/Layout/AppSidebar.tsx` (desktop) +
`src/components/MobileBottomTabBar/index.tsx` (mobile).

### Design decisions worth reusing

1. **Config-driven nav, not JSX-driven.** Nav items are a typed array of `NavSection[]`
   (`{ label, items: [{ key, path, label, icon, iconActive, absolute? }] }`), so adding a nav
   item is a data change, not a markup change:
   ```ts
   interface NavItem { key: string; path: string; label: string; icon: string; iconActive: string; absolute?: boolean; }
   interface NavSection { label: string; items: NavItem[]; }
   ```
   Two icon variants per item (outline vs. filled) — swapped based on active state — is a small
   but effective polish detail (Fluent icon system: `fluent:x-20-regular` / `fluent:x-20-filled`).

2. **Multi-tenant routing built into the active-state check.** Every route is
   `/${orgSlug}/${path}` except explicitly-marked `absolute` routes (e.g. `internal-ops`, which
   is a super-admin area outside any org). `isActive()` centralizes this so no nav item
   hardcodes a slug.

3. **Role-based visibility computed once, not scattered in JSX:**
   ```ts
   const showAdmin = role === UserRole.ADMIN || role === UserRole.OWNER || role === UserRole.AGENT;
   const { data: internalOpsAuth } = api.internalOps.amIAuthorized.useQuery(undefined, {
     enabled: !!currentUser?.appUser?.id, // don't fire the query on a signed-out shell render
   });
   ```
   **Critical security note preserved as a code comment:** client-side hiding of a nav item is a
   *UI convenience only* — the real authorization boundary is a server-side procedure
   (`internalOpsProcedure`). This is called out explicitly in the code so nobody mistakes
   "hidden in the sidebar" for "protected." Always carry this distinction into any new project:
   > Visibility gating is UX. Authorization is server-side. Never conflate the two, and say so
   > in a comment where the two are adjacent enough to be confused.

4. **Collapsible sidebar with persisted intent via local component state**, animated with
   Tailwind transitions (`transition-all duration-300 ease-in-out`), width driven by a single
   `collapsed` boolean (`w-16` vs `w-[240px]`), not a CSS variable dance. Collapsed state shows
   icon-only nav with `Tooltip` (Ant Design) for labels — tooltip styling also pulls from the
   same CSS variables (`background: var(--color-card)`, etc.) so it matches the active theme.

5. **Active-state affordance is layered, not just a background color:**
   - background tint (`bg-white/15`)
   - inset ring (`boxShadow: inset 0 0 0 1px rgba(255,255,255,0.1)`)
   - a left accent bar (`absolute left-0 ... w-0.5 h-5`, colored `var(--color-accent-muted)`)
   - icon color swap to accent
   - `aria-current="page"` for accessibility

   Stacking several small signals (not just one) is what makes an active nav item read as
   unambiguous at a glance — worth carrying into any new sidebar.

6. **Accessibility baseline:** `<aside aria-label="Main navigation">`, `<nav role="navigation">`,
   `aria-current="page"` on the active link, `aria-label` on the collapse toggle button. Small
   additions, consistently applied.

7. **Org branding baked into the sidebar itself**, not just the top bar: org logo (or a
   generated initial-letter badge) + org name shown at the top, current user's name + role
   badge (color-coded per role) shown at the bottom. Role badge colors are defined once as a
   lookup table (`ROLE_BADGE_STYLE: Record<string, CSSProperties>`), not inline conditionals.

8. **Responsive split, not a single responsive component.** Desktop gets a persistent collapsible
   sidebar (`hidden md:flex`); mobile gets an entirely separate bottom tab bar component
   (`MobileBottomTabBar`) with a sliding active-indicator (`indicatorStyle` tracked via
   `useRef`/`getBoundingClientRect`) and a central floating action button
   (`ActionFabMobile`). Don't try to force one component to be both — a sidebar collapsed to
   icons is not the same interaction model as a bottom tab bar.

9. **Mobile nav auto-hides on public/auth-adjacent routes** via a single `shouldHide` memo
   checking route prefixes (`/auth`, `/onboarding`, `/join-organization`, `/client`) — same
   pattern is mirrored in the sidebar's parent layout (`RootClientLayout`, see §4).

---

## 3. Authentication Flow — Supabase Auth (JWT)

Full flow documented in `.claude/rules/supabase-auth-flow.md`; summarized here for portability.

### 3.1 Middleware gate (`src/middleware.ts`)
A single Next.js middleware checks Supabase session on every non-public route:

```ts
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') return NextResponse.next();
  if (PUBLIC_ROUTES.some(r => request.nextUrl.pathname.startsWith(r))) return NextResponse.next();

  const supabase = createServerClient(url, anonKey, { cookies: { getAll, setAll } });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL('/auth', request.nextUrl);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|landing|\\.well-known|auth|join-organization|onboarding|client|api/public|api/trpc|api/auth|api/twilio|api/webhooks|openhouse|p/|$).*)'],
};
```

**Reusable lessons:**
- The matcher regex is the single place that lists every public surface — auth pages,
  onboarding, client portal, public APIs, and **external webhook callbacks** (Stripe, Twilio),
  which authenticate via their own signature check and never carry a session cookie. A comment
  in the code explains exactly *why* webhooks are excluded — found the hard way during local
  billing testing, when a real Stripe webhook request had no session cookie and could never
  pass `supabase.auth.getUser()`. Any new project's middleware should carry the same lesson:
  **enumerate every route class that legitimately has no user session, and say why.**
- Redirect preserves the original destination (`redirectTo` query param) so a bookmarked deep
  link isn't lost after login.

### 3.2 Three parallel login paths, one shared identity model

| Path | Entry | Mechanism |
|---|---|---|
| Magic link / OTP | `LoginForm` → `api.auth.login` | `supabase.auth.signInWithOtp({ shouldCreateUser: false })` → email link → `/api/auth/confirm` → `verifyOtp` → redirect to `/{orgSlug}/dashboard` |
| OAuth (Google/Apple) | `signInOAuthHandler(provider)` | `supabase.auth.signInWithOAuth` → `/api/auth/callback?code=...` → `exchangeCodeForSession` → sync org metadata → redirect |
| Local dev bypass | `api.auth.localDevLogin` | Only enabled when `env.APP_ENV === 'localhost'` — **no URL param triggers it**, deliberately, "to avoid credential exposure" |

### 3.3 JWT metadata caching (perf pattern worth copying)
Supabase's JWT `user_metadata` is used as a **read-through cache** for `appUserId`, `role`,
`orgId`, `orgSlug` — avoiding a DB round trip on every authenticated request. The tRPC context
falls back to a DB lookup only if metadata is absent (first login, or metadata invalidated by an
admin action). See `[[critical_rules]]` in this codebase's memory: whenever the underlying DB
row changes (role change, org reassignment, account fix), **the JWT metadata must be
re-synced or the user must re-login** — a stale cache here is a real bug class, not a hypothetical.

### 3.4 OAuth callback hardens against edge cases explicitly (`/api/auth/callback/route.ts`)
Worth replicating as a checklist for any OAuth callback handler:
- **Vercel's `NEXT_PUBLIC_VERCEL_URL` has no protocol prefix** — always
  `url.startsWith('http') ? url : \`https://${url}\``. This is called out with a comment because
  it silently breaks redirects if missed.
- **No org in JWT metadata ≠ automatically "new user."** Before shunting to onboarding, look the
  user up **by email** in case they're an existing team member who originally signed up with a
  different auth method (password vs. Google) — link the identities instead of creating a
  duplicate account. This is exactly the kind of orphaned-identity bug documented in this
  project's own incident history (`[[fides_mortgages_owner_account_fix]]`) — treat "auth
  identity vs. app user row" as two different things that can drift apart, and reconcile by
  email as a fallback, not just by provider ID.
- **Deactivated accounts are checked and force-signed-out** before any redirect to the app shell.
- **Client-portal users are detected and routed differently** (`clientLeadId` present → redirect
  to a client-facing journey view, not the internal dashboard) — auth callback branches by
  *user type*, not just success/failure.
- **`forwardedHost` vs. `origin` redirect logic** is duplicated per branch rather than a shared
  helper — a known simplification opportunity, but the explicit local/prod/forwarded-host
  triage per redirect is the thing to keep even if you refactor the duplication.

### 3.5 Native mobile (iOS WKWebView) OAuth workaround
Documents a specific, well-understood browser limitation and its fix — a good template for how
to record platform workarounds in code:

```ts
// Google blocks OAuth inside WKWebView (iOS) with 403 disallowed_useragent.
// Fix: get the OAuth URL without auto-redirecting, then hand it to the native iOS
// layer via window.webkit.messageHandlers.openInSafari — opens a real Safari session
// (SFSafariViewController) that Google allows.
const { data } = await supabase.auth.signInWithOAuth({
  provider, options: { redirectTo, skipBrowserRedirect: true, queryParams: googleParams },
});
if (data?.url) webkit.messageHandlers.openInSafari.postMessage(data.url);
```
Detection is done via a custom UA token (`/Agent360Native/.test(navigator.userAgent)`) rather
than by *absence* of `Safari/` — because the custom UA deliberately keeps `Safari/604.1` in the
string to dodge a *different* Google block. Both facts are commented in place, since either one
alone looks like a mistake without the other.

### 3.6 Apple-native and reviewer-bypass flows
Two more narrow, well-scoped exceptions, each clearly labeled:
- Apple sign-in inside the native shell dispatches a `CustomEvent` bridge
  (`appleSignInNative` / `appleSignInError`) rather than reusing the web OAuth path, because iOS
  offers a proper native Face ID sheet via `ASAuthorizationAppleIDProvider`.
- An App Store reviewer bypass (single hardcoded email) skips the "check your inbox" step for
  magic-link verification, clearly marked with `// TODO: APPLE_REVIEW — remove after Apple
  approves` on every line it touches — a good pattern for time-boxed, audit-easy exceptions:
  tag every line, not just the block, so a global search finds every piece to remove later.

### 3.7 Onboarding (new org creation) — a separate, deliberately public funnel
```
/onboarding → org details → user profile (creates user + sends magic link) → verify email
/onboarding/verify-org → extract tokens from URL hash → link user to org → seed default data
                        (Trigger.dev background job: stages, templates, workflows)
                        → redirect to /{orgSlug}/dashboard
```
Org slug uniqueness (`kebabCase(name)`) is checked at creation time, not left to a DB constraint
failure surfacing as a raw 500.

---

## 4. App Shell — SSR/Hydration Discipline (`RootClientLayout.tsx`)

Smaller but high-value patterns for any Next.js App Router project mixing public marketing
pages with an authenticated SPA-like shell:

- **Public pages render immediately, without waiting for client hydration.** `pathname` is
  available during SSR, so a `pathname?.startsWith('/auth')` branch returns a lightweight tree
  (`<ToastProvider>{children}</ToastProvider>`) synchronously — comments explain that this branch
  used to *also* wait for `isClient`, which shipped an empty `<body>` until JS hydrated; the fix
  is documented in place, not just fixed silently.
- **Heavy providers (FCM push, Ably realtime, drag-and-drop attachment context) are
  dynamically imported with `ssr: false`** and only mounted once `isClient` is true — because
  they touch browser-only APIs. A one-line comment on each `dynamic()` call states *why* that
  specific provider is (or isn't) safe to code-split, rather than applying the same treatment
  uniformly — e.g. `Spin` stays a static import because it's used in a flash-prevention branch
  that must render synchronously during SSR.
- **Mobile dashboard redirect uses both SSR device-detection and client-side detection**,
  explicitly to prevent a flash of the wrong layout before hydration settles:
  ```ts
  const ssrIsMobile = 'isMobile' in deviceDetect ? deviceDetect.isMobile : false;
  const shouldRedirectDashboard = (ssrIsMobile || isMobile) && isDashboardRoute;
  ```
- **`React.memo` on the whole layout component** since it wraps every authenticated route.

---

## 5. Portable Checklist for a New Project

If replicating this system in another codebase, in priority order:

1. **Design tokens first.** Define `--color-*`, `--shadow-*`, `--radius-*`, `--transition-*`,
   `--z-*` as CSS custom properties on `:root`, mirror them in `html.dark`, then wire your
   Tailwind config and your component library's theme config (Ant Design `ConfigProvider`, MUI
   `ThemeProvider`, etc.) to read the *same* variables. Never let two systems own color truth.
2. **Sidebar as data, not markup.** A typed `NavSection[]`/`NavItem[]` config, one active-state
   function, one role-visibility computation — not conditionals sprinkled through JSX.
3. **Separate desktop sidebar and mobile tab bar as distinct components**, not one responsive
   component trying to do both.
4. **Middleware as the single session gate**, with an explicit, commented allowlist of every
   route class that legitimately bypasses auth (public pages, webhooks with their own signature
   check, API routes with bearer/secret auth).
5. **JWT metadata as a cache, never as the source of truth** — always have a DB fallback path,
   and always re-sync metadata after any server-side identity/role/org change.
6. **Comment platform-specific workarounds at the workaround**, not in a wiki: WKWebView UA
   sniffing, Vercel URL quirks, third-party 403s — future you (or another agent) needs the *why*
   right next to the *what*, because removing the workaround without knowing why it exists is
   the most common way these regress.
7. **Treat "hidden in the UI" and "authorized on the server" as two separate facts**, and say so
   in a comment anywhere the two are adjacent enough to be confused (e.g. a nav item gated by a
   client-side role check that mirrors, but does not replace, a server-side procedure guard).
