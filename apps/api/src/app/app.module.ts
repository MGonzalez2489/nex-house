import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@database/data-source';
import {
  AuthModule,
  FinanceModule,
  HousingUnitsModule,
  NeighborhoodsModule,
  UsersModule,
} from '@modules/index';
import { DatabaseSeederService } from '@database/index';
import { User } from '@database/entities';
import { CryptoService } from '@common/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getDatabaseConfig(config),
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    NeighborhoodsModule,
    FinanceModule,
    HousingUnitsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, CryptoService, CryptoService, DatabaseSeederService],
})
export class AppModule {}
