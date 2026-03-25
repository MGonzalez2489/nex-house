import { CryptoService } from '@common/services';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from '@nex-house/enums';
import { Repository } from 'typeorm';
import { HousingUnit, Neighborhood, User } from './entities';
import { UsersService } from '@modules/users';
import { CreateUserDto } from '@modules/users/dtos';

const initUsers: CreateUserDto[] = [
  {
    email: 'admin@test.com',
    firstName: 'Roberto',
    lastName: 'Quintana',
    isAdmin: true,
    isOwner: true,
    isFamily: false,
    isTenant: false,
    streetName: 'Paseo de las Lilas',
    identifier: '101',
    phone: '6141234567',
  },
  {
    email: 'resident@test.com',
    firstName: 'Marta',
    isAdmin: true,
    isOwner: true,
    isFamily: false,
    isTenant: false,
    streetName: 'Calle del Roble',
    identifier: '205',
    phone: '6149876543',
    lastName: '',
  },
  {
    email: 'jorge.v@test.com',
    firstName: 'Jorge',
    lastName: 'Valenzuela',
    isAdmin: true,
    isOwner: false,
    isFamily: true,
    isTenant: false,
    streetName: 'Avenida Los Pinos',
    identifier: '50',
    phone: '',
  },
  {
    email: 'elena.rios@test.com',
    firstName: 'Elena',
    isAdmin: false,
    isOwner: true,
    isFamily: false,
    isTenant: false,
    streetName: 'Sendero de la Fuente',
    identifier: '12-A',
    lastName: '',
    phone: '',
  },
  {
    email: 'sofi.m@test.com',
    firstName: 'Sofia',
    lastName: 'Mendoza',
    isAdmin: false,
    isOwner: false,
    isFamily: true,
    isTenant: false,
    streetName: 'Privada San Juan',
    identifier: '301-B',
    phone: '6141112233',
  },
];

