import { FormControl, FormGroup } from '@angular/forms';

export type ICreateUserForm = {
  firstName: FormControl<string>;
  email: FormControl<string>;
  isAdmin: FormControl<boolean>;
  unitId: FormControl<string>;
  unit: FormGroup<IUserUnitForm>;
};

export type IUpdateUserForm = {
  lastName: FormControl<string>;
  phone: FormControl<string>;
} & ICreateUserForm;

export type IUserUnitForm = {
  streetName: FormControl<string>;
  identifier: FormControl<string>;
};
