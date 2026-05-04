import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './push-notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { RemovePushTokenDto } from './dto/remove-push-token.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Get()
  async getNotifications(@CurrentUser() user: User) {
    return this.notificationsService.getUserNotifications(user.id);
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('push-token')
  async registerPushToken(
    @CurrentUser() user: User,
    @Body() dto: RegisterPushTokenDto,
  ) {
    await this.pushNotificationService.registerToken(user.id, dto.token, dto.platform);
    return { success: true };
  }

  @Delete('push-token')
  async removePushToken(
    @CurrentUser() user: User,
    @Body() dto: RemovePushTokenDto,
  ) {
    await this.pushNotificationService.removeToken(user.id, dto.token);
    return { success: true };
  }
}
