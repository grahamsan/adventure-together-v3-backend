import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../activity/activity.entity';
import { User } from '../users/entities/user.entity';
import { Like } from '../likes/like.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';
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
      .leftJoinAndSelect('activity.requests', 'requests')
      .leftJoinAndSelect('activity.likes', 'likes')
      .where('activity.status = :status', { status: 'published' });

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
        'requests',
        'likes',
      ],
    });

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

    const saved = await this.activityRepo.save(activity);

    // Reload with relations
    const result = await this.activityRepo.findOne({
      where: { id: saved.id },
      relations: ['promoter', 'participants', 'conversations', 'requests'],
    });

    return this.mapToResponseDto(result!, userId);
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
    const likes = activity.likesCount || 0;
    const comments =
      activity.conversations?.reduce(
        (sum, conv) => sum + (conv.messages?.length || 0),
        0,
      ) || 0;
    // Check if current user has liked
    const hasLiked = userId
      ? activity.likes?.some((like) => like.user?.id === userId) || false
      : false;

    // For trips count, we would need to query trips associated with this activity
    // For now, return 0 as placeholder
    const trips = 0;

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
