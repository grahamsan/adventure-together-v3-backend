import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UnauthorizedResponseDto } from '../common/dto/api-responses.dto';
import { UsersStatsService } from './users-stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('User Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users-stats')
export class UsersStatsController {
  constructor(private readonly usersStatsService: UsersStatsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Récupérer mes statistiques personnalisées' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Période en jours (30, 60, 90)',
    example: 30,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques récupérées.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé.',
    type: UnauthorizedResponseDto,
  })
  getStats(@GetUser('id') userId: string, @Query('period') period?: string) {
    const periodDays = period ? parseInt(period, 10) : 30;
    return this.usersStatsService.getStats(userId, periodDays);
  }
}
