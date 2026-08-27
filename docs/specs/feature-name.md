# Specification: [Nombre de la Funcionalidad en Inglés]

## 1. Goal & Context

- **Feature Name:** [Ejemplo: Neighborhood Address Management]
- **Target App/Lib:** [`apps/api`, `apps/web`, `libs/shared-domain`][cite: 1]
- **User Story:** As a [Role, e.g., SuperAdmin], I want to [Action, e.g., manage the location address of a neighborhood] so that [Benefit, e.g., I can distinguish neighborhoods with identical names across cities][cite: 1].

## 2. Shared Models & DTOs (`libs/shared-domain`)

Define TypeScript interfaces and DTO validation rules.

### DTOs

- `Create[Feature]Dto`:
  - `field_name`: `type` (validations: `@IsString()`, `@IsOptional()`, etc.)
- `Update[Feature]Dto`: Partial of `Create[Feature]Dto`.

## 3. Database & Architecture (`apps/api`)

- **Entities Involved:** [e.g., `NeighborhoodAddress`, `City`, `State`][cite: 1]
- **Relations:**
  - `NeighborhoodAddress` 1:1 `Neighborhood` (Cascade Delete)
  - `NeighborhoodAddress` N:1 `City` (Restrict Delete)
- **Special Rules:**
  - Mappers must remain pure functions using helper parameters or `process.env.APP_URL`[cite: 2, 3].
  - Use `@InjectRepository()` for database access in services[cite: 1].

## 4. API Endpoints

- `POST /api/v1/[resource]`: Create resource.
- `GET /api/v1/[resource]/:id`: Get detailed resource.
- `PATCH /api/v1/[resource]/:id`: Update resource.

## 5. Frontend Specs (`apps/web`)

- **UI Components:** [PrimeNG Table, Dialog, Form Controls, Tailwind styling][cite: 1, 2]
- **UX Flow:** Steps or modals required for input validation.

## 6. Definition of Done (DoD)

- [ ] DTOs and Enums added to `@nexhouse/shared-domain`[cite: 1].
- [ ] TypeORM entities and migrations generated[cite: 1].
- [ ] Controller/Service implemented with proper DI[cite: 1].
- [ ] Unit tests generated using Jest (`npx nx test api`).
- [ ] Git commit created following Conventional Commits (`feat(scope): ...`)[cite: 2].
