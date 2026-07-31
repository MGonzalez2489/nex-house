import { CoreModule } from '@core/core.module';
import { Unit, UserUnit } from '@core/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsModule } from 'src/catalogs';
import { UnitsController } from './controllers';
import { UnitSearchService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Unit, UserUnit]),
    CatalogsModule,
    CoreModule,
  ],
  controllers: [UnitsController],
  providers: [UnitSearchService],
})
export class UnitsModule {}
