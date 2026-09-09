import {FormControl} from '@angular/forms';

export interface NewUnitForm {
  unitId: FormControl<string>;
  streetId: FormControl<string>;
  unitTypeId: FormControl<string>;
  unitIdentifier: FormControl<string>;
  unitRoleId: FormControl<string>;
  isCurrentOccupant: FormControl<boolean>;
}

export type UnitMode = 'create' | 'existing';