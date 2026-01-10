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
  @ApiParam({ name: 'experienceId', description: "ID de l'expérience" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Commentaire créé.',
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
  create(
    @Param('experienceId') experienceId: string,
    @Request() req,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(experienceId, req.user.id, dto);
  }

  @Get('experiences/:experienceId/comments')
  @ApiOperation({ summary: "Lister les commentaires d'une expérience" })
  @ApiParam({ name: 'experienceId', description: "ID de l'expérience" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des commentaires.',
  })
  findAll(@Param('experienceId') experienceId: string) {
    return this.commentsService.findAll(experienceId);
  }

  @Patch('comments/:id')
  @ApiOperation({ summary: 'Modifier un commentaire' })
  @ApiParam({ name: 'id', description: 'ID du commentaire' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Commentaire modifié.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Commentaire non trouvé.',
    type: NotFoundResponseDto,
  })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, req.user.id, dto);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Supprimer un commentaire' })
  @ApiParam({ name: 'id', description: 'ID du commentaire' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Commentaire supprimé.',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.commentsService.remove(id, req.user.id);
  }

  @Post('comments/:id/like')
  @ApiOperation({ summary: 'Liker un commentaire' })
  @ApiParam({ name: 'id', description: 'ID du commentaire' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Like ajouté/retiré.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  like(@Param('id') id: string, @Request() req) {
    return this.commentsService.toggleInteraction(
      id,
      req.user.id,
      InteractionType.LIKE,
    );
  }

  @Post('comments/:id/dislike')
  @ApiOperation({ summary: 'Disliker un commentaire' })
  @ApiParam({ name: 'id', description: 'ID du commentaire' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dislike ajouté/retiré.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  dislike(@Param('id') id: string, @Request() req) {
    return this.commentsService.toggleInteraction(
      id,
      req.user.id,
      InteractionType.DISLIKE,
    );
  }

  @Post('comments/:id/report')
  @ApiOperation({ summary: 'Signaler un commentaire' })
  @ApiParam({ name: 'id', description: 'ID du commentaire' })
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
    @Param('id') id: string,
    @Request() req,
    @Body('motif') motif: string,
  ) {
    return this.commentsService.report(id, req.user.id, motif);
  }
}
