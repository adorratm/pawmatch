import { Controller, Get, Post, Param, Query, UseGuards, ParseIntPipe, Body } from '@nestjs/common';
import { VeterinariansService } from './veterinarians.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { CreateClinicReviewDto } from './dto/create-clinic-review.dto';

@Controller('veterinarians')
@UseGuards(JwtAuthGuard)
export class VeterinariansController {
  constructor(private readonly veterinariansService: VeterinariansService) {}

  @Get('nearby')
  async findNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius?: string,
  ) {
    return this.veterinariansService.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 10,
    );
  }

  @Get('appointments/me')
  async getMyAppointments(@CurrentUser() user: User) {
    return this.veterinariansService.getAppointments(user.id);
  }

  @Post('appointments')
  async createAppointment(
    @CurrentUser() user: User,
    @Body() createAppointmentDto: any,
  ) {
    return this.veterinariansService.createAppointment(user.id, createAppointmentDto);
  }

  @Get(':id/reviews')
  async listClinicReviews(@Param('id', ParseIntPipe) id: number) {
    return this.veterinariansService.listClinicReviews(id);
  }

  @Post(':id/reviews')
  async createClinicReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: CreateClinicReviewDto,
  ) {
    return this.veterinariansService.createClinicReview(id, user.id, dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.veterinariansService.findOne(id);
  }
}

