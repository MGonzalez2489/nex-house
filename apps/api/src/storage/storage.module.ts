import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { StorageProvider } from './storage.provider';
import { StorageService } from './storage.service';

// @Module({})
@Module({
  imports: [
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
