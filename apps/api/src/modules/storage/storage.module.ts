import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LocalStorageProvider } from './providers';
import { FileService } from './services';
import { NxFile } from '@database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({})
export class StorageModule {
  static register(): DynamicModule {
    return {
      module: StorageModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forFeature([NxFile]),
        ServeStaticModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => [
            {
              rootPath: config.get<string>('UPLOAD_DIR', '/app/uploads'),
              serveRoot: '/public',
            },
          ],
          inject: [ConfigService],
        }),
      ],
      providers: [
        FileService,
        {
          provide: 'STORAGE_CONFIG',
          useFactory: (config: ConfigService) => ({
            uploadDir: config.get<string>('UPLOAD_DIR', '/app/uploads'),
          }),
          inject: [ConfigService],
        },
        {
          provide: 'STORAGE_PROVIDER',
          useClass: LocalStorageProvider,
        },
      ],
      exports: ['STORAGE_PROVIDER', FileService],
    };
  }
}
