# AI Rules for NexHouse Monorepo

## Stack Architecture

- **Monorepo:** NX Workspaces
- **Backend:** NestJS, TypeORM, MySQL[cite: 1, 2]
- **Frontend:** Angular, TailwindCSS, PrimeNG[cite: 1]
- **Shared:** `@nexhouse/shared-domain` (Models, DTOs, Enums)[cite: 1, 3]

## Code Guidelines & Standards

### 1. Git & Commits

- Strictly adhere to Conventional Commits: `type(scope): description` (e.g., `feat(auth): add login endpoint`)[cite: 1].
- Types allowed: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`[cite: 1].
- Descriptions must start in lowercase[cite: 1].

### 2. NestJS / TypeORM (Backend)

- Always decorate entity repositories in constructors with `@InjectRepository(Entity)`[cite: 2].
- Mappers must be pure functions or helper modules[cite: 3].
- Rely on global env configurations (`process.env.APP_URL`) or helper utilities for URLs/Paths rather than injecting request contexts into pure mappers[cite: 3].
- Follow proper DI rules for controllers, services, and interceptors[cite: 2].

### 3. Shared Models & Mappers

- Import models exclusively from `@nexhouse/shared-domain`[cite: 3].
- Maintain strict TypeScript type safety without using `any`.

## Instructions for AI Agent

- Do NOT generate outdated Angular/NestJS syntax.
- Ensure all created imports match NX tsconfig path aliases.
- When generating code, follow existing code patterns in `libs/shared-domain` and `apps/api`[cite: 1].
