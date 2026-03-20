import { FormControl, FormGroup } from '@angular/forms';
import { UnitModel } from '@nex-house/models';

export type ICreateUserForm = {
  firstName: FormControl<string>;
  lastName: FormControl<string | null>;
  phone: FormControl<string | null>;
  email: FormControl<string>;

  unit: FormControl<UnitModel | null>;
  newUnit: FormGroup<IUserUnitForm>;

  isAdmin: FormControl<boolean>;
  isOwner: FormControl<boolean>;
  isFamily: FormControl<boolean>;
  isTenant: FormControl<boolean>;
};

export type IUserUnitForm = {
  streetName: FormControl<string>;
  identifier: FormControl<string>;
};
