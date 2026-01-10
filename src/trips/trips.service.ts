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
import { Vehicle } from '../vehicles/vehicle.entity';
import { TripApplication } from './trip-application.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripResponseDto } from './dto/trip-response.dto';
import { ApplyToTripDto } from './dto/apply-to-trip.dto';
import { RequestStatus, TripStatus } from '../common/enums';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(TripApplication)
    private readonly applicationRepo: Repository<TripApplication>,
    private readonly conversationsService: ConversationsService,
  ) {}

  async findAll(): Promise<TripResponseDto[]> {
    const trips = await this.tripRepo.find({
      where: { status: TripStatus.FILLING },
      relations: ['owner', 'associatedEvent', 'vehicle'],
      order: { startDate: 'ASC' },
    });

    return trips.map((trip) => this.mapToResponseDto(trip));
  }

  async findOne(id: string, userId?: string): Promise<TripResponseDto> {
    const trip = await this.tripRepo.findOne({
      where: { id },
      relations: [
        'owner',
        'associatedEvent',
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

    return this.mapToResponseDto(trip);
  }

  async create(dto: CreateTripDto, userId: string): Promise<TripResponseDto> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    let associatedEvent: Activity | null = null;
    if (dto.associatedEventTitle) {
      associatedEvent = await this.activityRepo.findOne({
        where: { title: dto.associatedEventTitle },
      });
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
      associatedEvent: associatedEvent || undefined,
      vehicle: vehicle || undefined,
      status: TripStatus.FILLING,
    });

    const saved = await this.tripRepo.save(trip);

    // Automated Messaging: Create group conversation
    await this.conversationsService.createTripGroupConversation(saved, user);

    return this.mapToResponseDto(saved);
  }

  async apply(tripId: string, dto: ApplyToTripDto, userId: string) {
    const trip = await this.tripRepo.findOne({
      where: { id: tripId },
      relations: ['owner'],
    });
    if (!trip) throw new NotFoundException('Trip not found');

    // Participants cannot apply to a trip with status incoming or done
    if (trip.status !== TripStatus.FILLING) {
      throw new NotFoundException('Ce voyage n’accepte plus de candidatures.');
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

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
      return this.applicationRepo.save(existing);
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
    );

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
    return this.applicationRepo.save(application);
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
    return this.applicationRepo.save(application);
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

    return this.applicationRepo.find({
      where: { trip: { id: tripId } },
      relations: ['applicant'],
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

    return this.tripRepo.save(trip);
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
    return this.tripRepo.save(trip);
  }

  private mapToResponseDto(trip: Trip): TripResponseDto {
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
      associatedEventName: trip.associatedEvent?.title || '',
      driverName: trip.owner
        ? `${trip.owner.firstName} ${trip.owner.lastName}`.trim()
        : '',
      vehicleModel: trip.vehicle
        ? `${trip.vehicle.brand} ${trip.vehicle.model}`
        : undefined,
    };
  }
}
