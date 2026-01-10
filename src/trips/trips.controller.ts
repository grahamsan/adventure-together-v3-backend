import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, RequestStatus, TripStatus } from '../common/enums';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { ApplyToTripDto } from './dto/apply-to-trip.dto';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available trips' })
  findAll() {
    return this.tripsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a trip (Driver only)' })
  create(@Request() req, @Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto, req.user.id);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to join a trip' })
  apply(
    @Request() req,
    @Param('id') id: string,
    @Body() applyDto: ApplyToTripDto,
  ) {
    return this.tripsService.apply(id, applyDto, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trip details' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.tripsService.findOne(id, req.user.id);
  }

  @Patch('applies/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an application (Author only)' })
  updateApply(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ApplyToTripDto,
  ) {
    return this.tripsService.updateApply(id, dto, req.user.id);
  }

  @Delete('applies/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an application (Author only)' })
  deleteApply(@Request() req, @Param('id') id: string) {
    return this.tripsService.deleteApply(id, req.user.id);
  }

  @Get(':id/applies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all applications for a trip (Driver only)' })
  findAllApplies(@Request() req, @Param('id') id: string) {
    return this.tripsService.findAllApplies(id, req.user.id);
  }

  @Post(':id/applies/:applyId/decision')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept or refuse an application (Driver only)' })
  decision(
    @Request() req,
    @Param('id') id: string,
    @Param('applyId') applyId: string,
    @Body('status') status: RequestStatus,
  ) {
    return this.tripsService.decision(id, applyId, status, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a trip (Owner only)' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateTripDto>,
  ) {
    return this.tripsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a trip (Owner only)' })
  remove(@Request() req, @Param('id') id: string) {
    return this.tripsService.remove(id, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update trip status (Driver only)' })
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: TripStatus,
  ) {
    return this.tripsService.updateStatus(id, status, req.user.id);
  }
}
