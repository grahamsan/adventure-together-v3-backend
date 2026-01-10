import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  UserManagementResponseDto,
  UpdateUserRoleDto,
} from './dto/admin-user.dto';
import { UserService } from '../users/user.service';

import { Trip } from '../trips/trip.entity';
import { Activity } from '../activity/activity.entity';
import { Report } from '../reports/report.entity';
import { Message } from '../messages/message.entity';
import { AdminDashboardStatsDto } from './dto/admin-stats.dto';
import { MoreThan } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly usersService: UserService,
  ) {}

  async getDashboardStats(): Promise<AdminDashboardStatsDto> {
    const totalExperiences = await this.activityRepo.count();
    const totalTrips = await this.tripRepo.count();
    const totalComments = await this.messageRepo.count(); // Using messages as comments per prompt analysis
    const totalReports = await this.reportRepo.count();

    // Trip stats
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const trips30 = await this.tripRepo.count({
      where: { createdAt: MoreThan(thirtyDaysAgo) },
    });
    const trips60 = await this.tripRepo.count({
      where: { createdAt: MoreThan(sixtyDaysAgo) },
    });
    const trips90 = await this.tripRepo.count({
      where: { createdAt: MoreThan(ninetyDaysAgo) },
    });

    // Likes per experience (Top 20 for example to avoid massive payload)
    // Needs a query that joins likes relation on activity
    // or we can select activities and count likes if relation is loaded (bad for perf)
    // Better: QueryBuilder

    // Check if 'likes' relation exists on Activity. We added it.

    const likesStats = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoin('activity.likes', 'like')
      .select('activity.id', 'id')
      .addSelect('activity.title', 'title')
      .addSelect('COUNT(like.id)', 'count')
      .groupBy('activity.id')
      .addGroupBy('activity.title')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    return {
      totalExperiences,
      totalTrips,
      totalComments,
      totalReports,
      tripStats: {
        last30Days: trips30,
        last60Days: trips60,
        last90Days: trips90,
      },
      likesPerExperience: likesStats.map((stat) => ({
        experienceId: stat.id,
        title: stat.title,
        likes: parseInt(stat.count, 10),
      })),
    };
  }

  async findAllUsers(): Promise<UserManagementResponseDto[]> {
    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => ({
      id: user.id,
      fullName: this.usersService.getDisplayName(user),
      email: user.email,
      role: user.role,
      status: user.status === 'suspended' ? 'disabled' : 'active',
    }));
  }

  async updateUserRole(
    id: string,
    dto: UpdateUserRoleDto,
  ): Promise<UserManagementResponseDto> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    user.role = dto.role;
    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      fullName: this.usersService.getDisplayName(saved),
      email: saved.email,
      role: saved.role,
      status: saved.status === 'suspended' ? 'disabled' : 'active',
    };
  }

  async updateUserStatus(
    id: string,
    status: 'active' | 'suspended',
  ): Promise<UserManagementResponseDto> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    user.status = status as any; // Cast generic string to enum
    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      fullName: this.usersService.getDisplayName(saved),
      email: saved.email,
      role: saved.role,
      status: saved.status === 'suspended' ? 'disabled' : 'active',
    };
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
