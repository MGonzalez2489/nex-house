import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LocalStorageProvider } from './providers';

@Global()
@Module({})
export class StorageModule {
  static register(): DynamicModule {
    return {
      module: StorageModule,
      imports: [
        ConfigModule,
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
      exports: ['STORAGE_PROVIDER'],
    };
  }
}
