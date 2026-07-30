import { User } from '@core/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import { UserStats } from '@nexhouse/shared-domain/interfaces';
import { Repository } from 'typeorm';

@Injectable()
export class UserStatsService {
  private readonly logger = new Logger(UserStatsService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async getStats(neighborhoodId: number): Promise<UserStats> {
    // 1. Obtener conteo por Rol (Excluyendo SUPERADMIN)
    const rawRoleStats = await this.repository
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .select('role.name', 'roleCode') // Reemplaza 'code' o 'name' según el campo en tu entidad UserRole
      .addSelect('COUNT(user.id)', 'count')
      .where('role.name != :superAdminRole', {
        superAdminRole: UserRoleEnum.SUPERADMIN,
      })
      .andWhere('user.neighborhoodId = :neighborhoodId', { neighborhoodId })
      .groupBy('role.name')
      .getRawMany<{ roleCode: string; count: string }>();

    // 2. Obtener conteo por Status (Excluyendo usuarios con rol SUPERADMIN)
    const rawStatusStats = await this.repository
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .innerJoin('user.status', 'status')
      .select('status.name', 'statusCode') // Reemplaza 'code' o 'name' según el campo en tu entidad UserStatus
      .addSelect('COUNT(user.id)', 'count')
      .where('role.name != :superAdminRole', {
        superAdminRole: UserRoleEnum.SUPERADMIN,
      })
      .groupBy('status.name')
      .getRawMany<{ statusCode: string; count: string }>();

    // 3. Mapear los resultados a la estructura final
    const byRole: Record<string, number> = {};
    let totalUsers = 0;

    for (const row of rawRoleStats) {
      const count = parseInt(row.count, 10);
      byRole[row.roleCode] = count;
      totalUsers += count; // El total es la suma de los usuarios válidos
    }

    const byStatus: Record<string, number> = {};
    for (const row of rawStatusStats) {
      byStatus[row.statusCode] = parseInt(row.count, 10);
    }

    return {
      summary: {
        totalUsers,
      },
      byRole,
      byStatus,
    };
  }
}
