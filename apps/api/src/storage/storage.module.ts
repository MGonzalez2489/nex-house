import { NxFile } from '@core/database';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageProvider } from './storage.provider';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([NxFile]),
    MulterModule.registerAsync({
      inject: [ConfigService, StorageProvider],
      useFactory: (
        configService: ConfigService,
        storageProvider: StorageProvider,
      ) => ({
        storage: storageProvider.getMulterStorage(),
      }),
    }),
  ],
  providers: [StorageProvider, StorageService],
  exports: [StorageProvider, StorageService, MulterModule],
})
export class StorageModule {}
