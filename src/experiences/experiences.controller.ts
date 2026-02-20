import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  ParseIntPipe,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  NotFoundResponseDto,
  SuccessResponseDto,
} from '../common/dto/api-responses.dto';
import { HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import {
  ExperienceResponseDto,
  ExperienceFeedResponseDto,
} from './dto/experience-response.dto';
import { GetExperiencesQueryDto } from './dto/get-experiences-query.dto';
import { TripResponseDto } from '../trips/dto/trip-response.dto';

@ApiTags('Experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get experiences feed' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Experiences feed retrieved.',
    type: ExperienceFeedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token.',
    type: UnauthorizedResponseDto,
  })
  async findAll(
    @Request() req,
    @Query() query: GetExperiencesQueryDto,
  ): Promise<ExperienceFeedResponseDto> {
    return this.experiencesService.findAll(query, req.user.id);
  }

  @Get('trips')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get trips associated with an experience (ID in header)',
  })
  @ApiHeader({
    name: 'x-experience-id',
    description: 'ID of the experience',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of trips associated with the experience.',
    type: [TripResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Missing experience ID in header.',
    type: BadRequestResponseDto,
  })
  async getTripsByExperience(
    @Request() req,
    @Headers('x-experience-id') experienceId: string,
  ): Promise<TripResponseDto[]> {
    if (!experienceId) {
      throw new BadRequestException('Missing x-experience-id header');
    }
    return this.experiencesService.findTripsByExperience(
      experienceId,
      req.user.id,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get experience details' })
  @ApiParam({ name: 'id', description: 'Experience ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Experience details retrieved.',
    type: ExperienceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Experience not found.',
    type: NotFoundResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ExperienceResponseDto> {
    return this.experiencesService.findOne(id, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new experience (Organizer only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Experience created successfully.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { $ref: '#/components/schemas/ExperienceResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token.',
    type: UnauthorizedResponseDto,
  })
  async create(
    @Request() req,
    @Body() createExperienceDto: CreateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    return this.experiencesService.create(createExperienceDto, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like/Unlike an experience' })
  @ApiParam({ name: 'id', description: 'Experience ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Like status toggled.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: {
          type: 'object',
          properties: {
            liked: { type: 'boolean' },
            likesCount: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Experience not found.',
    type: NotFoundResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User has already liked this experience.',
  })
  async toggleLike(@Param('id') id: string, @Request() req) {
    return this.experiencesService.toggleLike(id, req.user.id);
  }
}
