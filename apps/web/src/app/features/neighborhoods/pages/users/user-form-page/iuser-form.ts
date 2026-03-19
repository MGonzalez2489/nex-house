import { FormControl, FormGroup } from '@angular/forms';

export type ICreateUserForm = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phone: FormControl<string>;
  email: FormControl<string>;

  unitId: FormControl<string>;
  unit: FormGroup<IUserUnitForm>;

  isAdmin: FormControl<boolean>;
  isOwner: FormControl<boolean>;
  isFamily: FormControl<boolean>;
  isTenant: FormControl<boolean>;
};

export type IUserUnitForm = {
  streetName: FormControl<string>;
  identifier: FormControl<string>;
};
