import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/checkToken.guard';
import { RolesGuard } from 'src/common/guards/checkRole.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorators';
import { PaginationDto } from './entities/subscription.entity';

@ApiTags('Channels Subsciptes')
@UseGuards(AuthGuard, RolesGuard)
@Controller('channels')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post(':channelId/subscribe')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  @ApiBody({ type: CreateSubscriptionDto })
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: any,
    @Param('channelId') channelId: number,
  ) {
    return this.subscriptionsService.create(
      { ...createSubscriptionDto, channelId },
      req['user'].id,
    );
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  findAll(@Req() req: any, @Query() query?: PaginationDto) {
    if (!query) {
      query = {
        limit:0,
        page:0
      }
      return this.subscriptionsService.findMeSubsctiptions(req['user'].id, query);
    }
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  findOne(@Param('id') id: number, @Req() req: any) {
    return this.subscriptionsService.findOne(id, req['user'].id);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  @ApiBody({ type: UpdateSubscriptionDto })
  update(
    @Param('id') id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Req() req: any,
  ) {
    return this.subscriptionsService.update(
      id,
      updateSubscriptionDto,
      req['user'].id,
    );
  }

  @Delete(':channelId/subscribe')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: `${Role.USER} ${Role.ADMIN} ${Role.SUPERADMIN}` })
  remove(@Param('channelId') channelId: number, @Req() req: any) {
    return this.subscriptionsService.remove(channelId, req['user'].id);
  }
}
