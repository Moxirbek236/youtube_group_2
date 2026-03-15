import { Injectable, NotFoundException } from '@nestjs/common';
import { LikeType, NotificationType } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private async ensureCommentExists(commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, videoId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment topilmadi');
    }

    return comment;
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

  private async commentCounts(commentId: number) {
    const likesCount = await this.prisma.like.count({
      where: { commentId, type: LikeType.LIKE },
    });
    const dislikesCount = await this.prisma.like.count({
      where: { commentId, type: LikeType.DISLIKE },
    });

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { likesCount },
    });

    return { commentId, likesCount, dislikesCount };
  }

  private async videoCounts(videoId: number) {
    const likesCount = await this.prisma.like.count({
      where: { videoId, type: LikeType.LIKE },
    });
    const dislikesCount = await this.prisma.like.count({
      where: { videoId, type: LikeType.DISLIKE },
    });

    await this.prisma.video.update({
      where: { id: videoId },
      data: { likesCount, dislikesCount },
    });

    return { videoId, likesCount, dislikesCount };
  }

  private async toggleCommentReaction(
    commentId: number,
    userId: number,
    type: LikeType,
  ) {
    await this.ensureCommentExists(commentId);

    const current = await this.prisma.like.findFirst({
      where: { commentId, userId },
      select: { id: true, type: true },
    });

    if (current?.type === type) {
      await this.prisma.like.delete({ where: { id: current.id } });
      const data = await this.commentCounts(commentId);
      return {
        success: true,
        status: 200,
        message: type === LikeType.LIKE ? 'Comment unlike qilindi' : 'Comment undislike qilindi',
        data,
      };
    }

    if (current) {
      await this.prisma.like.delete({ where: { id: current.id } });
    }

    await this.prisma.like.create({
      data: {
        userId,
        commentId,
        type,
      },
    });

    const data = await this.commentCounts(commentId);
    return {
      success: true,
      status: 201,
      message: type === LikeType.LIKE ? 'Comment liked' : 'Comment disliked',
      data,
    };
  }

  private async removeCommentReaction(
    commentId: number,
    userId: number,
    type: LikeType,
  ) {
    await this.ensureCommentExists(commentId);

    const current = await this.prisma.like.findFirst({
      where: { commentId, userId, type },
      select: { id: true },
    });

    if (current) {
      await this.prisma.like.delete({ where: { id: current.id } });
    }

    const data = await this.commentCounts(commentId);
    return {
      success: true,
      status: 200,
      message: type === LikeType.LIKE ? 'Comment unlike qilindi' : 'Comment undislike qilindi',
      data,
    };
  }

  private async toggleVideoReaction(
    videoId: number,
    userId: number,
    type: LikeType,
  ) {
    const video = await this.ensureVideoExists(videoId);

    const current = await this.prisma.like.findFirst({
      where: { videoId, userId },
      select: { id: true, type: true },
    });

    if (current?.type === type) {
      await this.prisma.like.delete({ where: { id: current.id } });
      const data = await this.videoCounts(videoId);
      return {
        success: true,
        status: 200,
        message: type === LikeType.LIKE ? 'Video unlike qilindi' : 'Video undislike qilindi',
        data,
      };
    }

    if (current) {
      await this.prisma.like.delete({ where: { id: current.id } });
    }

    await this.prisma.like.create({
      data: {
        userId,
        videoId,
        type,
      },
    });

    if (type === LikeType.LIKE && video.authorId !== userId) {
      await this.notificationService.createNotification(
        video.authorId,
        NotificationType.VIDEO_LIKED,
        'Someone liked your video',
        `${video.title} liked by a user`,
      );
    }

    const data = await this.videoCounts(videoId);
    return {
      success: true,
      status: 201,
      message: type === LikeType.LIKE ? 'Video liked' : 'Video disliked',
      data,
    };
  }

  private async removeVideoReaction(
    videoId: number,
    userId: number,
    type: LikeType,
  ) {
    await this.ensureVideoExists(videoId);

    const current = await this.prisma.like.findFirst({
      where: { videoId, userId, type },
      select: { id: true },
    });

    if (current) {
      await this.prisma.like.delete({ where: { id: current.id } });
    }

    const data = await this.videoCounts(videoId);
    return {
      success: true,
      status: 200,
      message: type === LikeType.LIKE ? 'Video unlike qilindi' : 'Video undislike qilindi',
      data,
    };
  }

  async likeComment(commentId: number, userId: number) {
    return this.toggleCommentReaction(commentId, userId, LikeType.LIKE);
  }

  async dislikeComment(commentId: number, userId: number) {
    return this.toggleCommentReaction(commentId, userId, LikeType.DISLIKE);
  }

  async unlikeComment(commentId: number, userId: number) {
    return this.removeCommentReaction(commentId, userId, LikeType.LIKE);
  }

  async undislikeComment(commentId: number, userId: number) {
    return this.removeCommentReaction(commentId, userId, LikeType.DISLIKE);
  }

  async likeVideo(videoId: number, userId: number) {
    return this.toggleVideoReaction(videoId, userId, LikeType.LIKE);
  }

  async dislikeVideo(videoId: number, userId: number) {
    return this.toggleVideoReaction(videoId, userId, LikeType.DISLIKE);
  }

  async unlikeVideo(videoId: number, userId: number) {
    return this.removeVideoReaction(videoId, userId, LikeType.LIKE);
  }

  async undislikeVideo(videoId: number, userId: number) {
    return this.removeVideoReaction(videoId, userId, LikeType.DISLIKE);
  }
}

