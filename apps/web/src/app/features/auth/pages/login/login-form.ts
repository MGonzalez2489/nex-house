import { FormControl } from '@angular/forms';

export type ILoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};
