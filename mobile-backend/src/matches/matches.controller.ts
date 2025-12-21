import { Controller, Get, Post, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('discover')
  async discover(
    @CurrentUser() user: User,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number,
    @Query('species') species?: string,
    @Query('minAge') minAge?: number,
    @Query('maxAge') maxAge?: number,
    @Query('gender') gender?: string,
    @Query('limit') limit?: number,
  ) {
    return this.matchesService.discover(user.id, {
      latitude,
      longitude,
      radius,
      species,
      minAge,
      maxAge,
      gender,
      limit,
    });
  }

  @Post(':petId/like')
  async like(
    @Param('petId', ParseIntPipe) petId: number,
    @CurrentUser() user: User,
  ) {
    return this.matchesService.like(petId, user.id);
  }

  @Post(':petId/dislike')
  async dislike(
    @Param('petId', ParseIntPipe) petId: number,
    @CurrentUser() user: User,
  ) {
    return this.matchesService.dislike(petId, user.id);
  }

  @Get()
  async getMatches(@CurrentUser() user: User) {
    return this.matchesService.getUserMatches(user.id);
  }
}

