import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole, normalizeUserRole } from '../../common/enums';

/**
 * Guard to protect routes based on user roles
 * Works with the @Roles() decorator
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: No valid user role found');
    }

    // Normalize the user's role for backward compatibility
    const userRole = normalizeUserRole(user.role);

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => {
      const normalizedRequiredRole = normalizeUserRole(role);
      return normalizedRequiredRole === userRole;
    });

    if (!hasRole) {
      const rolesList = requiredRoles.join(', ');
      throw new ForbiddenException(
        `Accès refusé : Votre rôle (${userRole}) ne vous permet pas d'effectuer cette action. Rôles autorisés : ${rolesList}.`,
      );
    }

    return true;
  }
}
