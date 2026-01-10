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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new vehicle' })
  create(@Body() createVehicleDto: CreateVehicleDto, @GetUser() user: User) {
    return this.vehiclesService.create(createVehicleDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get current user's vehicles" })
  findAll(@GetUser() user: User) {
    return this.vehiclesService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle details' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.vehiclesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @GetUser() user: User,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.vehiclesService.remove(id, user);
  }
}
