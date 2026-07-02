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
    const user = request.user; // Cargado previamente por tu AuthGuard

    // Obtener neighId desde los URL params (ej. /neighborhood/:neighId/users)
    const neighIdParam = request.params.neighborhoodId;

    if (!user || !neighIdParam) {
      throw new ForbiddenException('Missing security context parameters.');
    }

    // Convertir a número y validar el scope estructural
    if (Number(neighIdParam) !== user.neighborhoodId) {
      throw new ForbiddenException('Forbidden neighborhood scope.');
    }

    return true;
  }
}
