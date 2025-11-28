import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, role, firstName, lastName, name, dateOfBirth, ...rest } = createUserDto;

    const passwordHash = await bcrypt.hash(password, 10);
    let displayName: string;
    
    if (role === 'user') {
      // USER : firstName + lastName
      displayName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    } else if (role === 'promoter') {
      // PROMOTER particulier: firstName + lastName
      // PROMOTER entreprise: name (nom de l'entreprise)
      if (firstName && lastName) {
        displayName = `${firstName} ${lastName}`.trim();
      } else if (name) {
        displayName = name;
      } else {
        displayName = '';
      }
    } else {
      displayName = '';
    }

    const user = this.userRepo.create({
      email: createUserDto.email,
      passwordHash,
      role,
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
  

    if (attrs.role) updatedAttrs.role = attrs.role;
  
    if (user.role === 'user' && (attrs.firstName || attrs.lastName)) {
      updatedAttrs.name = `${attrs.firstName ?? ''} ${attrs.lastName ?? ''}`.trim();
    } else if (user.role === 'promoter' && attrs.name) {
      updatedAttrs.name = attrs.name;
    }
  

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
}
