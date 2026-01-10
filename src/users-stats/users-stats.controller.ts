import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
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
  getStats(@GetUser('id') userId: string, @Query('period') period?: string) {
    const periodDays = period ? parseInt(period, 10) : 30;
    return this.usersStatsService.getStats(userId, periodDays);
  }
}
