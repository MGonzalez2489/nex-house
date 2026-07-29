import { User } from '@core/database';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class NeighborhoodScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // loaded from AuthGuard

    const neighIdParam = request.params.neighborhoodId;

    if (!user || !neighIdParam) {
      throw new ForbiddenException('Missing security context parameters.');
    }

    if (neighIdParam !== user.neighborhood.publicId) {
      throw new ForbiddenException('Forbidden neighborhood scope.');
    }

    return true;
  }
}
