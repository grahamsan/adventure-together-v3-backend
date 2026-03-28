import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated notifications for the current user' })
  findAll(@Req() req, @Query() query: PaginationQueryDto) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.notificationsService.findAllForUser(
      userId,
      query.page,
      query.limit,
    );
  }

  /** Déclaré avant :id/read pour éviter toute ambiguïté de routage */
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Req() req) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Req() req, @Param('id') id: string) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.notificationsService.markAsRead(id, userId);
  }
}
