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
  NeighFinanceModule,
  UsersModule,
} from '@modules/index';
import { DatabaseSeederService } from '@database/index';
import { HousingUnit, Neighborhood, User } from '@database/entities';
import { CryptoService } from '@common/services';
import { JwtAuthGuard } from '@modules/auth/guards';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { NeighborhoodContextInterceptor } from '@common/interceptors';

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
    TypeOrmModule.forFeature([User, Neighborhood, HousingUnit]),
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
