import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import {
  UserRole,
  OrganizerType,
  UserStatus,
  normalizeUserRole,
} from '../common/enums';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      password,
      role,
      organizerType,
      firstName,
      lastName,
      dateOfBirth,
      ...rest
    } = createUserDto;

    const passwordHash = await bcrypt.hash(password, 10);

    // Normalize the role for backward compatibility
    const normalizedRole = normalizeUserRole(role);

    // Generate display name based on role type
    let displayName: string;

    if (this.isCompanyOrganizer(normalizedRole, organizerType)) {
      // Company organizer: use company name
      displayName = rest.companyName ?? '';
    } else {
      // Personal roles (Participant, Driver, Organizer Individual, legacy user/promoter)
      displayName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    }

    const user = this.userRepo.create({
      email: createUserDto.email,
      passwordHash,
      role: normalizedRole,
      organizerType: organizerType ?? undefined,
      status: UserStatus.ACTIVE,
      firstName,
      lastName,
      name: displayName,
      phoneNumber: rest.phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      driverLicenseNumber: rest.driverLicenseNumber,
      companyName: rest.companyName,
      companyType: rest.companyType,
      contactEmail: rest.contactEmail,
      companyAddress: rest.companyAddress,
    });

    return this.userRepo.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOneBy({ email });
  }

  async update(id: string, attrs: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const updatedAttrs: Partial<User> = {};

    // Handle role update with normalization
    if (attrs.role) {
      updatedAttrs.role = normalizeUserRole(attrs.role);
    }

    // Handle status update (admin action)
    if (attrs.status) {
      updatedAttrs.status = attrs.status;
    }

    // Update name based on role type
    const currentRole = updatedAttrs.role || user.role;
    if (this.isCompanyOrganizer(currentRole, user.organizerType)) {
      // Company organizer: update with company name
      if (attrs.companyName) {
        updatedAttrs.name = attrs.companyName;
        updatedAttrs.companyName = attrs.companyName;
      }
    } else {
      // Personal roles: update with firstName + lastName
      if (attrs.firstName || attrs.lastName) {
        const newFirstName = attrs.firstName ?? user.firstName ?? '';
        const newLastName = attrs.lastName ?? user.lastName ?? '';
        updatedAttrs.name = `${newFirstName} ${newLastName}`.trim();
        if (attrs.firstName) updatedAttrs.firstName = attrs.firstName;
        if (attrs.lastName) updatedAttrs.lastName = attrs.lastName;
      }
    }

    // Handle password update
    if (attrs.password) {
      updatedAttrs.passwordHash = await bcrypt.hash(attrs.password, 10);
    }

    Object.assign(user, updatedAttrs);
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.delete(user.id);
  }

  // ─────────────────────────────────────────────────────────────────
  // Helper methods
  // ─────────────────────────────────────────────────────────────────

  /**
   * Check if the user is a Company organizer
   */
  private isCompanyOrganizer(
    role: UserRole | string,
    organizerType?: OrganizerType,
  ): boolean {
    const normalizedRole = normalizeUserRole(role);
    return (
      normalizedRole === UserRole.ORGANIZER &&
      organizerType === OrganizerType.COMPANY
    );
  }

  /**
   * Get display name for a user (for emails, etc.)
   */
  getDisplayName(user: User): string {
    if (user.name) return user.name;
    if (user.firstName || user.lastName) {
      return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    }
    if (user.companyName) return user.companyName;
    return 'Utilisateur';
  }
}
