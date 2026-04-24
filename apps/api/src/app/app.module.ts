import { NeighborhoodContextInterceptor } from '@common/interceptors';
import { CryptoService } from '@common/services';
import { getDatabaseConfig } from '@database/data-source';
import {
  HousingUnit,
  Neighborhood,
  TransactionCategory,
  User,
} from '@database/entities';
import { DatabaseSeederService } from '@database/index';
import { JwtAuthGuard } from '@modules/auth/guards';
import { CatalogsModule } from '@modules/catalogs';
import {
  AuthModule,
  FinanceModule,
  HousingUnitsModule,
  NeighborhoodsModule,
  NeighFinanceModule,
  StorageModule,
  UsersModule,
} from '@modules/index';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    StorageModule.register(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getDatabaseConfig(config),
    }),
    TypeOrmModule.forFeature([
      User,
      Neighborhood,
      HousingUnit,
      TransactionCategory,
    ]),
    CatalogsModule,
    AuthModule,
    NeighborhoodsModule,
    FinanceModule,
    HousingUnitsModule,
    UsersModule,
    NeighFinanceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CryptoService,
    DatabaseSeederService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: NeighborhoodContextInterceptor,
    },
  ],
})
export class AppModule {}
