import { Pipe, PipeTransform } from '@angular/core';
import { UserRoleEnum } from '@nex-house/enums';

@Pipe({
  name: 'role',
})
export class RolePipe implements PipeTransform {
  transform(value: string) {
    if (value === UserRoleEnum.ADMIN) return 'Administrador';
    if (value === UserRoleEnum.RESIDENT) return 'Residente';
    if (value === UserRoleEnum.SUPER_ADMIN) return 'ROOT';

    return 'Unknown';
  }
}
