import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(
    createVehicleDto: CreateVehicleDto,
    user: any,
  ): Promise<Vehicle> {
    const userId = user.sub || user.id;
    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      owner: { id: userId } as User,
    });
    return await this.vehicleRepository.save(vehicle);
  }

  async findAll(user: any): Promise<Vehicle[]> {
    const userId = user.sub || user.id;
    return await this.vehicleRepository.find({
      where: { owner: { id: userId } },
    });
  }

  async findOne(id: string, user: any): Promise<Vehicle> {
    const userId = user.sub || user.id;
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    if (vehicle.owner.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this vehicle',
      );
    }

    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
    user: User,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id, user);
    Object.assign(vehicle, updateVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async remove(id: string, user: User): Promise<void> {
    const vehicle = await this.findOne(id, user);
    await this.vehicleRepository.remove(vehicle);
  }
}
