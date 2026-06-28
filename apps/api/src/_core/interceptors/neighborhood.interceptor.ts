import { Neighborhood } from '@core/database';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class NeighborhoodInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Neighborhood)
    private readonly neighborhoodRepo: Repository<Neighborhood>,
  ) {}

  /**
   * Intercepts HTTP requests to extract the 'neighborhoodId' route parameter,
   * validates its existence in the database, and injects the entity context into the Request object.
   *
   * @param context The current execution context pipeline metadata.
   * @param next The subsequent call handler in the interceptor chain.
   * @throws NotFoundException if the resolved neighborhood identity does not exist.
   * @returns An observable stream handling the next request execution layer.
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const neighborhoodId = request.params?.neighborhoodId;

    // Boundary check ensuring the route parameter contains actionable data
    if (neighborhoodId && neighborhoodId.trim().length > 0) {
      const neighborhood = await this.neighborhoodRepo.findOneBy({
        publicId: neighborhoodId,
      });

      if (!neighborhood) {
        throw new NotFoundException(
          `Neighborhood with ID "${neighborhoodId}" not found.`,
        );
      }

      // Context injection accessible across down-stream controllers and guards
      request['neighborhood'] = neighborhood;
    }

    return next.handle();
  }
}
