# UserModule

`apps/api/src/administration/user/user.module.ts`

Feature module that groups user account, profile and onboarding concerns.

## Imports

| Module | Purpose |
|---|---|
| `TypeOrmModule.forFeature([User, UserProfile])` | Repositories for users and their profiles |
| `CatalogsModule` | Catalog lookups (`UserRole`, `UserStatus`, `UnitType`, `UnitStatus`, `UserUnitRole`) |
| `CoreModule` | Core providers (e.g. `CryptoService`) |
| `StorageModule` | Avatar file persistence used by `ProfileService` |
| `UnitsModule` | `UnitService`, consumed by the onboarding controller to create the initial unit |

## Controllers

| Controller | Base route | Purpose |
|---|---|---|
| `UserController` | `user` | Current user retrieval, update and neighborhood metrics |
| `ProfileController` | `user/profile` | Current user's profile read/update |
| `OnboardingController` | `onboarding` | Onboarding progress, password change, profile/unit steps and completion |

## Providers

| Provider | Purpose |
|---|---|
| `UserService` | User updates, password change and recovery-state cleanup |
| `UserSearchService` | Reusable user lookups by id/email/neighborhood |
| `UserStatsService` | Neighborhood-scoped user aggregations |
| `OnboardingService` | Onboarding progress computation and completion |
| `ProfileService` | User profile read/update and avatar handling |

## Exports

`UserService`, `UserSearchService` and `OnboardingService` are exported for `AuthModule` (login, password recovery) and other consumers.
