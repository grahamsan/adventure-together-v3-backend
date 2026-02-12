import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import {
  CommentInteraction,
  InteractionType,
} from './comment-interaction.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activity/activity.entity';
import { ReportsService } from '../reports/reports.service';
import { ReportEntityType } from '../common/enums';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(CommentInteraction)
    private readonly interactionRepo: Repository<CommentInteraction>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    private readonly reportsService: ReportsService,
  ) {}

  async create(experienceId: string, userId: string, dto: CreateCommentDto) {
    const activity = await this.activityRepo.findOneBy({ id: experienceId });
    if (!activity) throw new NotFoundException('Expérience non trouvée');

    const comment = this.commentRepo.create({
      content: dto.content,
      user: { id: userId },
      activity: { id: experienceId },
    });

    if (dto.parentId) {
      comment.parent = { id: dto.parentId } as Comment;
    }

    return this.commentRepo.save(comment);
  }

  async findAll(experienceId: string) {
    const comments = await this.commentRepo.find({
      where: { activity: { id: experienceId } },
      relations: ['user', 'replies', 'replies.user'],
      order: { createdAt: 'DESC' },
    });

    // Sanitize user data to remove password hash
    return comments.map((comment) => {
      if (comment.user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...user } = comment.user;
        comment.user = user as User;
      }
      if (comment.replies) {
        comment.replies = comment.replies.map((reply) => {
          if (reply.user) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { passwordHash, ...user } = reply.user;
            reply.user = user as User;
          }
          return reply;
        });
      }
      return comment;
    });
  }

  async update(commentId: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) throw new NotFoundException('Commentaire non trouvé');
    if (comment.user.id !== userId)
      throw new ForbiddenException(
        "Seul l'auteur peut modifier ce commentaire",
      );

    comment.content = dto.content;
    const savedComment = await this.commentRepo.save(comment);

    if (savedComment.user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...user } = savedComment.user;
      savedComment.user = user as User;
    }

    return savedComment;
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) throw new NotFoundException('Commentaire non trouvé');
    if (comment.user.id !== userId)
      throw new ForbiddenException(
        "Seul l'auteur peut supprimer ce commentaire",
      );

    await this.commentRepo.remove(comment);
  }

  async toggleInteraction(
    commentId: string,
    userId: string,
    type: InteractionType,
  ) {
    const comment = await this.commentRepo.findOneBy({ id: commentId });
    if (!comment) throw new NotFoundException('Commentaire non trouvé');

    const existing = await this.interactionRepo.findOne({
      where: { comment: { id: commentId }, user: { id: userId } },
    });

    if (existing) {
      if (existing.type === type) {
        // Remove interaction
        await this.interactionRepo.remove(existing);
        if (type === InteractionType.LIKE) comment.likesCount -= 1;
        else comment.dislikesCount -= 1;
      } else {
        // Change interaction type
        existing.type = type;
        await this.interactionRepo.save(existing);
        if (type === InteractionType.LIKE) {
          comment.likesCount += 1;
          comment.dislikesCount -= 1;
        } else {
          comment.dislikesCount += 1;
          comment.likesCount -= 1;
        }
      }
    } else {
      // New interaction
      const interaction = this.interactionRepo.create({
        comment: { id: commentId },
        user: { id: userId },
        type,
      });
      await this.interactionRepo.save(interaction);
      if (type === InteractionType.LIKE) comment.likesCount += 1;
      else comment.dislikesCount += 1;
    }

    await this.commentRepo.save(comment);
    return {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
    };
  }

  async report(commentId: string, userId: string, motif: string) {
    const comment = await this.commentRepo.findOneBy({ id: commentId });
    if (!comment) throw new NotFoundException('Commentaire non trouvé');

    return this.reportsService.create(userId, {
      entityId: comment.id,
      entityType: ReportEntityType.COMMENTAIRE,
      motif,
    });
  }
}
