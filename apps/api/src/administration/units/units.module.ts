import { CoreModule } from '@core/core.module';
import { Unit, UserUnit } from '@core/database';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsModule } from 'src/catalogs/catalogs.module';
import { UnitsController } from './controllers';
import { UnitSearchService, UnitService } from './services';
import { NeighborhoodModule } from '@administration/neighborhood/neighborhood.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Unit, UserUnit]),
    CatalogsModule,
    CoreModule,
    forwardRef(() => NeighborhoodModule),
  ],
  controllers: [UnitsController],
  providers: [UnitSearchService, UnitService],
  exports: [UnitService, UnitSearchService],
})
export class UnitsModule {}
