# ResidentStatusComponent (web)

Small presentational component that maps a `UserStatusModel` to an Optimus-UI
`p-tag` severity.

- **File:** `apps/web/src/app/features/residents/components/resident-status/resident-status-component.ts`
- **Template:** `resident-status-component.html` (standalone, `OnPush`)
- **Inputs:** `status: UserStatusModel` (required)

## Severity mapping

| Status (`status.name`) | Severity |
|---|---|
| `UserStatusEnum.ACTIVE` (`active`) | `success` |
| `UserStatusEnum.INACTIVE` (`inactive`) | `secondary` |
| `UserStatusEnum.PENDING_ONBOARDING` (`PENDING_ONBOARDING`) | `warn` |
| `UserStatusEnum.PASSWORD_RECOVERY` (`PASSWORD_RECOVERY`) | `danger` |
| anything else | `secondary` |

## Notes

- The severity is derived with a `computed()` signal keyed on `status.name`.
- The spec file previously imported a misspelled module
  (`./resudent-status-component`); it is fixed to `./resident-status-component`.

## Test coverage

- `apps/web/src/app/features/residents/components/resident-status/resident-status-component.spec.ts`
- Covers the severity mapping for every `UserStatusEnum` value and the default
  fallback.