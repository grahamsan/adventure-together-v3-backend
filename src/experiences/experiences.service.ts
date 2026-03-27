import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../activity/activity.entity';
import { User } from '../users/entities/user.entity';
import { Like } from '../likes/like.entity';
import { Place } from '../places/place.entity';
import { Trip } from '../trips/trip.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { GetExperiencesQueryDto } from './dto/get-experiences-query.dto';
import { ExperienceResponseDto } from './dto/experience-response.dto';
import { ActivityType } from '../common/enums';
import { TripsService } from '../trips/trips.service';
import { TripResponseDto } from '../trips/dto/trip-response.dto';
import { GetTripsQueryDto } from '../trips/dto/get-trips-query.dto';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(Place)
    private readonly placeRepo: Repository<Place>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
    private readonly tripsService: TripsService,
  ) {}

  /**
   * Get all experiences for the feed
   */
  async findAll(
    queryDto: GetExperiencesQueryDto,
    userId?: string,
  ): Promise<{
    data: ExperienceResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      search,
      imminent,
      month,
      nextMonth,
      date,
      page = 1,
      limit = 20,
    } = queryDto;

    const queryBuilder = this.activityRepo.createQueryBuilder('activity');

    queryBuilder
      .leftJoinAndSelect('activity.promoter', 'promoter')
      .leftJoinAndSelect('activity.participants', 'participants')
      .leftJoinAndSelect('activity.conversations', 'conversations')
      .leftJoinAndSelect('conversations.messages', 'messages')
      .leftJoinAndSelect('activity.requests', 'requests')
      .leftJoinAndSelect('activity.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .where('activity.status = :status', { status: 'published' });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    queryBuilder.andWhere(
      'COALESCE(activity.startDate, activity.date) >= :startOfToday',
      { startOfToday },
    );

    if (search) {
      queryBuilder.andWhere('LOWER(activity.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const now = new Date();

    if (imminent) {
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      queryBuilder.andWhere(
        'activity.date BETWEEN :now AND :nextWeek OR activity.startDate BETWEEN :now AND :nextWeek',
        { now, nextWeek },
      );
    }

    if (month) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      queryBuilder.andWhere(
        '(activity.date BETWEEN :startOfMonth AND :endOfMonth) OR (activity.startDate BETWEEN :startOfMonth AND :endOfMonth)',
        { startOfMonth, endOfMonth },
      );
    }

    if (nextMonth) {
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      queryBuilder.andWhere(
        '(activity.date BETWEEN :startOfNextMonth AND :endOfNextMonth) OR (activity.startDate BETWEEN :startOfNextMonth AND :endOfNextMonth)',
        {
          startOfNextMonth: nextMonthDate,
          endOfNextMonth: endOfNextMonth,
        },
      );
    }

    if (date) {
      // Assuming 'date' is a YYYY-MM-DD string
      queryBuilder.andWhere(
        'DATE(activity.date) = :specificDate OR DATE(activity.startDate) = :specificDate',
        { specificDate: date },
      );
    }

    queryBuilder
      .orderBy('activity.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [activities, total] = await queryBuilder.getManyAndCount();

    await this.attachTripsCounts(activities);

    const data = activities.map((activity) =>
      this.mapToResponseDto(activity, userId),
    );

    return { data, total, page, limit };
  }

  /**
   * Get a single experience by ID
   */
  async findOne(id: string, userId?: string): Promise<ExperienceResponseDto> {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: [
        'promoter',
        'participants',
        'conversations',
        'conversations.messages',
        'requests',
        'likes',
        'likes.user',
      ],
    });

    if (activity) {
      const tripsCount = await this.tripRepo.count({
        where: { experience: { id } },
      });
      (activity as any).tripsCount = tripsCount;
    }

    if (!activity) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }

    return this.mapToResponseDto(activity, userId);
  }

  /**
   * Create a new experience (event)
   */
  async create(
    dto: CreateExperienceDto,
    userId: string,
  ): Promise<ExperienceResponseDto> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let associatedPlaces: Place[] | undefined;
    if (dto.placeId) {
      const place = await this.placeRepo.findOneBy({ id: dto.placeId });
      if (!place) {
        throw new NotFoundException('Lieu introuvable');
      }
      associatedPlaces = [place];
    }

    const activity = this.activityRepo.create({
      title: dto.title,
      description: dto.description,
      location: dto.location,
      type: dto.type || ActivityType.EVENT,
      startDate: new Date(dto.dateStart),
      endDate: new Date(dto.dateEnd),
      date: new Date(dto.dateStart), // Use startDate as the main date
      image: dto.image,
      promoter: user,
      status: 'published',
    });
    if (associatedPlaces?.length) {
      activity.associatedPlaces = associatedPlaces;
    }

    const saved = await this.activityRepo.save(activity);

    // Reload with relations
    const result = await this.activityRepo.findOne({
      where: { id: saved.id },
      relations: [
        'promoter',
        'participants',
        'conversations',
        'conversations.messages',
        'requests',
        'likes',
        'likes.user',
      ],
    });

    return this.mapToResponseDto(result!, userId);
  }

  async update(
    id: string,
    dto: UpdateExperienceDto,
    userId: string,
  ): Promise<ExperienceResponseDto> {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: ['promoter', 'associatedPlaces'],
    });
    if (!activity) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }
    if (activity.promoter.id !== userId) {
      throw new ForbiddenException(
        'Seul le promoteur peut modifier cette expérience.',
      );
    }

    if (dto.title !== undefined) activity.title = dto.title;
    if (dto.description !== undefined) activity.description = dto.description;
    if (dto.location !== undefined) activity.location = dto.location;
    if (dto.type !== undefined) activity.type = dto.type;
    if (dto.image !== undefined) activity.image = dto.image;
    if (dto.dateStart !== undefined) {
      activity.startDate = new Date(dto.dateStart);
      activity.date = new Date(dto.dateStart);
    }
    if (dto.dateEnd !== undefined) {
      activity.endDate = new Date(dto.dateEnd);
    }
    if (dto.placeId !== undefined) {
      if (!dto.placeId) {
        activity.associatedPlaces = [];
      } else {
        const place = await this.placeRepo.findOneBy({ id: dto.placeId });
        if (!place) {
          throw new NotFoundException('Lieu introuvable');
        }
        activity.associatedPlaces = [place];
      }
    }

    await this.activityRepo.save(activity);

    const result = await this.activityRepo.findOne({
      where: { id: activity.id },
      relations: [
        'promoter',
        'participants',
        'conversations',
        'conversations.messages',
        'requests',
        'likes',
        'likes.user',
      ],
    });
    return this.mapToResponseDto(result!, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: ['promoter'],
    });
    if (!activity) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }
    if (activity.promoter.id !== userId) {
      throw new ForbiddenException(
        'Seul le promoteur peut supprimer cette expérience.',
      );
    }

    const linkedTrips = await this.tripRepo.find({
      where: { experience: { id } },
    });
    for (const t of linkedTrips) {
      t.experience = undefined;
    }
    if (linkedTrips.length) {
      await this.tripRepo.save(linkedTrips);
    }

    await this.activityRepo.remove(activity);
  }

  /**
   * Toggle like on an experience
   */
  async toggleLike(
    activityId: string,
    userId: string,
  ): Promise<{ likesCount: number; isLiked: boolean }> {
    const activity = await this.activityRepo.findOne({
      where: { id: activityId },
      relations: ['likes'],
    });
    if (!activity) throw new NotFoundException('Expérience non trouvée');

    const like = await this.likeRepo.findOne({
      where: { activity: { id: activityId }, user: { id: userId } },
    });

    let isLiked = false;
    if (like) {
      throw new ConflictException('Vous avez déjà liké cette expérience');
    } else {
      const newLike = this.likeRepo.create({
        activity: { id: activityId },
        user: { id: userId },
      });
      await this.likeRepo.save(newLike);
      activity.likesCount += 1;
      isLiked = true;
    }

    await this.activityRepo.save(activity);
    return { likesCount: activity.likesCount, isLiked };
  }

  /**
   * Get trips associated with an experience
   */
  async findTripsByExperience(
    experienceId: string,
    userId: string,
  ): Promise<TripResponseDto[]> {
    const query = new GetTripsQueryDto();
    query.experienceId = experienceId;
    // We can add other default filters if needed, but for now just filter by experienceId
    return this.tripsService.findAll(query, userId);
  }

  /**
   * Nombre de trajets liés par expérience (évite loadRelationCountAndMap qui est
   * peu fiable avec de nombreux leftJoinAndSelect sur la même requête).
   */
  private async attachTripsCounts(activities: Activity[]): Promise<void> {
    if (activities.length === 0) return;
    const ids = activities.map((a) => a.id);
    const rows = await this.tripRepo
      .createQueryBuilder('trip')
      .select('trip.experienceId', 'eid')
      .addSelect('COUNT(trip.id)', 'cnt')
      .where('trip.experienceId IN (:...ids)', { ids })
      .groupBy('trip.experienceId')
      .getRawMany();

    const countByExperience = new Map<string, number>();
    for (const row of rows) {
      const r = row as Record<string, string>;
      const eid = r.eid ?? r.experienceId;
      const cnt = r.cnt ?? r.count;
      if (eid != null && cnt != null) {
        countByExperience.set(String(eid), Number(cnt));
      }
    }
    for (const activity of activities) {
      (activity as Activity & { tripsCount?: number }).tripsCount =
        countByExperience.get(activity.id) ?? 0;
    }
  }

  /**
   * Map Activity entity to ExperienceResponseDto
   */
  private mapToResponseDto(
    activity: Activity,
    userId?: string,
  ): ExperienceResponseDto {
    const promoter = activity.promoter;

    // Build owner display name
    let fullName = 'Unknown';
    if (promoter) {
      if (promoter.firstName && promoter.lastName) {
        fullName = `${promoter.firstName} ${promoter.lastName}`;
      } else if (promoter.name) {
        fullName = promoter.name;
      } else if (promoter.companyName) {
        fullName = promoter.companyName;
      }
    }

    // Calculate stats
    const interests = activity.requests?.length || 0;
    const likes = activity.likes?.length ?? activity.likesCount ?? 0;
    const comments =
      activity.conversations?.reduce(
        (sum, conv) => sum + (conv.messages?.length || 0),
        0,
      ) || 0;
    // Check if current user has liked
    const hasLiked = userId
      ? activity.likes?.some((like) => like.user?.id === userId) || false
      : false;

    const trips = (activity as any).tripsCount ?? 0;
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description || '',
      location: activity.location || activity.meetingPoint?.city || '',
      date: (activity.date || activity.startDate)?.toISOString() || '',
      image: activity.image || '',
      owner: {
        fullName,
        avatarUrl: promoter?.avatarUrl || null,
      },
      stats: {
        interests,
        comments,
        likes,
        hasLiked,
        trips,
      },
    };
  }
}
