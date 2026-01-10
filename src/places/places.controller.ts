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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
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
  findAll(@Query('search') search?: string, @Query('type') type?: PlaceType) {
    return this.placesService.findAll(search, type);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Récupérer mes lieux favoris' })
  getFavorites(@GetUser('id') userId: string) {
    return this.placesService.getFavorites(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'un lieu" })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier un lieu (Admin uniquement)' })
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.placesService.remove(id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Ajouter/Retirer des favoris' })
  toggleFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.placesService.toggleFavorite(id, userId);
  }

  @Post(':id/report')
  @ApiOperation({ summary: 'Signaler un lieu' })
  report(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body('motif') motif: string,
  ) {
    return this.placesService.report(id, userId, motif);
  }
}
