import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { UserStatusEnum } from '@nex-house/enums';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-user-status-tag',
  imports: [TagModule],
  templateUrl: './user-status-tag.html',
  styleUrl: './user-status-tag.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class UserStatusTag {
  status = input.required<string>();
  mode = input<'tag' | 'label'>('tag');

  size = input<'small' | 'normal' | 'large'>('normal');

  label = computed(() => {
    const cStatus = this.status();
    let label = 'Desconocido';

    if (cStatus === UserStatusEnum.ACTIVE) label = 'Activo';
    if (cStatus === UserStatusEnum.INACTIVE) label = 'Inactivo';
    if (cStatus === UserStatusEnum.PENDING_COMPLETION) label = 'Pendiente';

    return label;
  });

  severity = computed(() => {
    const cStatus = this.status();

    if (cStatus === UserStatusEnum.ACTIVE) return 'info';
    if (cStatus === UserStatusEnum.INACTIVE) return 'secondary';
    if (cStatus === UserStatusEnum.PENDING_COMPLETION) return 'warn';

    return 'secondary';
  });
}
