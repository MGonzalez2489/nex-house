import { FormControl } from '@angular/forms';

export interface INeighborhoodsForm {
  name: FormControl<string>;
  slug: FormControl<string>;
  address: FormControl<string>;
}
