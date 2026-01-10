import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user conversations' })
  findAll(@Request() req) {
    return this.conversationsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.conversationsService.findOne(id, req.user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  getMessages(@Request() req, @Param('id') id: string) {
    return this.conversationsService.getMessages(id, req.user.id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message' })
  createMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationsService.createMessage(
      id,
      req.user.id,
      dto,
      dto.attachments || [],
    );
  }

  @Patch('messages/:messageId')
  @ApiOperation({ summary: 'Update a message' })
  updateMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.conversationsService.updateMessage(messageId, req.user.id, dto);
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete a message' })
  deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.conversationsService.deleteMessage(messageId, req.user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark conversation messages as read' })
  markAsRead(@Request() req, @Param('id') id: string) {
    return this.conversationsService.markAsRead(id, req.user.id);
  }
}
