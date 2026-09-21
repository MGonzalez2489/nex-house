import { FormControl } from "@angular/forms";
import { CreateUnit } from "@nexhouse/shared-domain/interfaces";

export type CreateResidentForm = {
  email: FormControl<string>;
  userRoleId: FormControl<string>;

  unit: FormControl<CreateUnit | null>;
};