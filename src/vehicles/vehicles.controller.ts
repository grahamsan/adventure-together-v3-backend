import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
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
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  NotFoundResponseDto,
  SuccessResponseDto,
} from '../common/dto/api-responses.dto';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new vehicle' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vehicle created.',
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
    type: UnauthorizedResponseDto,
  })
  create(@Body() createVehicleDto: CreateVehicleDto, @GetUser() user: User) {
    return this.vehiclesService.create(createVehicleDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get current user's vehicles" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of vehicles.',
  })
  findAll(@GetUser() user: User) {
    return this.vehiclesService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle details' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vehicle details.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vehicle not found.',
    type: NotFoundResponseDto,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.vehiclesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vehicle updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vehicle not found.',
    type: NotFoundResponseDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @GetUser() user: User,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vehicle deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vehicle not found.',
    type: NotFoundResponseDto,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.vehiclesService.remove(id, user);
  }
}
