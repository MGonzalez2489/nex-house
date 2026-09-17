import { CryptoService } from '@core/services';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum, UserStatusEnum } from '@nexhouse/shared-domain/enums';
import {
  DeepPartial,
  EntityManager,
  EntityTarget,
  Repository,
} from 'typeorm';
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
  ChihuahuaCitiesSeed,
  CountrySeed,
  StateSeed,
} from './seeds/location.seed';

/**
 * Declarative mapping between a catalog entity and its default records.
 */
interface CatalogSeedDefinition {
  /** Human readable entity name, used for logging. */
  name: string;
  entity: EntityTarget<BaseCatalog>;
  data: DeepPartial<BaseCatalog>[];
}

const MEXICO_COUNTRY_CODE = 'MX';
const CHIHUAHUA_STATE_CODE = 'CHH';

/**
 * Bootstraps the database on the first application startup.
 *
 * The seeding is idempotent: every routine only inserts the records that are
 * still missing, so it is safe to run on every boot and after partial seeds.
 * Failures are isolated per routine so a single broken step cannot prevent the
 * application from starting.
 */
@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  /** Catalog entities seeded with their default records. */
  private readonly catalogSeeds: CatalogSeedDefinition[] = [
    { name: 'ChargeStatus', entity: ChargeStatus, data: ChargeStatusSeed },
    { name: 'FeeStatus', entity: FeeStatus, data: FeeStatusSeed },
    { name: 'PaymentStatus', entity: PaymentStatus, data: PaymentStatusSeed },
    {
      name: 'TransactionSource',
      entity: TransactionSource,
      data: TransactionSourceSeed,
    },
    {
      name: 'TransactionType',
      entity: TransactionType,
      data: TransactionTypeSeed,
    },
    { name: 'UnitStatus', entity: UnitStatus, data: UnitStatusSeed },
    { name: 'UnitType', entity: UnitType, data: UnitTypeSeed },
    { name: 'UserRole', entity: UserRole, data: UserRoleSeed },
    { name: 'UserStatus', entity: UserStatus, data: UserStatusSeed },
    { name: 'UserUnitRole', entity: UserUnitRole, data: UserUnitRoleSeed },
  ];

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

  /**
   * Entry point invoked by Nest once the application is ready.
   *
   * Catalogs run first (in parallel) because the super admin depends on the
   * `SUPERADMIN` role and `ACTIVE` status they create. The location hierarchy is
   * independent and runs alongside the super admin seed.
   */
  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Running database seeding...');

    await this.seedAllCatalogs();
    await Promise.all([this.runLocationSeed(), this.seedSuperAdmin()]);

    this.logger.log('Database seeding finished.');
  }

  /**
   * Seeds the Mexico country, its states and the Chihuahua cities.
   *
   * Creates only missing records, so it can be re-run safely. Never throws:
   * failures are logged so the application can still boot.
   */
  async runLocationSeed(): Promise<void> {
    try {
      await this.seedCountries();

      const mexico = await this.countryRepository.findOneBy({
        code: MEXICO_COUNTRY_CODE,
      });
      if (!mexico) {
        this.logger.error(
          `Cannot seed states: country '${MEXICO_COUNTRY_CODE}' is missing.`,
        );
        return;
      }

      await this.seedStates(mexico.id);

      const chihuahua = await this.stateRepository.findOneBy({
        code: CHIHUAHUA_STATE_CODE,
      });
      if (!chihuahua) {
        this.logger.error(
          `Cannot seed cities: state '${CHIHUAHUA_STATE_CODE}' is missing.`,
        );
        return;
      }

      await this.seedCities(chihuahua.id);
    } catch (error) {
      this.logger.error(
        `Failure while seeding location data: ${error.message}`,
        error.stack,
      );
    }
  }

  /** Seeds every registered catalog, in parallel. */
  private async seedAllCatalogs(): Promise<void> {
    await Promise.all(
      this.catalogSeeds.map((definition) => this.seedCatalog(definition)),
    );
  }

  /**
   * Inserts the catalog records whose `name` is not present yet, using a single
   * read to compute the missing set and a single `save` to persist them.
   *
   * @param definition Catalog entity and its default records.
   */
  private async seedCatalog(
    definition: CatalogSeedDefinition,
  ): Promise<void> {
    try {
      const repository = this.entityManager.getRepository(definition.entity);
      const existing = await repository.find({ select: { name: true } });
      const existingNames = new Set(existing.map((record) => record.name));

      const missing = definition.data.filter(
        (record) => record.name && !existingNames.has(record.name),
      );

      if (missing.length === 0) {
        return;
      }

      await repository.save(missing);
      this.logger.log(
        `Seeded ${missing.length} missing [${definition.name}] record(s).`,
      );
    } catch (error) {
      this.logger.error(
        `Error seeding catalog [${definition.name}]: ${error.message}`,
        error.stack,
      );
    }
  }

  /** Seeds the countries defined in `CountrySeed`. */
  private async seedCountries(): Promise<void> {
    for (const countryData of CountrySeed) {
      const exists = await this.countryRepository.existsBy({
        code: countryData.code,
      });
      if (!exists) {
        await this.countryRepository.save(
          this.countryRepository.create(countryData),
        );
      }
    }
  }

  /**
   * Seeds the states linked to a country, inserting only the missing codes.
   *
   * @param countryId Internal id of the owning country.
   */
  private async seedStates(countryId: number): Promise<void> {
    const existing = await this.stateRepository.find({
      select: { code: true },
    });
    const existingCodes = new Set(existing.map((state) => state.code));

    const missing = StateSeed.filter(
      (stateData) => !existingCodes.has(stateData.code),
    ).map((stateData) =>
      this.stateRepository.create({ ...stateData, countryId }),
    );

    if (missing.length > 0) {
      await this.stateRepository.save(missing);
      this.logger.log(`Seeded ${missing.length} missing state(s).`);
    }
  }

  /**
   * Seeds the cities linked to a state, inserting only the missing names.
   *
   * @param stateId Internal id of the owning state.
   */
  private async seedCities(stateId: number): Promise<void> {
    const existing = await this.cityRepository.find({
      where: { stateId },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((city) => city.name));

    const missing = ChihuahuaCitiesSeed.filter(
      (cityData) => !existingNames.has(cityData.name),
    ).map((cityData) => this.cityRepository.create({ ...cityData, stateId }));

    if (missing.length > 0) {
      await this.cityRepository.save(missing);
      this.logger.log(`Seeded ${missing.length} missing city(ies).`);
    }
  }

  /**
   * Seeds the super admin account from `SUPER_ADMIN_USER` / `SUPER_ADMIN_PWD`.
   *
   * Skips silently when the account already exists and warns when the
   * credentials are not configured. The role and status are resolved from their
   * catalogs by name instead of relying on hard-coded primary keys.
   */
  private async seedSuperAdmin(): Promise<void> {
    const rawEmail = this.configService.get<string>('SUPER_ADMIN_USER');
    const rawPassword = this.configService.get<string>('SUPER_ADMIN_PWD');

    if (!rawEmail || !rawPassword) {
      this.logger.warn(
        'SUPER_ADMIN_USER / SUPER_ADMIN_PWD are not configured. Skipping super admin seed.',
      );
      return;
    }

    const email = rawEmail.trim().toLowerCase();

    try {
      const exists = await this.userRepository.exists({ where: { email } });
      if (exists) {
        return;
      }

      this.logger.log(
        'Super admin account not found. Creating it from environment credentials...',
      );

      const [role, status] = await Promise.all([
        this.entityManager
          .getRepository(UserRole)
          .findOneBy({ name: UserRoleEnum.SUPERADMIN }),
        this.entityManager
          .getRepository(UserStatus)
          .findOneBy({ name: UserStatusEnum.ACTIVE }),
      ]);

      if (!role || !status) {
        this.logger.error(
          'Cannot seed super admin: SUPERADMIN role or ACTIVE status catalog is missing.',
        );
        return;
      }

      const hashedPassword = await this.cryptoService.hash(rawPassword);

      const superAdmin = this.userRepository.create({
        email,
        password: hashedPassword,
        roleId: role.id,
        statusId: status.id,
        profile: {
          firstName: 'Super',
          lastName: 'Admin',
        },
      });

      await this.userRepository.save(superAdmin);
      this.logger.log(`Super admin account '${email}' seeded successfully.`);
    } catch (error) {
      this.logger.error(
        `Failure while seeding the super admin account: ${error.message}`,
        error.stack,
      );
    }
  }
}
