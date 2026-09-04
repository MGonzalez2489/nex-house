import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { StorageProvider } from './storage.provider';
import { StorageService } from './storage.service';
import { NxFile } from '@core/database';
import { TypeOrmModule } from '@nestjs/typeorm';

// @Module({})
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([NxFile]),
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: new StorageProvider(configService).getMulterStorage(),
      }),
    }),
  ],

  providers: [StorageProvider, StorageService],
  exports: [StorageProvider, MulterModule, StorageService],
})
export class StorageModule {}
