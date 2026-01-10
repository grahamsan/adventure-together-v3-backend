import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../common/enums';

/**
 * Decorator to specify which roles are allowed to access a route
 * Usage: @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
