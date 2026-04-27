import { Module } from '@nestjs/common';
import { CategoriesService } from './services';
import { CategoriesController } from './controllers';
import { TransactionCategory } from '@database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionCategory])],
  providers: [CategoriesService],
  exports: [CategoriesService],
  controllers: [CategoriesController],
})
export class CatalogsModule {}
