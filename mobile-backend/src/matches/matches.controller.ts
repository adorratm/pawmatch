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
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radius') radius?: string,
    @Query('species') species?: string,
    @Query('minAge') minAge?: string,
    @Query('maxAge') maxAge?: string,
    @Query('gender') gender?: string,
    @Query('isVaccinated') isVaccinated?: string,
    @Query('isSpayed') isSpayed?: string,
    @Query('mode') mode?: string,
    @Query('limit') limit?: string,
  ) {
    return this.matchesService.discover(user.id, {
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      radius: radius ? parseFloat(radius) : undefined,
      species,
      minAge: minAge ? parseInt(minAge) : undefined,
      maxAge: maxAge ? parseInt(maxAge) : undefined,
      gender,
      isVaccinated: isVaccinated === 'true',
      isSpayed: isSpayed === 'true',
      mode: mode || 'pawmatch',
      limit: limit ? parseInt(limit) : undefined,
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


