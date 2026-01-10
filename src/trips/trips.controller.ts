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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, RequestStatus, TripStatus } from '../common/enums';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { ApplyToTripDto } from './dto/apply-to-trip.dto';
import { TripResponseDto } from './dto/trip-response.dto';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  NotFoundResponseDto,
  ForbiddenResponseDto,
  SuccessResponseDto,
} from '../common/dto/api-responses.dto';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available trips' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of filling trips.',
    type: [TripResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token.',
    type: UnauthorizedResponseDto,
  })
  findAll() {
    return this.tripsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a trip (Driver only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Trip created successfully.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { $ref: '#/components/schemas/TripResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only drivers can create trips.',
    type: ForbiddenResponseDto,
  })
  create(@Request() req, @Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto, req.user.id);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to join a trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Application submitted successfully.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trip not found or no seats available.',
    type: NotFoundResponseDto,
  })
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
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trip details retrieved.',
    type: TripResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Visibility restricted for this trip.',
    type: ForbiddenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trip not found.',
    type: NotFoundResponseDto,
  })
  findOne(@Request() req, @Param('id') id: string) {
    return this.tripsService.findOne(id, req.user.id);
  }

  @Patch('applies/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an application (Author only)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application updated.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not the author of this application.',
    type: ForbiddenResponseDto,
  })
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
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application deleted.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not the author of this application.',
    type: ForbiddenResponseDto,
  })
  deleteApply(@Request() req, @Param('id') id: string) {
    return this.tripsService.deleteApply(id, req.user.id);
  }

  @Get(':id/applies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all applications for a trip (Driver only)' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of applications for the trip.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not the owner of the trip.',
    type: ForbiddenResponseDto,
  })
  findAllApplies(@Request() req, @Param('id') id: string) {
    return this.tripsService.findAllApplies(id, req.user.id);
  }

  @Post(':id/applies/:applyId/decision')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept or refuse an application (Driver only)' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiParam({ name: 'applyId', description: 'Application ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [RequestStatus.ACCEPTED, RequestStatus.REJECTED],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Decision updated successfully.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Not enough seats or invalid state.',
    type: BadRequestResponseDto,
  })
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
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trip updated.',
    type: TripResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not the owner of the trip.',
    type: ForbiddenResponseDto,
  })
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
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trip deleted.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not the owner of the trip.',
    type: ForbiddenResponseDto,
  })
  remove(@Request() req, @Param('id') id: string) {
    return this.tripsService.remove(id, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update trip status (Driver only)' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [TripStatus.FILLING, TripStatus.INCOMING, TripStatus.DONE],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trip status updated.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition.',
    type: BadRequestResponseDto,
  })
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: TripStatus,
  ) {
    return this.tripsService.updateStatus(id, status, req.user.id);
  }
}
