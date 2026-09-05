# NexHouse - Monorepo Context & Architecture

NexHouse is a SaaS system for neighborhood management and automated financial control in condominiums.

## Tech Stack

- **Monorepo Engine:** NX Workspaces
- **Backend App (`apps/api`):** NestJS, TypeORM, MySQL, Redis, WebSockets (Socket.io)
- **Frontend App (`apps/web`):** Angular (v21+), PrimeNG (v21), Tailwindcss (v4.x)
- **Shared Libraries (`libs/`):**
  - `libs/shared-domain`: Domain interfaces, DTOs, Enums,Models, contracts.
- **Infrastructure:** Docker & Docker Compose (unified bridge network).

## Directory Structure

```text
nexhouse/
├── apps/
│   ├── api/                   # NestJS Application
│   └── web/                   # Angular Application
├── libs/
│   ├── shared-domain/         # Shared Contracts & Types
├── .ai/                       # Generic AI Rules and Agent Skills
│   ├── context/               # Repository maps and specs
│   ├── rules/                 # Code style & DB standards
│   └── skills/                # AI step-by-step workflows
├── docker-compose.yml         # Container services
└── package.json
```
