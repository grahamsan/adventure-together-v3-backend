import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  NotFoundResponseDto,
  ForbiddenResponseDto,
  SuccessResponseDto,
} from '../common/dto/api-responses.dto';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, PlaceType } from '../common/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Places')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau lieu' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lieu créé avec succès.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides.',
    type: BadRequestResponseDto,
  })
  create(@Body() createPlaceDto: CreatePlaceDto) {
    return this.placesService.create(createPlaceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister et rechercher des lieux' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Recherche par titre ou description',
  })
  @ApiQuery({
    name: 'type',
    enum: PlaceType,
    required: false,
    description: 'Filtrer par type de lieu',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des lieux récupérée.',
  })
  findAll(@Query('search') search?: string, @Query('type') type?: PlaceType) {
    return this.placesService.findAll(search, type);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Récupérer mes lieux favoris' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des favoris récupérée.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé.',
    type: UnauthorizedResponseDto,
  })
  getFavorites(@GetUser('id') userId: string) {
    return this.placesService.getFavorites(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'un lieu" })
  @ApiParam({ name: 'id', description: 'ID du lieu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du lieu récupérés.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lieu non trouvé.',
    type: NotFoundResponseDto,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier un lieu (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du lieu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lieu modifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès refusé - Admin requis.',
    type: ForbiddenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lieu non trouvé.',
    type: NotFoundResponseDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ) {
    return this.placesService.update(id, updatePlaceDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer un lieu (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du lieu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lieu supprimé.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès refusé - Admin requis.',
    type: ForbiddenResponseDto,
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.placesService.remove(id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Ajouter/Retirer des favoris' })
  @ApiParam({ name: 'id', description: 'ID du lieu' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Statut favori mis à jour.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  toggleFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.placesService.toggleFavorite(id, userId);
  }

  @Post(':id/report')
  @ApiOperation({ summary: 'Signaler un lieu' })
  @ApiParam({ name: 'id', description: 'ID du lieu' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { motif: { type: 'string', example: 'Lieu inexistant' } },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Signalement envoyé.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  report(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body('motif') motif: string,
  ) {
    return this.placesService.report(id, userId, motif);
  }
}
