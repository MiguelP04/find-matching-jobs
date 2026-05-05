# AGENTS.md

## Monorepo Layout
- `apps/backend`: NestJS (PostgreSQL, TypeORM/Prisma, JSearch API)
- `apps/frontend`: NextJS (App Router, Tailwind CSS)
- `packages/types`: Shared TypeScript DTOs

## Commands
### Backend (apps/backend)
- Dev: `npm run start:dev`
- Test: `npm run test` (Jest)
- Build: `npm run build`

### Frontend (apps/frontend)
- Dev: `npm run dev`
- Test: `npm run test` (Jest/React Testing Library)
- Build: `npm run build`

## Environment
### Backend
- `.env` in `apps/backend`:
  - `DATABASE_URL`: PostgreSQL connection string
  - `JWT_SECRET`: JWT signing secret
  - `JSEARCH_API_KEY`: RapidAPI JSearch key

### Frontend
- `.env.local` in `apps/frontend`:
  - `NEXT_PUBLIC_API_URL`: Backend base URL (e.g., http://localhost:3000)

## Key Paths
- Matching logic: `apps/backend/src/matching`
- JSearch service: `apps/backend/src/jsearch`
- Full specs/timeline: `PLAN_DESARROLLO.md`

## Migrations (TypeORM)
### Backend (apps/backend)
- Generate: `npm run migration:generate -- MigrationName`
- Run: `npm run migration:run`
- Revert: `npm run migration:revert`
- Initial migration created: `src/migrations/1746400000000-InitialSchema.ts`
- Uses `src/config/data-source.ts` for CLI configuration
- Synchronize is disabled (`false`) - uses migrations only

### Setup local
1. Configure `.env` with `DATABASE_URL`
2. Run `npm run db:create` to create the database
3. Run `npm run migration:run` to apply migrations

## Git Rules
- **NEVER** commit changes without explicit user permission
- **NEVER** push to remote without explicit user permission
- Only commit or push when the user explicitly requests it
