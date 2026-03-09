import { CryptoService } from '@common/services';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from '@nex-house/enums';
import { Repository } from 'typeorm';
import { User } from './entities';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    try {
      this.seedSuperAdmin();
      this.logger.log('Sembrado completado exitosamente.');
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
}