const nextUsers: CreateUserDto[] = [
  {
    email: 'vecino.1@test.com',
    firstName: 'Carlos',
    lastName: 'Ruiz',
    isAdmin: false,
    isOwner: true,
    isFamily: false,
    isTenant: false,
    streetName: 'Paseo de las Lilas',
    identifier: '301-B',
    phone: '6142000001',
  },
  {
    email: 'vecino.2@test.com',
    firstName: 'Ana',
    lastName: 'López',
    isAdmin: false,
    isOwner: false,
    isFamily: true,
    isTenant: false,
    streetName: 'Paseo de las Lilas',
    identifier: '100',
    phone: '',
  },
  {
    email: 'vecino.3@test.com',
    firstName: 'Pedro',
    lastName: 'Gómez',
    isAdmin: false,
    isOwner: false,
    isFamily: false,
    isTenant: true,
    streetName: 'Calle del Roble',
    identifier: '200',
    phone: '6142000003',
  },
  {
    email: 'vecino.4@test.com',
    firstName: 'Lucía',
    lastName: 'Meza',
    isAdmin: false,
    isOwner: true,
    isFamily: false,
    isTenant: false,
    streetName: 'Avenida Los Pinos',
    identifier: '102',
    phone: '',
  },
  {
    email: 'vecino.5@test.com',
    firstName: 'Marcos',
    lastName: 'Fierro',
    isAdmin: false,
    isOwner: false,
    isFamily: true,
    isTenant: false,
    streetName: 'Avenida Los Pinos',
    identifier: '102',
    phone: '',
  },
  {
    email: 'vecino.6@test.com',
    firstName: 'Elena',
    lastName: 'Soto',
    isAdmin: false,
    isOwner: true,
    isFamily: false,
    isTenant: false,
    streetName: 'Sendero de la Fuente',
    identifier: '104',
    phone: '6142000006',
  },
  {
    email: 'vecino.7@test.com',
    firstName: 'Raúl',
    lastName: 'Peña',
    isAdmin: false,
    isOwner: false,
    isFamily: false,
    isTenant: true,
    streetName: 'Privada San Juan',
    identifier: '300',
    phone: '',
  },
  {
    email: 'vecino.8@test.com',
    firstName: 'Sofía',
    lastName: 'Luna',
    isAdmin: false,
    isOwner: true,
    isFamily: false,
    isTenant: false,
    streetName: 'Paseo de las Lilas',
    identifier: '106',
    phone: '',
  },
  {
    email: 'vecino.9@test.com',
    firstName: 'Hugo',
    lastName: 'Rivas',
    isAdmin: false,
    isOwner: false,
    isFamily: true,
    isTenant: false,
    streetName: 'Paseo de las Lilas',
    identifier: '106',
    phone: '6142000009',
  },
  {
    email: 'vecino.10@test.com',
    firstName: 'Diana',
    lastName: 'Vaca',
    isAdmin: false,
    isOwner: true,
    isFamily: false,
    isTenant: false,
    streetName: 'Calle del Roble',
    identifier: '202',
    phone: '',
  },
];

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Neighborhood)
    private readonly neighRepository: Repository<Neighborhood>,
    @InjectRepository(HousingUnit)
    private readonly unitRepository: Repository<HousingUnit>,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.seedSuperAdmin();
      this.logger.log('Sembrado completado exitosamente.');

      this.seedTestData();
    } catch (error) {
      this.logger.error('Error durante el sembrado:', error.message);
    }
  }

  private async seedSuperAdmin() {
    const superAdminEnv = {
      email: this.configService.get<string>('SUPER_ADMIN_USER') || '',
      pwd: this.configService.get<string>('SUPER_ADMIN_PWD') || '',
    };

    const adminExists = await this.userRepository.findOne({
      where: { email: superAdminEnv.email },
    });

    if (!adminExists) {
      this.logger.log('Super Admin no encontrado. Creando uno por defecto...');

      const hashedPassword = await this.cryptoService.hash(superAdminEnv.pwd);

      const superAdmin = this.userRepository.create({
        email: superAdminEnv.email,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRoleEnum.SUPER_ADMIN,
      });

      await this.userRepository.save(superAdmin);
      this.logger.log('Super Admin creado con éxito.');
    } else {
      this.logger.log('Super Admin ya existe en la base de datos.');
    }
  }

  private async seedTestData() {
    const testNeigh = {
      name: 'Fraccionamiento Prueba',
      slug: 'fraccionamiento-prueba',
      address: 'av siempre viva',
    };
    if (
      await this.neighRepository.exists({ where: { name: testNeigh.name } })
    ) {
      this.logger.log('Test data already exists.');
      return;
    }

    this.logger.log('Setting up test data.');
    const neighborhood = this.neighRepository.create(testNeigh);
    await this.neighRepository.save(neighborhood);

    const rUser = await this.userService.findByEmail('root@test.com');
    if (!rUser) return;

    for (const u of initUsers) {
      try {
        await this.userService.create(neighborhood.publicId, u, rUser);
        this.logger.log(`User ${u.email} seeded successfully.`);
      } catch (error) {
        this.logger.error(`Failed to seed user ${u.email}: ${error.message}`);
      }
    }

    const allUnits = await this.unitRepository.find({
      where: { neighborhoodId: neighborhood.id },
    });
    console.log('all units', allUnits.length);

    const unitMap = new Map(
      allUnits.map((unit) => [
        `${unit.streetName}#${unit.identifier}`.toLowerCase().trim(),
        unit.publicId,
      ]),
    );
    this.generateTestUsers();

    for (const u of nextUsers) {
      const unitKey = `${u.streetName}#${u.identifier}`.toLowerCase().trim();

      // console.log('Llaves disponibles en el Map:', Array.from(unitMap.keys()));
      // console.log('Buscando llave:', unitKey);

      //`${u.streetName}#${u.identifier}`;
      const existingUnitId = unitMap.get(unitKey);
      try {
        const savedUser = await this.userService.create(
          neighborhood.publicId,
          { ...u, unitId: existingUnitId },
          rUser,
        );

        if (!existingUnitId && savedUser!.assignments?.length > 0) {
          const newUnitId = savedUser!.assignments[0].unit.publicId;
          unitMap.set(unitKey, newUnitId);
          this.logger.log(
            `Nueva unidad detectada y mapeada: ${unitKey} -> ${newUnitId}`,
          );
        }
        this.logger.log(
          `User ${u.email} seeded successfully for unit ${existingUnitId}`,
        );
      } catch (error) {
        this.logger.error(`Failed to seed user ${u.email}: ${error.message}`);
      }
    }
  }

  private generateTestUsers() {
    const streets = [
      'Paseo de las Lilas',
      'Calle del Roble',
      'Avenida Los Pinos',
      'Sendero de la Fuente',
      'Privada San Juan',
    ];
    const firstNames = [
      'Luis',
      'Maria',
      'Jose',
      'Carmen',
      'Francisco',
      'Guadalupe',
      'Antonio',
      'Juana',
    ];
    const lastNames = [
      'Hernandez',
      'Garcia',
      'Martinez',
      'Rodriguez',
      'Lopez',
      'Perez',
      'Gonzalez',
    ];

    for (let i = 11; i <= 150; i++) {
      const street = streets[i % streets.length];
      const houseNum = 100 + Math.floor(i / 5); // Distribuye casas de 100 en adelante

      const user = {
        email: `vecino.${i}@test.com`,
        firstName: firstNames[i % firstNames.length],
        lastName: lastNames[i % lastNames.length],
        isAdmin: false,
        isOwner: i % 2 === 0,
        isFamily: i % 2 !== 0 && i % 3 !== 0,
        isTenant: i % 3 === 0,
        streetName: street,
        identifier: houseNum.toString(),
        phone: i % 4 === 0 ? `614${1000000 + i}` : '',
      };

      // Aquí llamas a tu lógica de guardado
      nextUsers.push(user);
    }
  }
}
