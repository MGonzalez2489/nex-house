import { NeighborhoodModule } from '@administration/neighborhood/neighborhood.module';
import { ResidentModule } from '@administration/residents/resident.module';
import { UnitsModule } from '@administration/units';
import { UserModule } from '@administration/user/user.module';
import { AuthModule } from '@auth/auth.module';
import { JwtAuthGuard } from '@auth/guards';
import { CatalogsModule } from '@catalogs/catalogs.module';
import { ApiCacheModule } from '@core/api-cache.module';
import { NeighborhoodInterceptor } from '@core/interceptors';
import { CryptoService } from '@core/services';
import { getUploadsFolderPath } from '@core/utils';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/storage/storage.module';
import { DatabaseSeederService, getDatabaseConfig } from '../_core/database';
import {
  City,
  Country,
  Neighborhood,
  State,
  User,
} from '../_core/database/entities';

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
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get('UPLOAD_DIR');
        const destination = getUploadsFolderPath(url);

        return [
          {
            rootPath: destination,
            serveRoot: `/${url}`,
            serveStaticOptions: {
              index: false,
            },
          },
        ];
      },
    }),
    //TODO: move this entity imports
    TypeOrmModule.forFeature([Country, State, City, Neighborhood, User]),
    ApiCacheModule,
    AuthModule,
    StorageModule,
    CatalogsModule,
    NeighborhoodModule,
    UserModule,
    UnitsModule,
    ResidentModule,
  ],
  controllers: [],
  providers: [
    DatabaseSeederService,
    CryptoService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: NeighborhoodInterceptor,
    },
  ],
})
export class AppModule {}
