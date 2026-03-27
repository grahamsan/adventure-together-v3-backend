import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/trip.entity';
import { CreateReportDto, UpdateReportStatusDto } from './dto/report.dto';
import {
  ReportEntityType,
  ReportStatus,
  UserRole,
} from '../common/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
  ) {}

  async create(userId: string, dto: CreateReportDto): Promise<Report> {
    const reporter = await this.userRepo.findOneBy({ id: userId });
    if (!reporter) throw new NotFoundException('Reporter not found');

    if (dto.entityType === ReportEntityType.TRIP) {
      const trip = await this.tripRepo.findOne({
        where: { id: dto.entityId },
        relations: ['owner'],
      });
      if (!trip) throw new NotFoundException('Trajet introuvable');
      if (reporter.role === UserRole.ADMIN) {
        throw new ForbiddenException(
          'Les administrateurs ne peuvent pas signaler un trajet.',
        );
      }
      if (trip.owner?.id === userId) {
        throw new ForbiddenException(
          'Vous ne pouvez pas signaler votre propre trajet.',
        );
      }
    }

    const report = this.reportRepo.create({
      reporter,
      entityId: dto.entityId,
      entityType: dto.entityType,
      motif: dto.motif,
      status: ReportStatus.NEW,
    });

    const savedReport = await this.reportRepo.save(report);
    if (savedReport.reporter) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...reporter } = savedReport.reporter;
      savedReport.reporter = reporter as User;
    }
    return savedReport;
  }

  async updateStatus(id: string, dto: UpdateReportStatusDto): Promise<Report> {
    const report = await this.reportRepo.findOneBy({ id });
    if (!report) throw new NotFoundException('Report not found');

    report.status = dto.status;
    if (dto.status === ReportStatus.PROCESSED) {
      report.processedAt = new Date();
    }

    const savedReport = await this.reportRepo.save(report);
    if (savedReport.reporter) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...reporter } = savedReport.reporter;
      savedReport.reporter = reporter as User;
    }
    return savedReport;
  }

  async findAll(query: { search?: string; type?: ReportEntityType }) {
    // Basic filtering first
    const qb = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .orderBy('report.createdAt', 'DESC');

    if (query.type) {
      qb.andWhere('report.entityType = :type', { type: query.type });
    }

    if (query.search) {
      // Search in motif mostly as generic search
      qb.andWhere('report.motif ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // Now implement the requirement: "only when same entity is reported at least 10 times"
    // We need to find entityIds that have count >= 10
    // This is tricky in one go with ORM find options, easier with Raw query or subquery.

    // Subquery to find alerted entity IDs
    // SELECT entityId, entityType FROM reports GROUP BY entityId, entityType HAVING COUNT(*) >= 10

    const subQuery = this.reportRepo
      .createQueryBuilder('r')
      .select('r.entityId')
      .addSelect('r.entityType')
      .groupBy('r.entityId')
      .addGroupBy('r.entityType')
      .having('COUNT(*) >= 10');

    // However, for testing/demo purposes, 10 might be too high.
    // I will implement it strictly, but note that in dev you might want to lower it to 1.
    // Let's assume strict implementation.

    // Actually, TypeORM QB with where IN (subquery) is clean.
    // But referencing the subquery text is easier directly.

    // The requirement is specific: "Un signalement est renvoyé... uniquement lorsque la même entitée est signalée au moins 10 fois"
    // It implies we return the reports only for those problematic entities.

    // We need to filter the main query to only include items where (entityId, entityType) is in the "bad list".

    // As postgres doesn't support multiple column IN tuple easily in TypeORM standard syntax everywhere without raw,
    // let's do it in two steps for clarity and safety, or use raw where.

    // Step 1: Find alert entities
    const alerts = await subQuery.getRawMany();
    // returns [{ entityId: '...', entityType: '...' }]

    if (alerts.length === 0) {
      return []; // No entities reported enough times
    }

    const alertIds = alerts.map((a) => a.r_entityId);

    // Step 2: Filter main query
    qb.andWhere('report.entityId IN (:...ids)', { ids: alertIds });

    const reports = await qb.getMany();

    return reports.map((report) => {
      if (report.reporter) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...reporter } = report.reporter;
        report.reporter = reporter as User;
      }
      return report;
    });
  }

  async countTotalReports(): Promise<number> {
    return this.reportRepo.count();
  }
}
