import { Neighborhood } from '@database/entities';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NeighborhoodContextInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Neighborhood)
    private readonly neighborhoodRepo: Repository<Neighborhood>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const neighborhoodId = request.params.neighborhoodId;

    if (neighborhoodId) {
      const neighborhood = await this.neighborhoodRepo.findOneBy({
        publicId: neighborhoodId,
      });

      if (!neighborhood) {
        throw new NotFoundException(
          `El fraccionamiento con ID ${neighborhoodId} no existe.`,
        );
      }

      request['neighborhood'] = neighborhood;
    }

    return next.handle();
  }
}
