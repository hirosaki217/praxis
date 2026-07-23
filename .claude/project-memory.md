# Project Memory

Repo-tracked project context for `/home/hieu/praxis`.
This file is intended to be committed so project context can sync across machines.

## Project overview
- Project: **PizzaForge** / Order Pizza
- Scope: storefront for customers + admin dashboard for operations
- Direction: **FE-first**, production-oriented, focus on business logic + frontend UX

## Core stack
- React + Vite + TypeScript
- Tailwind + shadcn/ui
- React Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- MSW + localStorage mock backend

## Architecture notes
- UI -> feature hooks -> `lib/api` -> MSW/backend
- Business logic stays pure in reusable modules:
  - `src/lib/pricing/`
  - `src/lib/orders/`
- Shared UI lives in:
  - `src/components/shared/`
- App shell/routing/providers live in:
  - `src/app/`

## Current progress
- Phase 0–4: completed
- Phase 5 storefront happy path: completed at baseline level
  - menu browse
  - quick add / product configurator
  - cart store + cart page
  - checkout form + order creation
  - tracking by `orderId`
- Phase 6.1: completed
  - admin order board base
  - detail drawer
  - status transition actions
- Phase 6.2: completed
  - stronger admin filters
  - optimistic transitions
  - constrained drag/drop on the board

## Current status snapshot
- Storefront and admin are now connected end-to-end:
  - storefront order creation shows up in admin board
  - admin status updates reflect back into storefront tracking
- Build/test/lint were passing at the end of the latest completed slice.

## Likely next priorities
1. Phase 6.3 admin enrich
   - cancel/refund flow
   - richer filters
   - order history / audit improvements
2. Storefront polish
   - voucher UX
   - account/history/address screens
   - checkout UX improvements
3. Perf / quality
   - additional tests
   - code splitting / bundle size cleanup

## Important conventions
- Do not mix project memory into `src/`; keep repo-tracked context under `.claude/` or `docs/`.
- Prefer updating this file when major project direction or progress changes.
- Keep implementation details in code/docs; keep this file focused on durable project context.
