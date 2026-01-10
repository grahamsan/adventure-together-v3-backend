import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like as TypeORMLike } from 'typeorm';
import { Place } from './place.entity';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { User } from '../users/entities/user.entity';
import { PlaceType, ReportEntityType } from '../common/enums';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepo: Repository<Place>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly reportsService: ReportsService,
  ) {}

  async create(createPlaceDto: CreatePlaceDto): Promise<Place> {
    const place = this.placeRepo.create(createPlaceDto);
    return this.placeRepo.save(place);
  }

  async findAll(search?: string, type?: PlaceType): Promise<Place[]> {
    const query = this.placeRepo.createQueryBuilder('place');

    if (search) {
      query.where(
        '(place.title ILIKE :search OR place.description ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (type) {
      if (search) {
        query.andWhere('place.type = :type', { type });
      } else {
        query.where('place.type = :type', { type });
      }
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Place> {
    const place = await this.placeRepo.findOneBy({ id });
    if (!place) throw new NotFoundException(`Lieu avec l'id ${id} non trouvé`);
    return place;
  }

  async update(id: string, updatePlaceDto: UpdatePlaceDto): Promise<Place> {
    const place = await this.findOne(id);
    Object.assign(place, updatePlaceDto);
    return this.placeRepo.save(place);
  }

  async remove(id: string): Promise<void> {
    const place = await this.findOne(id);
    await this.placeRepo.remove(place);
  }

  async report(placeId: string, userId: string, motif: string): Promise<any> {
    const place = await this.findOne(placeId);
    return this.reportsService.create(userId, {
      entityId: place.id,
      entityType: ReportEntityType.LIEU,
      motif,
    });
  }

  async toggleFavorite(
    placeId: string,
    userId: string,
  ): Promise<{ isFavorite: boolean }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favoritePlaces'],
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const place = await this.findOne(placeId);
    const index = user.favoritePlaces?.findIndex((p) => p.id === placeId);

    let isFavorite = false;
    if (index !== undefined && index > -1) {
      user.favoritePlaces?.splice(index, 1);
      isFavorite = false;
    } else {
      user.favoritePlaces?.push(place);
      isFavorite = true;
    }

    await this.userRepo.save(user);
    return { isFavorite };
  }

  async getFavorites(userId: string): Promise<Place[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favoritePlaces'],
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user.favoritePlaces || [];
  }
}
