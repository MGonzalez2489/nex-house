import { FormControl } from "@angular/forms";
import { CreateUnit } from "@nexhouse/shared-domain/interfaces";

export type CreateResidentForm = {
  email: FormControl<string>;
  userRoleId: FormControl<string | undefined>;

  unitId: FormControl<string | undefined>;
  unit: FormControl<CreateUnit | null>;
};
