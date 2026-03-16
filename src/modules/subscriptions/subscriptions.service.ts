import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PaginationDto } from './entities/subscription.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService
  ) { }

  private userPublicSelect() {
    return {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      status: true,
      role: true,
      is_email_verified: true,
      is_phone_verified: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }

  async create(createSubscriptionDto: { channelId: number; notificationsEnabled?: boolean }, subscriberid: number) {
    const subscriber = await this.prismaService.user.findFirst({
      where: {
        id: subscriberid,
      },
    });

    const owner_db = await this.prismaService.user.findFirst({
      where: {
        id: createSubscriptionDto.channelId,
      },
    });

    if (!owner_db) {
      throw new NotFoundException('Bunday channel/user topilmadi');
    }

    if (subscriberid == createSubscriptionDto.channelId) {
      throw new ForbiddenException("Siz o'zingizga obuna bo'la olmaysiz!!!");
    }

    if (!subscriber) {
      throw new NotFoundException('Token xato!!!');
    }

    const existingSubscription = await this.prismaService.subscription.findFirst({
      where: {
        channelId: createSubscriptionDto.channelId,
        subscriberId: subscriberid,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('Siz bu channelga allaqachon obuna bolgansiz');
    }

    const newChannel = await this.prismaService.subscription.create({
      data: {
        channelId: createSubscriptionDto.channelId,
        subscriberId: subscriberid,
        notificationsEnabled: createSubscriptionDto?.notificationsEnabled,
      },
    });


    await this.notificationService.createNotification(
      newChannel.channelId,
      NotificationType.NEW_SUBSCRIBER,
      "New subscriber",
      "New subscriber joined your channel"
    );

    return {
      success: true,
      status: 200,
      message: 'Subscribed true',
    };

  }

  async findMeSubsctiptions(ownerid: number, query?: PaginationDto) {

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const skip = (page - 1) * limit;

    const find_owner = await this.prismaService.user.findFirst({
      where: {
        id: ownerid,
      },
    });
    if (!find_owner) {
      throw new NotFoundException('Token xato!!!');
    }

    const subscriptionsMe = await this.prismaService.subscription.findMany({
      where: {
        subscriberId: ownerid,
      },
      select: {
        id: true,
        notificationsEnabled: true,
        createdAt: true,
        channel: {
          select: this.userPublicSelect(),
        },
        subscriber: {
          select: this.userPublicSelect(),
        },
      },
      skip: skip,
      take: limit,
    });

    return {
      succes: true,
      status: 200,
      data: subscriptionsMe,
    };
  }
  async findMeSubsctiptionsFeed(ownerid: number, query?: PaginationDto) {

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const skip = (page - 1) * limit;

    const find_owner = await this.prismaService.user.findFirst({
      where: {
        id: ownerid,
      },
    });
    if (!find_owner) {
      throw new NotFoundException('Token xato!!!');
    }

    const subscriptionsMe = await this.prismaService.subscription.findMany({
      where: {
        subscriberId: ownerid,
      },
      select: {
        id: true,
        notificationsEnabled: true,
        createdAt: true,
        channelId: true,
      },
      skip: skip,
      take: limit,
    });

    const channelIds = subscriptionsMe.map((item) => item.channelId);
    const feedVideos = channelIds.length
      ? await this.prismaService.video.findMany({
          where: {
            authorId: {
              in: channelIds,
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    return {
      succes: true,
      status: 200,
      data: feedVideos,
    };
  }

  async findOne(id: number, ownerid: number) {
    const subscription = await this.prismaService.subscription.findFirst({
      where: {
        id: Number(id),
        subscriberId: ownerid,
      },
      select: {
        id: true,
        notificationsEnabled: true,
        createdAt: true,
        channel: {
          select: this.userPublicSelect(),
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Bunday obunangiz mavjud emas!');
    }

    return {
      success: true,
      status: 200,
      data: subscription,
    };
  }

  async update(
    id: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
    ownerid: number,
  ) {
    const subscription = await this.prismaService.subscription.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!subscription) {
      throw new NotFoundException('Bunday obunangiz mavjud emas!');
    }

    if (subscription.subscriberId !== ownerid) {
      throw new ForbiddenException('BU sizning obunangiz emas');
    }

    const data = await this.prismaService.subscription.update({
      where: { id: Number(id) },
      data: {
        notificationsEnabled: updateSubscriptionDto.notificationsEnabled,
      },
    });

    return {
      succes: true,
      status: 201,
      data,
    };
  }

  async remove(channelId: number, ownerid: number) {
    const subscription = await this.prismaService.subscription.findFirst({
      where: {
        channelId: Number(channelId),
        subscriberId: ownerid,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Bunday obunangiz mavjud emas!');
    }

    await this.prismaService.subscription.delete({
      where: { id: subscription.id },
    });

    return {
      succes: true,
      status: 200,
      message: "obuna o'chirildi",
    };
  }
}
