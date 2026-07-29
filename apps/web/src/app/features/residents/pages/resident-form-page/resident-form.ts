import { FormControl } from "@angular/forms";

export type CreateResidentForm = {
  email: FormControl<string>;
  userRoleId: FormControl<string | undefined>;

  unitId: FormControl<string | undefined>;

  streetId: FormControl<string | undefined>;
  unitTypeId: FormControl<string | undefined>;
  unitIdentifier: FormControl<string | undefined>;

  unitRoleId: FormControl<string | undefined>;
  isCurrentOccupant: FormControl<boolean>;
};
