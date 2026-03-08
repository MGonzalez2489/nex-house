import { DataSourceOptions } from 'typeorm';

import { ConfigService } from '@nestjs/config';

import * as Entities from './entities';

export const getDatabaseConfig = (
  configService: ConfigService,
): DataSourceOptions => {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    synchronize: true, //TODO: change it for prod
    logging: false,
    entities: Object.values(Entities),
  };
};
