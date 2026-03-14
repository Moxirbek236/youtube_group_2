import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PaginationDto } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createSubscriptionDto: any, subscriberid: number) {
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

    await this.prismaService.subscription.create({
      data: {
        channelId: createSubscriptionDto.channelId,
        subscriberId: subscriberid,
        notificationsEnabled: createSubscriptionDto?.notificationsEnabled,
      },
    });

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
        channel: true,
        subscriber: true,
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

    let feedVideos;

    for (let channel = 0; channel < subscriptionsMe.length; channel++) {
      const element = subscriptionsMe[channel];
      feedVideos = await this.prismaService.video.findMany({
        where: { authorId: element.channelId},
      });
    }
    
    console.log(feedVideos); 
    return {
      succes: true,
      status: 200,
      data: feedVideos,
    };
  }

  findOne(id: number, ownerid: number) {
    return `This action returns a #${id} subscription`;
  }

  async update(
    id: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
    ownerid: number,
  ) {
    const owner_db = await this.prismaService.user.findFirst({
      where: {
        id: ownerid,
      },
      select: { subscriptions: true },
    });

    const subscription = await this.prismaService.subscription.findFirst({
      where: {
        id,
      },
    });

    for (let i = 0; i < owner_db?.subscriptions.length!; i++) {
      const element = owner_db?.subscriptions[i];
      if (element?.id != id) {
        throw new ForbiddenException('BU sizning obunangiz emas');
      }
    }

    if (!owner_db) {
      throw new NotFoundException('Bunday channel/user topilmadi');
    }

    if (!subscription) {
      throw new NotFoundException('Bunday obunangiz mavjud emas!');
    }

    const data = await this.prismaService.subscription.update({
      where: { id },
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

  async remove(id: number, ownerid: number) {
    const owner_db = await this.prismaService.user.findFirst({
      where: {
        id: ownerid,
      },
      select: {
        subscriptions: true,
      },
    });

    const subscription = await this.prismaService.subscription.findFirst({
      where: {
        id,
      },
    });

    for (let i = 0; i < owner_db?.subscriptions.length!; i++) {
      const element = owner_db?.subscriptions[i];
      if (element?.id != id) {
        throw new ForbiddenException('BU sizning obunangiz emas');
      }
    }

    if (!owner_db) {
      throw new NotFoundException('Bunday channel/user topilmadi');
    }

    if (!subscription) {
      throw new NotFoundException('Bunday obunangiz mavjud emas!');
    }

    await this.prismaService.subscription.delete({
      where: { id },
    });

    return {
      succes: true,
      status: 200,
      message: "obuna o'chirildi",
    };
  }
}
