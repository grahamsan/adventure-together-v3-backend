import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  ForbiddenResponseDto,
  NotFoundResponseDto,
  SuccessResponseDto,
} from '../common/dto/api-responses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ReportEntityType } from '../common/enums';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportStatusDto } from './dto/report.dto';

@ApiTags('Reports')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // "tu fera une route de signalement pour chaque" - Generic POST /reports
  // is cleaner, but user asked for specific routes conceptually.
  // However, mapping them to standard REST is best.
  // I will make specific path aliases that call the same logic.

  @Post('reports')
  @ApiOperation({ summary: 'Create a report (Generic)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Report created.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data.',
    type: BadRequestResponseDto,
  })
  create(@Request() req, @Body() dto: CreateReportDto) {
    return this.reportsService.create(req.user.id, dto);
  }

  @Post('experiences/:id/report')
  @ApiOperation({ summary: 'Report an experience' })
  @ApiParam({ name: 'id', description: 'Experience ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Report created.' })
  reportExperience(
    @Request() req,
    @Param('id') id: string,
    @Body('motif') motif: string,
  ) {
    return this.reportsService.create(req.user.id, {
      entityId: id,
      entityType: ReportEntityType.EXPERIENCE,
      motif: motif || 'No specific motif provided',
    });
  }

  @Post('trips/:id/report')
  @ApiOperation({ summary: 'Report a trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Report created.' })
  reportTrip(
    @Request() req,
    @Param('id') id: string,
    @Body('motif') motif: string,
  ) {
    return this.reportsService.create(req.user.id, {
      entityId: id,
      entityType: ReportEntityType.TRIP,
      motif: motif || 'No specific motif provided',
    });
  }

  @Post('users/:id/report')
  @ApiOperation({ summary: 'Report a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Report created.' })
  reportUser(
    @Request() req,
    @Param('id') id: string,
    @Body('motif') motif: string,
  ) {
    return this.reportsService.create(req.user.id, {
      entityId: id,
      entityType: ReportEntityType.USER,
      motif: motif || 'No specific motif provided',
    });
  }

  // Admin Routes

  @Get('admin/reports')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all reports (min 10 reports per entity)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', enum: ReportEntityType, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of reports returned.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied.',
    type: ForbiddenResponseDto,
  })
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: ReportEntityType,
  ) {
    return this.reportsService.findAll({ search, type });
  }

  @Patch('admin/reports/:id/status')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update report status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReportStatusDto) {
    return this.reportsService.updateStatus(id, dto);
  }
}
