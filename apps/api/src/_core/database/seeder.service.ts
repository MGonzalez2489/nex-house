import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import {
  ChargeStatus,
  FeeStatus,
  PaymentStatus,
  TransactionSource,
  TransactionType,
  UnitStatus,
  UnitType,
  User,
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
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import { CryptoService } from '@core/services';

type CatalogRegistry = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entity: EntityTarget<any>;
  data: Partial<BaseCatalog>[];
};

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting catalog seeding validation...');
    await this.seedAllCatalogs();
    await this.seedSuperAdmin();
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

  private async seedSuperAdmin() {
    const superAdminEnv = {
      email: this.configService.get<string>('SUPER_ADMIN_USER') || '',
      pwd: this.configService.get<string>('SUPER_ADMIN_PWD') || '',
    };

    const exists = await this.userRepository.exists({
      where: { email: superAdminEnv.email.toLowerCase() },
    });
    if (exists) {
      return;
    }

    this.logger.log(
      'Super Admin account not found. Instantiating default systemic credentials...',
    );

    try {
      const hashedPassword = await this.cryptoService.hash(superAdminEnv.pwd);

      const superAdminInstance = this.userRepository.create({
        email: superAdminEnv.email.trim().toLowerCase(),
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        roleId: 1, // Systemic SuperAdmin structural mapping id constant
        statusId: 1, // Active operational account status constant
      });

      await this.userRepository.save(superAdminInstance);
      this.logger.log('🚀 Super Admin structural profile seeded successfully.');
    } catch (error) {
      this.logger.error(
        `🔴 Failure encountered during Super Admin instantiation context: ${error.message}`,
      );
    }
  }
}
