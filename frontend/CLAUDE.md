# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Perrubi — "Uber para perros" (dog-walking marketplace). This is the **frontend** package of a monorepo (`../backend` is the sibling Express + Prisma API). Built with Expo Router (React Native + React Native Web), TypeScript, React 19.

## Commands

- `npm start` — start the Expo dev server (Metro). Press `w` for web, or scan the QR with Expo Go for a device.
- `npm run android` / `npm run ios` / `npm run web` — start directly on a given platform.
- `npm run lint` — `expo lint` (ESLint via `eslint-config-expo`).
- No test suite exists yet.
- `npm run reset-project` — moves the current `app/` starter content aside and scaffolds a blank one (see `scripts/reset-project.js`). Do not run this without explicit user confirmation — it restructures the whole `app/` directory.

## Architecture

**Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (file-based, v6). Every file under `app/` is a route:
- `app/_layout.tsx` — root `Stack` (headerless). On web it also wraps every screen in a fake `PhoneFrame` (a centered 390×844 mock phone bezel) purely for desktop preview — this does not exist on native.
- `app/login.tsx`, `app/login-form.tsx`, `app/registro.tsx` — auth screens, outside the tab group.
- `app/(tabs)/` — the authenticated app shell, wired up by `app/(tabs)/_layout.tsx` (bottom `Tabs`: Inicio/`index`, Mis paseos/`mis-paseos`, Chat/`chat`, Perfil/`perfil`). `crear-paseo`, `agregar-perro`, `buscando_paseador` and `paseo_en_curso` live in the same group but are hidden from the tab bar (`options={{ href: null }}`) — they're pushed to, not tabbed to.
- `app/modal.tsx` — example modal route from the Expo template, currently unused by the app flow.
- **`app/(tabs)/paseo_en_curso.tsx` is a 0-byte file** — no default export. Nothing navigates there (see below); don't add a `router.push`/`replace` to it until it actually has content.

**Session guard**: `app/(tabs)/_layout.tsx` reads `useSession()` (see below) and renders `<Redirect href="/login" />` when there's no token, or a loading spinner while the session is still hydrating from storage. This is the entry gate — `(tabs)/index.tsx` is route `/`, so this is where the app lands cold-start. `app/_layout.tsx` just wraps the root `Stack` in `<SessionProvider>`; it does not itself redirect.

**API layer** (`api/`): thin wrapper around `fetch`, this is the only place that should know about HTTP. Types in `api/types.ts` are calqued off the *real* backend JSON shapes, not assumptions — read the comments there before assuming a field's type (`weight`/`price`/`averageRating` are `string`, not `number`; `walk.dogs`/`walk.users` are join-row arrays, not flat arrays of `Dog`/`User`).
- `api/client.ts` — `apiRequest<T>(endpoint, { method, body, auth })`. `BASE_URL` is resolved at runtime (`EXPO_PUBLIC_API_URL` → LAN IP derived from `expo-constants`' `hostUri` → `10.0.2.2` on Android emulator → `localhost`), not hardcoded. Attaches the token automatically unless `auth: false`. On a 401, clears the stored session and calls a handler registered via `setUnauthorizedHandler` (set up by `SessionProvider`) — `client.ts` itself never imports the router or React.
- `api/session.ts` — AsyncStorage helpers (`guardarSesion`, `obtenerToken`, `obtenerUsuario`, `cerrarSesion`) under keys `perrubi_token` / `perrubi_user`. Kept separate from `auth.ts` specifically so `client.ts` can import it without an import cycle.
- `api/auth.ts` — `register`/`login` against the real endpoints (`/auth/userRegister`, `/auth/userLogin`), `getMe()`, plus `splitNombre()` (the UI collects "Nombre completo" as one field; the backend wants `firstName`/`lastName` separately) and `nombreCompleto()`.
- `api/dogs.ts`, `api/addresses.ts`, `api/walks.ts` — one function per connected endpoint (see `../INTEGRACION-BACKEND-FRONTEND.md` for the full table of what's wired vs. not). `api/walks.ts` exports `dogsOf(walk)` to unwrap the join-row array.
- No `api/maps.ts` and no `api/chat.ts` — see the integration doc for why.

**Session context**: `context/session.tsx` exports `SessionProvider` and `useSession()` (`{user, token, cargando, entrar, salir}`). Hydrates from AsyncStorage on mount. Always go through `entrar()`/`salir()` from a component (not the raw `api/session.ts` helpers) so React state and storage stay in sync — the raw helpers are for `client.ts`/non-component code only.

**Styling**: no design system / component library. Every screen defines its own `StyleSheet.create({...})` at the bottom of the file with a repeated set of local color constants (`GREEN = '#4caf50'`, `TEXT_PRIMARY`, `BORDER`, etc. — copy-pasted per file, not shared). `constants/theme.ts` and `hooks/use-theme-color.ts` / `use-color-scheme(.web).ts` exist from the Expo template (light/dark theming for the `themed-text`/`themed-view` components) but the actual app screens don't use them — they hardcode a light theme with green (`#4caf50`) as the brand color. Follow the existing per-screen pattern unless asked to introduce a shared design system.

**Components** (`components/`): mostly untouched Expo template scaffolding (`themed-text.tsx`, `themed-view.tsx`, `parallax-scroll-view.tsx`, `hello-wave.tsx`, `haptic-tab.tsx`, `external-link.tsx`, `ui/`). The real app screens in `app/` do not use these — they build UI inline with plain `View`/`Text`/`TouchableOpacity`. Don't assume changes to `components/` affect the actual screens.

**Path alias**: `tsconfig.json` defines `@/*` → project root (e.g. `@/assets/...`, `@/constants/theme`), but most existing screens import relatively (`../api/auth`) instead. Either works; prefer matching whatever the file you're editing already uses.

## Assets

`assets/Logo-Principal.png` is the only real asset checked in. Every icon/illustration in the UI is currently an emoji placeholder with a `// TODO: <Image source={require(...)} .../>` comment marking where a real asset should go later (see `login.tsx`, `app/(tabs)/index.tsx`). Don't remove these TODO comments when editing nearby code unless you're the one supplying the real asset.

## Connecting to the backend

Most of the backend surface that has matching UI is now wired (auth, dogs, the create-walk flow,
walk status polling — see the table in `../INTEGRACION-BACKEND-FRONTEND.md`). Before wiring
anything new (chat, a walker role, address management, `perfil.tsx`/`mis-paseos.tsx`/`chat.tsx`
once those stop being stubs), read `../INTEGRACION-BACKEND-FRONTEND.md` at the repo root — it has
the full table of what's connected vs. intentionally left out and why, plus the known pending items
(location permissions, photo upload, chat, walker role) and non-integration issues worth knowing
about (a preexisting peer-dependency conflict that requires `npm install --legacy-peer-deps`,
missing assets referenced by `app.json`).
