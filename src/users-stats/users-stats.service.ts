import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/trip.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Activity } from '../activity/activity.entity';
import { Like } from '../likes/like.entity';
import { TripApplication } from '../trips/trip-application.entity';
import { UserRole, RequestStatus } from '../common/enums';

@Injectable()
export class UsersStatsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(TripApplication)
    private readonly appRepo: Repository<TripApplication>,
  ) {}

  async getStats(userId: string, periodDays: number = 30) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const stats: any = {
      role: user.role,
      periodDays,
    };

    if (user.role === UserRole.DRIVER) {
      stats.driver = await this.getDriverStats(userId, startDate);
    } else if (user.role === UserRole.ORGANIZER) {
      stats.organizer = await this.getOrganizerStats(userId, startDate);
    } else {
      stats.participant = await this.getParticipantStats(userId, startDate);
    }

    return stats;
  }

  private async getDriverStats(userId: string, startDate: Date) {
    const vehiclesCount = await this.vehicleRepo.countBy({
      owner: { id: userId },
    });

    const tripsCreated = await this.tripRepo.count({
      where: { owner: { id: userId }, createdAt: MoreThanOrEqual(startDate) },
    });

    const tripsPerformed = await this.tripRepo.count({
      where: {
        owner: { id: userId },
        startDate: MoreThanOrEqual(startDate),
      },
    });

    // Count accepted passengers on those trips
    const trips = await this.tripRepo.find({
      where: { owner: { id: userId }, startDate: MoreThanOrEqual(startDate) },
      relations: ['applications'],
    });

    let passengersCount = 0;
    trips.forEach((t) => {
      passengersCount +=
        t.applications?.filter((a) => a.status === RequestStatus.ACCEPTED)
          .length || 0;
    });

    return {
      vehiclesCount,
      tripsCreated,
      tripsPerformed,
      passengersCount,
    };
  }

  private async getOrganizerStats(userId: string, startDate: Date) {
    const activitiesCreated = await this.activityRepo.count({
      where: {
        promoter: { id: userId },
        createdAt: MoreThanOrEqual(startDate),
      },
    });

    const activities = await this.activityRepo.find({
      where: {
        promoter: { id: userId },
        createdAt: MoreThanOrEqual(startDate),
      },
      relations: ['likes'],
    });

    let totalLikes = 0;
    activities.forEach((a) => {
      totalLikes += a.likes?.length || 0;
    });

    return {
      activitiesCreated,
      interactionsCount: totalLikes, // Comments to come in future version
    };
  }

  private async getParticipantStats(userId: string, startDate: Date) {
    const tripsParticipated = await this.appRepo.count({
      where: {
        applicant: { id: userId },
        status: RequestStatus.ACCEPTED,
        createdAt: MoreThanOrEqual(startDate),
      },
    });

    // Discovered places are places associated with activities in joined trips
    const applications = await this.appRepo.find({
      where: {
        applicant: { id: userId },
        status: RequestStatus.ACCEPTED,
        createdAt: MoreThanOrEqual(startDate),
      },
      relations: [
        'trip',
        'trip.activities',
        'trip.activities.activity',
        'trip.activities.activity.associatedPlaces',
      ],
    });

    const placeIds = new Set<string>();
    applications.forEach((app) => {
      app.trip?.activities?.forEach((ta) => {
        ta.activity?.associatedPlaces?.forEach((p) => placeIds.add(p.id));
      });
    });

    return {
      tripsJoined: tripsParticipated,
      discoveredPlacesCount: placeIds.size,
    };
  }
}
