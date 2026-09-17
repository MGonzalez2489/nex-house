import { User } from '@core/database';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import { UserStats } from '@nexhouse/shared-domain/interfaces';
import { Repository } from 'typeorm';

@Injectable()
export class UserStatsService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  /**
   * Builds aggregate user metrics scoped to a single neighborhood.
   *
   * Super admins are excluded from every bucket because they are not bound to a
   * tenant boundary. Both aggregations are filtered by `neighborhoodId` so
   * counts never leak across neighborhoods.
   *
   * @param neighborhoodId Neighborhood context used to scope the aggregation.
   * @returns Totals grouped by role and by status, plus the global user count.
   */
  async getStats(neighborhoodId: number): Promise<UserStats> {
    const [rawRoleStats, rawStatusStats] = await Promise.all([
      this.repository
        .createQueryBuilder('user')
        .innerJoin('user.role', 'role')
        .select('role.name', 'roleCode')
        .addSelect('COUNT(user.id)', 'count')
        .where('role.name != :superAdminRole', {
          superAdminRole: UserRoleEnum.SUPERADMIN,
        })
        .andWhere('user.neighborhoodId = :neighborhoodId', { neighborhoodId })
        .groupBy('role.name')
        .getRawMany<{ roleCode: string; count: string }>(),
      this.repository
        .createQueryBuilder('user')
        .innerJoin('user.role', 'role')
        .innerJoin('user.status', 'status')
        .select('status.name', 'statusCode')
        .addSelect('COUNT(user.id)', 'count')
        .where('role.name != :superAdminRole', {
          superAdminRole: UserRoleEnum.SUPERADMIN,
        })
        .andWhere('user.neighborhoodId = :neighborhoodId', { neighborhoodId })
        .groupBy('status.name')
        .getRawMany<{ statusCode: string; count: string }>(),
    ]);

    const byRole = this.toCountMap(rawRoleStats, 'roleCode');
    const byStatus = this.toCountMap(rawStatusStats, 'statusCode');
    const totalUsers = Object.values(byRole).reduce(
      (total, count) => total + count,
      0,
    );

    return {
      summary: { totalUsers },
      byRole,
      byStatus,
    };
  }

  /**
   * Converts a raw `SELECT <key>, COUNT(...)` result into a label/count map.
   *
   * @param rows Raw aggregate rows returned by the query builder.
   * @param key Column holding the grouping label.
   */
  private toCountMap<T extends { count: string }>(
    rows: T[],
    key: keyof T & string,
  ): Record<string, number> {
    return rows.reduce<Record<string, number>>((accumulator, row) => {
      accumulator[String(row[key])] = parseInt(row.count, 10);
      return accumulator;
    }, {});
  }
}
