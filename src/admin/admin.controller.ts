import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  UnauthorizedResponseDto,
  ForbiddenResponseDto,
  NotFoundResponseDto,
  BadRequestResponseDto,
} from '../common/dto/api-responses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { AdminService } from './admin.service';
import {
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UserManagementResponseDto,
} from './dto/admin-user.dto';

import { AdminDashboardStatsDto } from './dto/admin-stats.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: 'Access denied - Admin only.',
  type: ForbiddenResponseDto,
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Missing or invalid token.',
  type: UnauthorizedResponseDto,
})
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get overall app statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved.',
    type: AdminDashboardStatsDto,
  })
  getStats(): Promise<AdminDashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users retrieved.',
  })
  findAll(): Promise<UserManagementResponseDto[]> {
    return this.adminService.findAllUsers();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid role.',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    type: NotFoundResponseDto,
  })
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserManagementResponseDto> {
    return this.adminService.updateUserRole(id, dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (activate/suspend)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    type: NotFoundResponseDto,
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserManagementResponseDto> {
    return this.adminService.updateUserStatus(id, dto.status);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    type: NotFoundResponseDto,
  })
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteUser(id);
  }
}
