import { CryptoService } from '@common/services';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from '@nex-house/enums';
import { Repository } from 'typeorm';
import { Neighborhood, User } from './entities';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Neighborhood)
    private readonly neighRepository: Repository<Neighborhood>,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    try {
      this.seedSuperAdmin();
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
  }
}
