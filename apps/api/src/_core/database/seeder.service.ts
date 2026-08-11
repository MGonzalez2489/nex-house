import { CryptoService } from '@core/services';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import {
  ChargeStatus,
  City,
  Country,
  FeeStatus,
  PaymentStatus,
  State,
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
import {
  CountrySeed,
  StateSeed,
  ChihuahuaCitiesSeed,
} from './seeds/location.seed';

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
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting catalog seeding validation...');
    await this.seedAllCatalogs();
    await this.seedSuperAdmin();
    await this.runLocationSeed();
  }

  async runLocationSeed() {
    const existing = await this.countryRepository.count();
    if (existing > 0) return;

    // 1. Seed Country
    for (const countryData of CountrySeed) {
      let country = await this.countryRepository.findOneBy({
        code: countryData.code,
      });
      if (!country) {
        country = await this.countryRepository.save(countryData);
      }
    }

    // 2. Seed States
    const mexico = await this.countryRepository.findOneBy({ code: 'MX' });
    for (const stateData of StateSeed) {
      const exists = await this.stateRepository.findOneBy({
        code: stateData.code,
      });
      if (!exists) {
        await this.stateRepository.save({
          name: stateData.name,
          code: stateData.code,
          displayName: stateData.displayName,
          countryId: mexico.id,
        });
      }
    }

    // 3. Seed Cities (Chihuahua)
    const chihuahuaState = await this.stateRepository.findOneBy({
      code: 'CHH',
    });
    for (const cityData of ChihuahuaCitiesSeed) {
      const exists = await this.cityRepository.findOneBy({
        name: cityData.name,
        displayName: cityData.displayName,
        stateId: chihuahuaState.id,
      });
      if (!exists) {
        await this.cityRepository.save({
          name: cityData.name,
          displayName: cityData.displayName,
          stateId: chihuahuaState.id,
        });
      }
    }
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
