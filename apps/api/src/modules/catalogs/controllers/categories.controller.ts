import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from '../services';
import { TransactionCategoryToModel } from '../mappers';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Catalogs')
@Controller('catalogs')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('categories')
  async findAll() {
    const response = await this.categoriesService.findAll();

    return {
      data: response.data.map((f) => TransactionCategoryToModel(f)),
      meta: response.meta,
    };
  }
}
