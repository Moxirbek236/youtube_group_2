import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Role } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsQueryDto } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private commentSelect() {
    return {
      id: true,
      content: true,
      likesCount: true,
      dislikesCount: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
      videoId: true,
      authorId: true,
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    } as const;
  }

  private async ensureVideoExists(videoId: number) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, authorId: true, title: true },
    });

    if (!video) {
      throw new NotFoundException('Video topilmadi');
    }

    return video;
  }

  private async ensureCommentExists(commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
        videoId: true,
        parentId: true,
        isPinned: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment topilmadi');
    }

    return comment;
  }

  private async countCommentsForVideo(videoId: number) {
    const total = await this.prisma.comment.count({
      where: { videoId },
    });

    await this.prisma.video.update({
      where: { id: videoId },
      data: { commentsCount: total },
    });
  }

  async create(
    videoId: number,
    createCommentDto: CreateCommentDto,
    requester: { id: number; role: Role },
  ) {
    await this.ensureVideoExists(videoId);

    let parentAuthorId: number | null = null;
    if (createCommentDto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentId },
        select: { id: true, videoId: true, authorId: true },
      });

      if (!parent) {
        throw new NotFoundException('Parent comment topilmadi');
      }

      if (parent.videoId !== videoId) {
        throw new ForbiddenException('Reply faqat shu video commentiga yozilishi mumkin');
      }

      parentAuthorId = parent.authorId;
    }

    const data = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        parentId: createCommentDto.parentId,
        videoId,
        authorId: requester.id,
      },
      select: this.commentSelect(),
    });

    await this.countCommentsForVideo(videoId);

    if (parentAuthorId && parentAuthorId !== requester.id) {
      await this.notificationService.createNotification(
        parentAuthorId,
        NotificationType.COMMENT_REPLY,
        'New comment reply',
        'Someone replied to your comment',
      );
    }

    return {
      success: true,
      status: 201,
      message: 'Comment yaratildi',
      data,
    };
  }

  async findAll(videoId: number, query?: CommentsQueryDto) {
    await this.ensureVideoExists(videoId);

    const { page = 1, limit = 20, sort = 'top' } = query || {};
    const skip = (page - 1) * limit;

    const orderBy =
      sort === 'top'
        ? [{ isPinned: 'desc' as const }, { likesCount: 'desc' as const }, { createdAt: 'desc' as const }]
        : [{ isPinned: 'desc' as const }, { createdAt: 'desc' as const }];

    const comments = await this.prisma.comment.findMany({
      where: {
        videoId,
        parentId: null,
      },
      skip: Number(skip),
      take: Number(limit),
      orderBy,
      select: {
        ...this.commentSelect(),
        replies: {
          orderBy: { createdAt: 'asc' },
          select: this.commentSelect(),
        },
      },
    });

    const totalComments = await this.prisma.comment.count({
      where: {
        videoId,
        parentId: null,
      },
    });

    const data = comments.map((comment) => ({
      ...comment,
      repliesCount: comment.replies.length,
    }));

    return {
      success: true,
      status: 200,
      data: {
        comments: data,
        totalComments,
        hasMore: skip + data.length < totalComments,
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.comment.findUnique({
      where: { id },
      select: {
        ...this.commentSelect(),
        replies: {
          orderBy: { createdAt: 'asc' },
          select: this.commentSelect(),
        },
      },
    });

    if (!data) {
      throw new NotFoundException('Comment topilmadi');
    }

    return {
      success: true,
      status: 200,
      data: {
        ...data,
        repliesCount: data.replies.length,
      },
    };
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    requester: { id: number; role: Role },
  ) {
    const comment = await this.ensureCommentExists(id);

    if (requester.role === Role.USER && comment.authorId !== requester.id) {
      throw new ForbiddenException('Siz faqat oz commentingizni yangilay olasiz');
    }

    const data = await this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      select: this.commentSelect(),
    });

    return {
      success: true,
      status: 200,
      message: 'Comment yangilandi',
      data,
    };
  }

  async togglePin(id: number, requester: { id: number; role: Role }) {
    const comment = await this.ensureCommentExists(id);
    const video = await this.ensureVideoExists(comment.videoId);

    if (
      requester.role === Role.USER &&
      video.authorId !== requester.id
    ) {
      throw new ForbiddenException('Faqat video authori commentni pin qila oladi');
    }

    const data = await this.prisma.comment.update({
      where: { id },
      data: {
        isPinned: !comment.isPinned,
      },
      select: this.commentSelect(),
    });

    return {
      success: true,
      status: 200,
      message: data.isPinned ? 'Comment pinned' : 'Comment unpinned',
      data,
    };
  }

  async remove(id: number, requester: { id: number; role: Role }) {
    const comment = await this.ensureCommentExists(id);

    if (requester.role === Role.USER && comment.authorId !== requester.id) {
      throw new ForbiddenException('Siz faqat oz commentingizni ochira olasiz');
    }

    const replies = await this.prisma.comment.findMany({
      where: { parentId: id },
      select: { id: true },
    });
    const commentIds = [id, ...replies.map((item) => item.id)];

    await this.prisma.like.deleteMany({
      where: {
        commentId: {
          in: commentIds,
        },
      },
    });

    await this.prisma.comment.deleteMany({
      where: {
        id: {
          in: commentIds,
        },
      },
    });

    await this.countCommentsForVideo(comment.videoId);

    return {
      success: true,
      status: 200,
      message: 'Comment ochirildi',
    };
  }
}

