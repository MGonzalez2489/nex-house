import { FormControl } from "@angular/forms";

export interface NewUnitForm {
  streetId: FormControl<string | undefined>;
  unitTypeId: FormControl<string | undefined>;
  unitIdentifier: FormControl<string | undefined>;

  unitRoleId: FormControl<string | undefined>;
  isCurrentOccupant: FormControl<boolean>;
}
