import { Module } from '@nestjs/common';
import { CatalogsController } from './controllers';
import { CatalogsService } from './services';

@Module({
  providers: [CatalogsService],
  controllers: [CatalogsController],
  exports: [CatalogsService],
})
export class CatalogsModule {}
