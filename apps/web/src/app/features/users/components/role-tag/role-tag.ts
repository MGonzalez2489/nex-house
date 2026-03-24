import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { UserRoleEnum } from '@nex-house/enums';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-role-tag',
  imports: [TagModule],
  templateUrl: './role-tag.html',
  styleUrl: './role-tag.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleTag {
  role = input.required<string>();

  severity = computed(() => {
    if (this.role() === UserRoleEnum.ADMIN) return 'info';

    return 'success';
  });

  label = computed(() => {
    const cRole = this.role();
    if (cRole === UserRoleEnum.ADMIN) return 'Administrador';

    return 'Residente';
  });
}
