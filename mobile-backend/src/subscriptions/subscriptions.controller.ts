import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  @Get('me')
  getMySubscription(@CurrentUser() user: User) {
    return {
      tier: 'free',
      isActive: false,
      productId: null as string | null,
      expiresAt: null as string | null,
      userId: user.id,
    };
  }
}
