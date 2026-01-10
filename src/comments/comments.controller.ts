import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InteractionType } from './comment-interaction.entity';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('experiences/:experienceId/comments')
  @ApiOperation({ summary: 'Poster un commentaire sur une expérience' })
  create(
    @Param('experienceId') experienceId: string,
    @Request() req,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(experienceId, req.user.id, dto);
  }

  @Get('experiences/:experienceId/comments')
  @ApiOperation({ summary: "Lister les commentaires d'une expérience" })
  findAll(@Param('experienceId') experienceId: string) {
    return this.commentsService.findAll(experienceId);
  }

  @Patch('comments/:id')
  @ApiOperation({ summary: 'Modifier un commentaire' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, req.user.id, dto);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Supprimer un commentaire' })
  remove(@Param('id') id: string, @Request() req) {
    return this.commentsService.remove(id, req.user.id);
  }

  @Post('comments/:id/like')
  @ApiOperation({ summary: 'Liker un commentaire' })
  like(@Param('id') id: string, @Request() req) {
    return this.commentsService.toggleInteraction(
      id,
      req.user.id,
      InteractionType.LIKE,
    );
  }

  @Post('comments/:id/dislike')
  @ApiOperation({ summary: 'Disliker un commentaire' })
  dislike(@Param('id') id: string, @Request() req) {
    return this.commentsService.toggleInteraction(
      id,
      req.user.id,
      InteractionType.DISLIKE,
    );
  }

  @Post('comments/:id/report')
  @ApiOperation({ summary: 'Signaler un commentaire' })
  report(
    @Param('id') id: string,
    @Request() req,
    @Body('motif') motif: string,
  ) {
    return this.commentsService.report(id, req.user.id, motif);
  }
}
