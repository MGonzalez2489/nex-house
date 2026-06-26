import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import {
  ChargeStatus,
  FeeStatus,
  PaymentStatus,
  TransactionSource,
  TransactionType,
  UnitStatus,
  UnitType,
  UserRole,
  UserStatus,
  UserUnitRole,
} from './entities';
import { BaseCatalog } from './entities/_base';
import {
  ChargeStatusSeed,
  FeeStatusSeed,
  PaymentStatusSeed,
  TransactionSourceSeed,
  TransactionTypeSeed,
  UnitStatusSeed,
  UnitTypeSeed,
  UserRoleSeed,
  UserStatusSeed,
  UserUnitRoleSeed,
} from './seeds';

type CatalogRegistry = {
  entity: EntityTarget<any>;
  data: Partial<BaseCatalog>[];
};

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(private readonly entityManager: EntityManager) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting catalog seeding validation...');
    await this.seedAllCatalogs();
  }

  private async seedAllCatalogs() {
    const catalogs: CatalogRegistry[] = [
      {
        entity: ChargeStatus,
        data: ChargeStatusSeed,
      },
      {
        entity: FeeStatus,
        data: FeeStatusSeed,
      },
      {
        entity: PaymentStatus,
        data: PaymentStatusSeed,
      },
      {
        entity: TransactionSource,
        data: TransactionSourceSeed,
      },
      {
        entity: TransactionType,
        data: TransactionTypeSeed,
      },
      {
        entity: UnitStatus,
        data: UnitStatusSeed,
      },
      {
        entity: UnitType,
        data: UnitTypeSeed,
      },
      {
        entity: UserRole,
        data: UserRoleSeed,
      },
      {
        entity: UserStatus,
        data: UserStatusSeed,
      },
      {
        entity: UserUnitRole,
        data: UserUnitRoleSeed,
      },
    ];

    for (const catalog of catalogs) {
      const entityName = (catalog.entity as Partial<BaseCatalog>).name;

      try {
        const count = await this.entityManager.count(catalog.entity);

        if (count === 0) {
          this.logger.log(
            `Table [${entityName}] is empty. Seeding defaults...`,
          );

          await this.entityManager.save(catalog.entity, catalog.data);

          this.logger.log(`[${entityName}] successfully seeded.`);
        }
      } catch (error) {
        this.logger.error(
          `🔴 Error seeding catalog [${entityName}]:`,
          error.message,
        );
      }
    }
  }
}
