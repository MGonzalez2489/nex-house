import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // ready to use Redis using env values
        const useRedis = configService.get<string>('USE_REDIS') === 'true';

        if (useRedis) {
          // we'll import redis store in the future
          return {
            ttl: 60 * 60, // 1 hora por defecto
          };
        }

        // in memory implementation for local env
        return {
          ttl: 1000 * 60 * 15, //15 mins in milliseconds  (Cache-manager v5+)
          max: 100, //max elements in cache
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class ApiCacheModule {}
