import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {UserRoleEnum, UserStatusEnum} from '@nexhouse/shared-domain/enums';
import {UserStats} from '@nexhouse/shared-domain/interfaces';
import {Panel} from '@openng/optimus-ui/panel';
import {Tag} from '@openng/optimus-ui/tag';
import {BadgeSeverity} from '@openng/optimus-ui/types/badge';

interface RoleRow {
  code: string;
  label: string;
  dotClass: string;
  count: number;
}

interface StatusRow {
  code: string;
  label: string;
  severity: BadgeSeverity;
  icon: string;
  count: number;
}

type RolePresetKeys = Exclude<UserRoleEnum, UserRoleEnum.SUPERADMIN>;

const ROLE_PRESETS: Record<RolePresetKeys, {label: string; dotClass: string}> = {
  [UserRoleEnum.ADMIN]: {
    label: 'Administradores',
    dotClass: 'bg-purple-500',
  },
  [UserRoleEnum.RESIDENT]: {
    label: 'Residentes',
    dotClass: 'bg-blue-500',
  },
};

const STATUS_PRESETS: Record<
  UserStatusEnum,
  {label: string; severity: BadgeSeverity; icon: string}
> = {
  [UserStatusEnum.ACTIVE]: {
    label: 'Activo',
    severity: 'success',
    icon: 'pi pi-check-circle',
  },
  [UserStatusEnum.INACTIVE]: {
    label: 'Inactivo',
    severity: 'secondary',
    icon: 'pi pi-ban',
  },
  [UserStatusEnum.PENDING_ONBOARDING]: {
    label: 'Pendiente',
    severity: 'warn',
    icon: 'pi pi-clock',
  },
  [UserStatusEnum.PASSWORD_RECOVERY]: {
    label: 'Recuperación de contraseña',
    severity: 'danger',
    icon: 'pi pi-key',
  },
};

const DEFAULT_DOT_CLASS = 'bg-slate-400';

@Component({
  selector: 'app-resident-stats',
  imports: [Panel, Tag],
  templateUrl: './resident-stats.html',
  styleUrl: './resident-stats.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentStats {
  readonly stats = input<UserStats>();

  protected readonly roleRows = computed<RoleRow[]>(() => {
    const stats = this.stats();
    if (!stats) return [];

    return Object.entries(stats.byRole).map(([code, count]) => {
      const preset = ROLE_PRESETS[code as RolePresetKeys];
      return {
        code,
        label: preset?.label ?? code,
        dotClass: preset?.dotClass ?? DEFAULT_DOT_CLASS,
        count,
      };
    });
  });

  protected readonly statusRows = computed<StatusRow[]>(() => {
    const stats = this.stats();
    if (!stats) return [];

    return Object.entries(stats.byStatus)
      .map(([code, count]) => {
        const preset = STATUS_PRESETS[code as UserStatusEnum];
        return {
          code,
          label: preset?.label ?? code,
          severity: preset?.severity ?? 'secondary',
          icon: preset?.icon ?? 'pi pi-circle',
          count,
        };
      })
      .sort((a, b) => b.count - a.count);
  });

  protected readonly totalUsers = computed(() => this.stats()?.summary.totalUsers ?? 0);
}
