import { UnitsModule } from '@administration/units';
import { CatalogsModule } from '@catalogs/catalogs.module';
import { CoreModule } from '@core/core.module';
import { User, UserProfile } from '@core/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/storage/storage.module';
import {
  ResidentSearchService,
  ResidentService,
  ResidentStatsService,
} from './services';
import { ResidentController } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    CatalogsModule,
    CoreModule,
    StorageModule,
    UnitsModule,
  ],
  controllers: [ResidentController],
  providers: [ResidentService, ResidentSearchService, ResidentStatsService],
  exports: [ResidentService, ResidentSearchService, ResidentStatsService],
})
export class ResidentModule {}
