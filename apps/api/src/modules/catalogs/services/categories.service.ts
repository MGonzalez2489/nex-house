import { SearchDto } from '@common/dtos';
import { paginate } from '@common/utils';
import { TransactionCategory } from '@database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(TransactionCategory)
    private readonly categoryRepository: Repository<TransactionCategory>,
  ) {}

  async findAll() {
    const s = new SearchDto();
    s.showAll = true;

    return paginate(this.categoryRepository, s);
  }

  //
  // // Buscar una categoría por ID
  async findOne(publicId: string): Promise<TransactionCategory | null> {
    return await this.categoryRepository.findOne({ where: { publicId } });
  }
  //
  // // Crear nueva categoría de catálogo
  // async create(data: Partial<TransactionCategory>): Promise<TransactionCategory> {
  //   const newCategory = this.categoryRepository.create(data);
  //   return await this.categoryRepository.save(newCategory);
  // }
  //
  // // Eliminar (generalmente los catálogos se desactivan, pero incluimos el delete)
  // async remove(id: number): Promise<void> {
  //   const result = await this.categoryRepository.delete(id);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`No se pudo eliminar la categoría ${id}`);
  //   }
  // }
}
