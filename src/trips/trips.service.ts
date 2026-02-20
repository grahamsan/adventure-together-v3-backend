import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activity/activity.entity';
import { Place } from '../places/place.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { TripApplication } from './trip-application.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { GetTripsQueryDto } from './dto/get-trips-query.dto';
import { TripResponseDto } from './dto/trip-response.dto';
import { ApplyToTripDto } from './dto/apply-to-trip.dto';
import { RequestStatus, TripStatus, UserRole } from '../common/enums';
import { ConversationsService } from '../conversations/conversations.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Place)
    private readonly placeRepo: Repository<Place>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(TripApplication)
    private readonly applicationRepo: Repository<TripApplication>,
    private readonly conversationsService: ConversationsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(
    queryDto: GetTripsQueryDto,
    userId?: string,
  ): Promise<TripResponseDto[]> {
    const {
      search,
      imminent,
      month,
      nextMonth,
      date,
      experienceId,
      from,
      to,
      page = 1,
      limit = 20,
    } = queryDto;

    const queryBuilder = this.tripRepo.createQueryBuilder('trip');

    queryBuilder
      .leftJoinAndSelect('trip.owner', 'owner')
      .leftJoinAndSelect('trip.experience', 'experience')
      .leftJoinAndSelect('trip.place', 'place')
      .leftJoinAndSelect('trip.vehicle', 'vehicle')
      .leftJoinAndSelect('trip.applications', 'applications')
      .leftJoinAndSelect('applications.applicant', 'applicant')
      .where('trip.status = :status', { status: TripStatus.FILLING });

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(trip.from) LIKE :search OR LOWER(trip.to) LIKE :search OR LOWER(trip.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (from) {
      queryBuilder.andWhere('LOWER(trip.from) LIKE :from', {
        from: `%${from.toLowerCase()}%`,
      });
    }

    if (to) {
      queryBuilder.andWhere('LOWER(trip.to) LIKE :to', {
        to: `%${to.toLowerCase()}%`,
      });
    }

    if (experienceId) {
      queryBuilder.andWhere('experience.id = :experienceId', { experienceId });
    }

    const now = new Date();

    if (imminent) {
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      queryBuilder.andWhere('trip.startDate BETWEEN :now AND :nextWeek', {
        now,
        nextWeek,
      });
    }

    if (month) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      queryBuilder.andWhere(
        'trip.startDate BETWEEN :startOfMonth AND :endOfMonth',
        {
          startOfMonth,
          endOfMonth,
        },
      );
    }

    if (nextMonth) {
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      queryBuilder.andWhere(
        'trip.startDate BETWEEN :startOfNextMonth AND :endOfNextMonth',
        {
          startOfNextMonth: nextMonthDate,
          endOfNextMonth: endOfNextMonth,
        },
      );
    }

    if (date) {
      queryBuilder.andWhere('DATE(trip.startDate) = :specificDate', {
        specificDate: date,
      });
    }

    queryBuilder
      .orderBy('trip.startDate', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const trips = await queryBuilder.getMany();

    return trips.map((trip) => this.mapToResponseDto(trip, userId));
  }

  async findOne(id: string, userId?: string): Promise<TripResponseDto> {
    const trip = await this.tripRepo.findOne({
      where: { id },
      relations: [
        'owner',
        'experience',
        'place',
        'vehicle',
        'applications',
        'applications.applicant',
      ],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    // Visibility Rules: When status is incoming, visible only to driver and participants
    if (
      trip.status === TripStatus.INCOMING ||
      trip.status === TripStatus.DONE
    ) {
      const isDriver = userId === trip.owner.id;
      const isParticipant = trip.applications?.some(
        (app) =>
          app.applicant.id === userId && app.status === RequestStatus.ACCEPTED,
      );

      if (!isDriver && !isParticipant) {
        throw new ForbiddenException(
          'Seuls le conducteur et les participants peuvent voir ce voyage.',
        );
      }
    }

    return this.mapToResponseDto(trip, userId);
  }

  async create(dto: CreateTripDto, userId: string): Promise<TripResponseDto> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== UserRole.DRIVER) {
      throw new ForbiddenException(
        'Seuls les conducteurs peuvent créer des voyages.',
      );
    }

    let experience: Activity | null = null;
    if (dto.experienceId) {
      experience = await this.activityRepo.findOneBy({ id: dto.experienceId });
    } else if (dto.associatedEventTitle) {
      // Backward compatibility
      experience = await this.activityRepo.findOne({
        where: { title: dto.associatedEventTitle },
      });
    }

    let place: Place | null = null;
    if (dto.placeId) {
      place = await this.placeRepo.findOneBy({ id: dto.placeId });
    }

    let vehicle: Vehicle | null = null;
    if (dto.associatedVehicle) {
      vehicle = await this.vehicleRepo.findOneBy({ id: dto.associatedVehicle });
    }

    const trip = this.tripRepo.create({
      owner: user,
      from: dto.from,
      to: dto.to,
      startDate: new Date(dto.startDate),
      startHour: dto.startHour,
      description: dto.tripDescription,
      price: dto.price,
      seatsAvailable: dto.seatsAvailable,
      seatsConfirmed: 0,
      escales: dto.escales || [],
      experience: experience || undefined,
      place: place || undefined,
      vehicle: vehicle || undefined,
      status: TripStatus.FILLING,
    });

    const saved = await this.tripRepo.save(trip);

    // Automated Messaging: Create group conversation
    await this.conversationsService.createTripGroupConversation(saved, user);

    return this.mapToResponseDto(saved, userId);
  }

  // --- After the new application is created, notify the driver ---
  async apply(tripId: string, dto: ApplyToTripDto, userId: string) {
    const trip = await this.tripRepo.findOne({
      where: { id: tripId },
      relations: ['owner'],
    });
    if (!trip) throw new NotFoundException('Trip not found');

    // Participants cannot apply to a trip with status incoming or done
    if (trip.status !== TripStatus.FILLING) {
      throw new NotFoundException("Ce voyage n'accepte plus de candidatures.");
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== UserRole.PARTICIPANT) {
      throw new ForbiddenException(
        'Seuls les participants peuvent postuler à un voyage.',
      );
    }

    // Validation Rules: If requestedSeats is greater than the number of available seats
    if (dto.requestedSeats > trip.seatsAvailable) {
      throw new NotFoundException(
        `Pas assez de places disponibles. Demandé: ${dto.requestedSeats}, Disponible: ${trip.seatsAvailable}`,
      );
    }

    // Check if already applied
    const existing = await this.applicationRepo.findOne({
      where: { trip: { id: tripId }, applicant: { id: userId } },
    });

    if (existing) {
      existing.message = dto.message;
      existing.requestedSeats = dto.requestedSeats;
      const saved = await this.applicationRepo.save(existing);
      if (saved.applicant) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...applicant } = saved.applicant;
        saved.applicant = applicant as User;
      }
      return saved;
    }

    const application = this.applicationRepo.create({
      trip,
      applicant: user,
      message: dto.message,
      requestedSeats: dto.requestedSeats,
      status: RequestStatus.PENDING,
    });

    const saved = await this.applicationRepo.save(application);

    // Automated Messaging: Create private conversation between applicant and driver
    await this.conversationsService.createApplicationPrivateConversation(
      trip,
      user,
      trip.owner,
      saved,
    );

    // Notify the driver of the new application
    await this.notificationsService.notifyDriverOfApplication(trip, user);

    if (saved.applicant) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...applicant } = saved.applicant;
      saved.applicant = applicant as User;
    }

    return saved;
  }

  async updateApply(id: string, dto: ApplyToTripDto, userId: string) {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: ['applicant'],
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.applicant.id !== userId) {
      throw new ForbiddenException(
        'Seul l’auteur peut modifier sa candidature.',
      );
    }

    application.message = dto.message;
    application.requestedSeats = dto.requestedSeats;
    const saved = await this.applicationRepo.save(application);
    if (saved.applicant) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...applicant } = saved.applicant;
      saved.applicant = applicant as User;
    }
    return saved;
  }

  async deleteApply(id: string, userId: string) {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: ['applicant'],
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.applicant.id !== userId) {
      throw new ForbiddenException(
        'Seul l’auteur peut supprimer sa candidature.',
      );
    }

    await this.applicationRepo.remove(application);
  }

  async decision(
    tripId: string,
    applyId: string,
    status: RequestStatus,
    driverId: string,
  ) {
    const trip = await this.tripRepo.findOne({
      where: { id: tripId },
      relations: ['owner'],
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.owner.id !== driverId) {
      throw new ForbiddenException(
        'Seul le conducteur peut prendre une décision.',
      );
    }

    const application = await this.applicationRepo.findOne({
      where: { id: applyId, trip: { id: tripId } },
      relations: ['applicant'],
    });
    if (!application) throw new NotFoundException('Application not found');

    if (status === RequestStatus.ACCEPTED) {
      if (trip.seatsAvailable < application.requestedSeats) {
        throw new ForbiddenException('Pas assez de places disponibles.');
      }

      trip.seatsAvailable -= application.requestedSeats;
      trip.seatsConfirmed += application.requestedSeats;

      if (trip.seatsAvailable === 0) {
        trip.status = TripStatus.INCOMING;
      }

      await this.tripRepo.save(trip);

      // Add user to group conversation
      await this.conversationsService.addUserToGroup(
        trip.id,
        application.applicant,
      );
    }

    application.status = status;
    const saved = await this.applicationRepo.save(application);

    // Notify the applicant of the decision
    await this.notificationsService.notifyApplicantOfDecision(
      trip,
      application.applicant,
      status,
    );

    if (saved.applicant) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...applicant } = saved.applicant;
      saved.applicant = applicant as User;
    }
    return saved;
  }

  async findAllApplies(tripId: string, driverId: string) {
    const trip = await this.tripRepo.findOne({
      where: { id: tripId },
      relations: ['owner'],
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.owner.id !== driverId) {
      throw new ForbiddenException('Accès refusé.');
    }

    const applications = await this.applicationRepo.find({
      where: { trip: { id: tripId } },
      relations: ['applicant'],
    });

    return applications.map((app) => {
      if (app.applicant) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...applicant } = app.applicant;
        app.applicant = applicant as User;
      }
      return app;
    });
  }

  async update(id: string, dto: Partial<CreateTripDto>, userId: string) {
    const trip = await this.tripRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.owner.id !== userId) throw new ForbiddenException('Accès refusé.');

    Object.assign(trip, dto);
    if (dto.startDate) trip.startDate = new Date(dto.startDate);

    const saved = await this.tripRepo.save(trip);

    // Notify trip members of the update
    const fullTrip = await this.tripRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (fullTrip) {
      await this.notificationsService.notifyTripMembersOfUpdate(fullTrip);
    }

    if (saved.owner) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...owner } = saved.owner;
      saved.owner = owner as User;
    }
    return saved;
  }

  async remove(id: string, userId: string) {
    const trip = await this.tripRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.owner.id !== userId) throw new ForbiddenException('Accès refusé.');

    await this.tripRepo.remove(trip);
  }

  async updateStatus(id: string, status: TripStatus, userId: string) {
    const trip = await this.tripRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.owner.id !== userId) throw new ForbiddenException('Accès refusé.');

    // Transition Rules: incoming → done allowed only if date is reached
    if (status === TripStatus.DONE) {
      const now = new Date();
      if (trip.startDate > now) {
        throw new ForbiddenException(
          'Impossible de marquer le trajet comme terminé avant sa date de départ.',
        );
      }
    }

    trip.status = status;
    const saved = await this.tripRepo.save(trip);
    if (saved.owner) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...owner } = saved.owner;
      saved.owner = owner as User;
    }
    return saved;
  }

  private mapToResponseDto(trip: Trip, userId?: string): TripResponseDto {
    const hasApplied =
      !!userId &&
      !!trip.applications?.some((app) => app.applicant?.id === userId);

    return {
      id: trip.id,
      from: trip.from,
      to: trip.to,
      date: trip.startDate ? trip.startDate.toISOString().split('T')[0] : '',
      time: trip.startHour,
      description: trip.description || '',
      seatsAvailable: trip.seatsAvailable,
      seatsConfirmed: trip.seatsConfirmed,
      price: trip.price,
      escales: trip.escales || [],
      status: trip.status,
      relatedExpName: trip.experience?.title || '',
      relatedPlaceName: trip.place?.title || '',
      hasApplied,
      driverName: trip.owner
        ? `${trip.owner.firstName} ${trip.owner.lastName}`.trim()
        : '',
      vehicleModel: trip.vehicle
        ? `${trip.vehicle.brand} ${trip.vehicle.model}`
        : undefined,
      vehicle: {
        //@ts-ignore
        id: trip.vehicle?.id,
        brand: trip.vehicle?.brand,
        model: trip.vehicle?.model,
        plateNumber: trip.vehicle?.plateNumber,
        imageUrl: trip.vehicle?.imageUrl,
      },
      creator: {
        firstName: trip.owner?.firstName ?? null,
        lastName: trip.owner?.lastName ?? null,
        avatarUrl: trip.owner?.avatarUrl ?? null,
        bio: trip.owner?.bio ?? null,
        phoneNumber: trip.owner?.phoneNumber ?? null,
        dateOfBirth: trip.owner?.dateOfBirth
          ? new Date(trip.owner.dateOfBirth).toISOString().split('T')[0]
          : null,
      },
    };
  }
}
