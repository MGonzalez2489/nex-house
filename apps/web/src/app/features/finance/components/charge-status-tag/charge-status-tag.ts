import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ChargeStatusEnum } from '@nex-house/enums';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-charge-status-tag',
  imports: [TagModule],
  templateUrl: './charge-status-tag.html',
  styleUrl: './charge-status-tag.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargeStatusTag {
  status = input.required<string>();

  severity = computed(() => {
    const cStatus = this.status();
    if (cStatus === ChargeStatusEnum.PAID) return 'success';
    if (cStatus === ChargeStatusEnum.PENDING) return 'warn';
    if (cStatus === ChargeStatusEnum.CANCELLED) return 'secondary';

    return 'info';
  });

  label = computed(() => {
    const cStatus = this.status();
    if (cStatus === ChargeStatusEnum.PAID) return 'Pagado';
    if (cStatus === ChargeStatusEnum.PENDING) return 'Pendiente';
    if (cStatus === ChargeStatusEnum.CANCELLED) return 'Cancelado';

    return 'Parcial';
  });
}
