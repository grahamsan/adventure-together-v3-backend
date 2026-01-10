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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  NotFoundResponseDto,
  SuccessResponseDto,
} from '../common/dto/api-responses.dto';
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of conversations.',
  })
  findAll(@Request() req) {
    return this.conversationsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversation details.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conversation not found.',
    type: NotFoundResponseDto,
  })
  findOne(@Request() req, @Param('id') id: string) {
    return this.conversationsService.findOne(id, req.user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of messages.',
  })
  getMessages(@Request() req, @Param('id') id: string) {
    return this.conversationsService.getMessages(id, req.user.id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Message sent.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data.',
    type: BadRequestResponseDto,
  })
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
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found.',
    type: NotFoundResponseDto,
  })
  updateMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.conversationsService.updateMessage(messageId, req.user.id, dto);
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found.',
    type: NotFoundResponseDto,
  })
  deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.conversationsService.deleteMessage(messageId, req.user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark conversation messages as read' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Messages marked as read.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  markAsRead(@Request() req, @Param('id') id: string) {
    return this.conversationsService.markAsRead(id, req.user.id);
  }
}
