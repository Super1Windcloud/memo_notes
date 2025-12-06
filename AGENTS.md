# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router entry point; `layout.tsx` wires providers, route folders hold page-specific UI, API routes live in `app/api/`.
- `components/`: Shared React components; `components/ui/` is shadcn/ui generated set; `components/QueryProvider.tsx` bootstraps TanStack Query.
- `lib/`: Cross-cutting utilities such as `lib/store` (Zustand stores), `lib/supabase-client.ts`, and `lib/utils.ts`.
- `hooks/`: Custom hooks (e.g., `use-mobile`), imported via the `@/*` alias defined in `tsconfig.json`.
- `types/`: Shared TypeScript types; `public/`: static assets; `tests/setup.ts`: Vitest + RTL setup; Husky hooks in `.husky/`.

## Build, Test, and Development Commands
- `pnpm dev`: Start the local dev server at `localhost:3000`.
- `pnpm build`: Production build; `pnpm start`: build then run in prod mode.
- `pnpm lint`: Run ESLint; `pnpm fix`: Format/lint with Biome (auto-run by `.husky/pre-commit`).
- `pnpm test`: Run Vitest in watch mode; `pnpm test:ui`: Vitest UI; `pnpm test:coverage`: generate coverage.
- `pnpm shadcn`: Add shadcn/ui components; `pnpm taze`: bump dependencies; `pnpm clean`: remove `node_modules`.

## Coding Style & Naming Conventions
- TypeScript-first with strict mode; prefer functional components and hooks.
- Formatting via Biome (2-space indent, semicolons, single quotes by default) and linting via ESLint; run `pnpm fix` before commits.
- Components/React files use PascalCase; hooks start with `use`; shared utilities stay in `lib/`; route segments in `app/` follow Next.js folder conventions.
- Tailwind v4 tokens live in `app/globals.css`; keep design tokens and shadcn/ui styles consistent across pages.

## Testing Guidelines
- Vitest with React Testing Library and jsdom (`tests/setup.ts` mocks Next router and `matchMedia`).
- Place specs beside code or in `__tests__` with `.test.ts`/`.test.tsx` suffix.
- Cover new components, hooks, and data-fetching paths; include accessibility assertions where UI changes occur.
- Use `pnpm test` during development and `pnpm test:coverage` before merging significant changes.

## Commit & Pull Request Guidelines
- Follow conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`). The history already uses these prefixes.
- One logical change per commit; keep messages imperative and scoped (e.g., `feat: add dashboard cards`).
- PRs should include a summary, linked issue (if any), test/coverage notes, and screenshots or screen recordings for UI changes.
- Call out env or migration changes explicitly and update `.env.local` instructions when new vars are required.

## Security & Configuration Tips
- Keep secrets in `.env.local`; never commit Supabase keys or auth tokens. Provide sample keys in docs only.
- Sanitize user input in API routes; prefer Zod schemas already used in forms.
- When adding dependencies, prefer ESM-compatible packages to stay aligned with Next 16 and the bundler settings.
