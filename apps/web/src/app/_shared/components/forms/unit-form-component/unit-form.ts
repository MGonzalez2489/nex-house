import {FormControl} from '@angular/forms';

export interface NewUnitForm {
  streetId: FormControl<string>;
  unitTypeId: FormControl<string>;
  unitIdentifier: FormControl<string>;
  unitRoleId: FormControl<string>;
  isCurrentOccupant: FormControl<boolean>;
}
