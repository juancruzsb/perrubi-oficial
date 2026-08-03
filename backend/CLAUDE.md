# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Perrubi — "Uber para perros" (dog-walking marketplace). This is the **backend** package of a monorepo (`../frontend` is the sibling app). Node.js + Express + Prisma (PostgreSQL, hosted on Neon).

## Commands

- Run in dev (watch mode): `npm run dev` — this runs `nodemon src/server.js`, but note **`src/server.js` does not currently exist**; the real Express entry point is `app.js` at the package root. Run the app directly with `node app.js` until the `dev` script is fixed, or fix the script to point at `app.js`.
- No test suite exists yet (`npm test` is a stub that exits with an error).
- No lint config exists.
- Prisma:
  - Schema: `prisma/schema.prisma`
  - Config: `prisma.config.ts` (loads `DATABASE_URL` from `.env` via `dotenv/config`)
  - Generate client: `npx prisma generate`
  - Create/apply a migration in dev: `npx prisma migrate dev --name <name>`
  - Open Prisma Studio: `npx prisma studio`

## Environment

Config is loaded from `.env` at the package root (via `dotenv/config`, imported first in `app.js`). Required variables:
- `DATABASE_URL` — Postgres connection string (Neon)
- `PORT` — HTTP port the Express app listens on
- `JWT_SECRET` — signing secret for auth tokens
- `API_KEY_MAPS` — Google Maps/Places/Routes API key used by `maps.service.js`

## Architecture

Layered structure per domain, all under `src/`:

```
src/routes/<domain>.router.js       -> Express Router, wires paths to controller fns + middleware
src/controllers/<domain>.controller.js -> req/res handling, status codes, input checks
src/services/<domain>.service.js    -> business logic + Prisma queries (no req/res)
```

Domains currently implemented: `auth`, `dogs`, `maps`. Follow this same three-file pattern (router → controller → service) when adding a new domain; each layer exports a plain object of named functions (e.g. `const DogsController = {}; DogsController.getAllDogs = ...; export default DogsController`), not a class.

**Database access**: a single shared Prisma client instance lives in `db.js` at the package root (built with the `@prisma/adapter-pg` driver adapter over a `pg.Pool`). Services import it as `import prisma from '../../db.js'` — always reuse this shared instance rather than instantiating a new `PrismaClient`.

**Auth**: `src/middlewares/auth.middlewares.js` exports `verifyToken` (validates the `Authorization: Bearer <jwt>` header, decodes with `JWT_SECRET`, sets `req.user`) and `verifyAdmin` (requires `req.user.role === 'admin'`, so it must run after `verifyToken`). There are two separate identity types with separate Prisma models and separate login/register flows: `User` (dog owners) and `Walker` (dog walkers) — see `auth.service.js` / `auth.controller.js`, which keep `userRegister`/`userLogin` and `walkerRegister`/`walkerLogin` as distinct pairs rather than a unified account model.

**Schema relationships** (`prisma/schema.prisma`): `User` and `Dog` are many-to-many via `UserDog`; a `Walk` belongs to one `Walker` and has many-to-many `Dog`s (via `WalkDog`) and `User`s (via `WalkUser`). Prisma fields are camelCase and mapped to snake_case DB columns (`@map(...)` / `@@map(...)`).

**Maps integration**: `src/services/maps.service.js` calls Google's Routes API (`computeRoutes`) and Places API (`searchText`, place details) directly via `axios`, authenticated with `API_KEY_MAPS`. Read the inline comments in that file for the expected request/response shapes — the frontend does not need to send `travelMode`/`routeModifiers`/etc., those are filled in server-side.
