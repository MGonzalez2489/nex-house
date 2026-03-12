import { FormControl } from '@angular/forms';

export type IUserForm = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phone: FormControl<string>;
  email: FormControl<string>;
  isAdmin: FormControl<boolean>;
};
