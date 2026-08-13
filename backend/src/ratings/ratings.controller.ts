import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { CreateUserRatingDto } from './dto/create-user-rating.dto';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('users')
  async rateUser(@CurrentUser() user: User, @Body() dto: CreateUserRatingDto) {
    return this.ratingsService.createOrUpdateUserRating(user.id, dto);
  }

  @Get('users/:userId')
  async listForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.ratingsService.listRatingsForUser(userId);
  }
}
