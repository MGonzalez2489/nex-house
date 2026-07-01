import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsModule } from 'src/catalogs';
import { DatabaseSeederService, getDatabaseConfig } from '../_core/database';
import { Neighborhood, User } from '../_core/database/entities';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@auth/auth.module';
import { JwtAuthGuard } from '@auth/guards';
import { NeighborhoodModule } from '@administration/neighborhood/neighborhood.module';
import { CryptoService } from '@core/services';
import { ApiCacheModule } from '@core/api-cache.module';

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
    //TODO: move this entity imports
    TypeOrmModule.forFeature([Neighborhood, User]),
    ApiCacheModule,
    AuthModule,
    CatalogsModule,
    NeighborhoodModule,
  ],
  controllers: [],
  providers: [
    DatabaseSeederService,
    CryptoService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
