import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

//TODO: Pending implement
@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Cargado desde tu JwtStrategy

    // 1. Verificar Rol
    const hasRole = requiredRoles.includes(user.role);

    // 2. Verificar Neighborhood (Multi-tenant security)
    // El payload del JWT debe incluir el neighborhoodId
    const neighborhoodId =
      request.params.neighborhoodId || request.body.neighborhoodId;

    if (neighborhoodId && user.neighborhoodId !== +neighborhoodId) {
      return false; // El usuario intenta acceder a otro fraccionamiento
    }

    return hasRole;
  }
}
