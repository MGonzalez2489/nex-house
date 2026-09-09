---
name: project-structure
description: Standards for folder organization, application architecture, feature modularization, and file placement in the Angular workspace.
---

# Skill: Workspace Project Structure

Apply these rules whenever creating, refactoring, or organizing files, folders, stores, routes, or features within the project.

## 1. Directory Blueprint & Responsibilities

```text
src/app/
├── _core/                  # Global application artifacts (singleton scope)
│   ├── layout/             # Shell elements (Navbar, Sidebar, Footer, Main Layout)
│   ├── stores/             # Global NgRx SignalStores (Auth, User Session, Theme)
│   ├── services/           # Global services (HTTP Interceptors, Global Guards)
│   └── models/             # App-wide interfaces and types
├── _shared/                # Pure reusable presentation layer
│   ├── components/         # Base UI elements (Buttons, Modals, Badges, Cards)
│   ├── directives/         # Reusable custom directives
│   └── pipes/              # Custom formatting pipes
└── features/               # Domain-driven features
    └── [feature-name]/     # Isolated feature module
        ├── components/     # Domain-specific presentational components
        ├── pages/          # Smart components (routed pages)
        ├── stores/         # Feature-specific NgRx SignalStores
        ├── services/       # Feature-specific domain services
        ├── models/         # Feature-specific types/interfaces
        └── [feature].routes.ts # Feature routing definition
```

## 2. Component Categorization & Placement

- Pages (`features/[feature-name]/pages/`):

  - Smart components bound directly to routes via `[feature].routes.ts`.

  - Responsible for injecting feature `SignalStore`, orchestrating data, and passing states to sub-components.

- Feature Components (`features/[feature-name]/components/`):

  - Presentational components bound strictly to the domain logic of a single feature.

- Shared Components (`app/_shared/components/`):

  - Pure UI components used across multiple features. MUST NOT contain domain logic or store dependencies.

- Core Components (app/\_core/layout/):

  - Application-level layout structures (Header, Sidebar, Shell Views).

## 3. State Management Architecture (NgRx SignalStore)

- Global Stores: Place in `app/_core/stores/` for state accessible across the entire app (e.g., Auth, Global Settings).

- Feature Stores: Place in `features/[feature-name]/stores/` for domain-specific state.

- Store Pattern: ALWAYS define stores using `signalStore()` with `withState`, `withComputed`, and `withMethods`. All state mutations MUST happen through `patchState`.

## 4. Modular Routing Standard

- Every feature MUST expose a dedicated `[feature].routes.ts` file containing its internal navigation graph.

- Root application routes (`app.routes.ts`) MUST load feature routes via Lazy Loading (`loadChildren` or `loadComponent`).
