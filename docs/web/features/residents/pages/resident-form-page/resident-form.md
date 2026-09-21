# CreateResidentForm (web)

Typed reactive-forms shape for the resident form page.

- **File:** `apps/web/src/app/features/residents/pages/resident-form-page/resident-form.ts`

```ts
export type CreateResidentForm = {
  email: FormControl<string>;
  userRoleId: FormControl<string>;

  unit: FormControl<CreateUnit | null>;
};
```

Drives `ResidentFormPage`'s `FormGroup`. `userRoleId`/`email` are plain
non-nullable `FormControl<string>` instances; `unit` holds a `CreateUnit`
payload (or `null`) produced by `UnitFormComponent`.

`CreateUnit` comes from `@nexhouse/shared-domain/interfaces` and covers both the
"pick an existing unit" (`unitId`) and the "create a new unit" (`streetId`,
`unitIdentifier`, `unitTypeId`) flows plus `unitRoleId` and
`isCurrentOccupant`.