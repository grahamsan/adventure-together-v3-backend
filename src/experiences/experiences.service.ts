import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../activity/activity.entity';
import { User } from '../users/entities/user.entity';
import { Like } from '../likes/like.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { ExperienceResponseDto } from './dto/experience-response.dto';
import { ActivityType } from '../common/enums';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
  ) {}

  /**
   * Get all experiences for the feed
   */
  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{
    data: ExperienceResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [activities, total] = await this.activityRepo.findAndCount({
      where: { status: 'published' },
      relations: ['promoter', 'participants', 'conversations', 'requests'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = activities.map((activity) => this.mapToResponseDto(activity));

    return { data, total, page, limit };
  }

  /**
   * Get a single experience by ID
   */
  async findOne(id: string): Promise<ExperienceResponseDto> {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: ['promoter', 'participants', 'conversations', 'requests'],
    });

    if (!activity) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }

    return this.mapToResponseDto(activity);
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

    return this.mapToResponseDto(result!);
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
      await this.likeRepo.remove(like);
      activity.likesCount = Math.max(0, activity.likesCount - 1);
      isLiked = false;
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
   * Map Activity entity to ExperienceResponseDto
   */
  private mapToResponseDto(activity: Activity): ExperienceResponseDto {
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
        trips,
      },
    };
  }
}
