import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { SearchService } from '../infra/search.service';
import { QueuesService } from '../infra/queues.service';
import { SystemService } from '../infra/system.service';
import { UploadsService } from '../uploads/uploads.service';
import { imageUploadOptions } from '../uploads/multer.options';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateUserDto {
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsBoolean() emailVerified?: boolean;
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() avatar?: string;
}

class OverrideSubDto {
  @IsString() tier: string;
  @IsOptional() @IsString() activeUntil?: string | null;
  @IsOptional() @IsString() productId?: string | null;
}

class UpdatePetDto {
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isAdopted?: boolean;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() breed?: string;
}

class TicketStatusDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() adminNote?: string;
}

class LocaleDto {
  @IsString() code: string;
  @IsString() name: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

class UpdateLocaleDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

class UpsertEntryDto {
  @IsString() key: string;
  @IsString() value: string;
}

class ImportEntriesDto {
  @IsObject()
  entries: Record<string, string>;
}

class PlacementDto {
  @IsOptional() @IsNumber() id?: number;
  @IsString() key: string;
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class CreativeDto {
  @IsOptional() @IsNumber() id?: number;
  @IsNumber() placementId: number;
  @IsString() title: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() ctaLabel?: string;
  @IsOptional() @IsString() ctaUrl?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class PlanDto {
  @IsOptional() @IsNumber() id?: number;
  @IsString() tier: string;
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsString() priceLabel?: string;
  @IsOptional() @IsArray() features?: string[];
  @IsOptional() @IsNumber() superlikesWeeklyLimit?: number;
  @IsOptional() @IsBoolean() removesAds?: boolean;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class SettingDto {
  @IsString() key: string;
  @IsString() value: string;
  @IsOptional() @IsString() description?: string;
}

class BroadcastDto {
  @IsString() title: string;
  @IsString() body: string;
  @IsOptional() @IsString() type?: string;
}

class UpdateVetDto {
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isVerified?: boolean;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() licenseNumber?: string;
  @IsOptional() @IsString() clinicName?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() phone?: string;
}

class ShelterDto {
  @IsOptional() @IsNumber() id?: number;
  @IsNumber() userId: number;
  @IsString() name: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @Type(() => Number) @IsNumber() latitude?: number;
  @IsOptional() @Type(() => Number) @IsNumber() longitude?: number;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsBoolean() isVerified?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class TemperamentDto {
  @IsString() name: string;
}

class CmsPageDto {
  @IsOptional() @IsNumber() id?: number;
  @IsString() slug: string;
  @IsString() title: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsString() body: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly search: SearchService,
    private readonly queues: QueuesService,
    private readonly system: SystemService,
    private readonly uploads: UploadsService,
  ) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.getDashboard();
  }

  @Get('search')
  searchAll(@Query('q') q?: string) {
    return this.search.search(q ?? '');
  }

  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) throw new BadRequestException('Dosya gerekli');
    const url = await this.uploads.uploadFile(file, folder || 'admin');
    return { url };
  }

  @Post('search/reindex')
  @Roles(UserRole.ADMIN)
  reindex() {
    return this.queues.enqueueReindex();
  }

  @Get('system')
  systemMetrics() {
    return this.system.getMetrics();
  }

  @Get('queues')
  queueStats() {
    return this.queues.stats();
  }

  @Post('queues/:name/retry')
  @Roles(UserRole.ADMIN)
  retryQueue(@Param('name') name: string) {
    return this.queues.retryFailed(name);
  }

  @Post('queues/:name/clean')
  @Roles(UserRole.ADMIN)
  cleanQueue(@Param('name') name: string) {
    return this.queues.clean(name);
  }

  // Users
  @Get('users')
  listUsers(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listUsers(q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Get('users/:id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.admin.getUser(id);
  }

  @Get('users/:id/activity')
  getUserActivity(@Param('id', ParseIntPipe) id: number) {
    return this.admin.getUserActivity(id);
  }

  @Patch('users/:id')
  @Roles(UserRole.ADMIN)
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.admin.updateUser(id, dto);
  }

  @Post('users/:id/subscription')
  @Roles(UserRole.ADMIN)
  overrideSub(@Param('id', ParseIntPipe) id: number, @Body() dto: OverrideSubDto) {
    return this.admin.overrideSubscription(id, dto);
  }

  // Pets
  @Get('pets')
  listPets(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listPets(q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Get('pets/:id')
  getPet(@Param('id', ParseIntPipe) id: number) {
    return this.admin.getPet(id);
  }

  @Patch('pets/:id')
  updatePet(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePetDto) {
    return this.admin.updatePet(id, dto);
  }

  @Post('pets/:id/photos')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  addPetPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('isMain') isMain?: string,
  ) {
    if (!file) throw new BadRequestException('Dosya gerekli');
    return this.admin.addPetPhoto(id, file, isMain === 'true' || isMain === '1');
  }

  @Delete('pets/:id/photos/:photoId')
  removePetPhoto(@Param('photoId', ParseIntPipe) photoId: number) {
    return this.admin.removePetPhoto(photoId);
  }

  @Delete('pets/:id')
  @Roles(UserRole.ADMIN)
  deletePet(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deletePet(id);
  }

  // Matches
  @Get('matches')
  listMatches(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listMatches(q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Post('matches/:id/unmatch')
  unmatch(@Param('id', ParseIntPipe) id: number) {
    return this.admin.unmatch(id);
  }

  // Support
  @Get('support/tickets')
  listTickets(
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listTickets(status, q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Patch('support/tickets/:id')
  updateTicket(@Param('id', ParseIntPipe) id: number, @Body() dto: TicketStatusDto) {
    return this.admin.updateTicket(id, dto);
  }

  // i18n
  @Get('i18n/locales')
  listLocales() {
    return this.admin.listLocales();
  }

  @Post('i18n/locales')
  @Roles(UserRole.ADMIN)
  createLocale(@Body() dto: LocaleDto) {
    return this.admin.createLocale(dto);
  }

  @Patch('i18n/locales/:id')
  @Roles(UserRole.ADMIN)
  updateLocale(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLocaleDto) {
    return this.admin.updateLocale(id, dto);
  }

  @Get('i18n/locales/:id/entries')
  listEntries(
    @Param('id', ParseIntPipe) id: number,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') entryId?: string,
  ) {
    return this.admin.listEntries(id, q, Number(page) || 1, Number(limit) || 20, Number(entryId) || undefined);
  }

  @Post('i18n/locales/:id/entries')
  @Roles(UserRole.ADMIN)
  upsertEntry(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertEntryDto) {
    return this.admin.upsertEntry(id, dto.key, dto.value);
  }

  @Post('i18n/locales/:id/import')
  @Roles(UserRole.ADMIN)
  importEntries(@Param('id', ParseIntPipe) id: number, @Body() dto: ImportEntriesDto) {
    return this.admin.importFlatEntries(id, dto.entries ?? {});
  }

  @Delete('i18n/entries/:id')
  @Roles(UserRole.ADMIN)
  deleteEntry(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteEntry(id);
  }

  // Ads
  @Get('ads/placements')
  listPlacements(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listPlacements(q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Post('ads/placements')
  @Roles(UserRole.ADMIN)
  upsertPlacement(@Body() dto: PlacementDto) {
    return this.admin.upsertPlacement(dto);
  }

  @Post('ads/creatives')
  @Roles(UserRole.ADMIN)
  upsertCreative(@Body() dto: CreativeDto) {
    return this.admin.upsertCreative(dto);
  }

  @Delete('ads/creatives/:id')
  @Roles(UserRole.ADMIN)
  deleteCreative(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteCreative(id);
  }

  // Plans
  @Get('plans')
  listPlans(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listPlans(false, q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Post('plans')
  @Roles(UserRole.ADMIN)
  upsertPlan(@Body() dto: PlanDto) {
    return this.admin.upsertPlan(dto);
  }

  @Delete('plans/:id')
  @Roles(UserRole.ADMIN)
  deletePlan(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deletePlan(id);
  }

  // Settings
  @Get('settings')
  listSettings(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listSettings(q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Post('settings')
  @Roles(UserRole.ADMIN)
  upsertSetting(@Body() dto: SettingDto) {
    return this.admin.upsertSetting(dto.key, dto.value, dto.description);
  }

  @Delete('settings/:id')
  @Roles(UserRole.ADMIN)
  deleteSetting(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteSetting(id);
  }

  // Broadcast
  @Post('notifications/broadcast')
  @Roles(UserRole.ADMIN)
  async broadcast(@Body() dto: BroadcastDto) {
    const queued = await this.queues.enqueueBroadcast(dto);
    if (queued) return { queued: true };
    return this.admin.broadcast(dto);
  }

  // Vets
  @Get('veterinarians')
  listVets(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listVeterinarians(q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Get('veterinarians/:id')
  getVet(@Param('id', ParseIntPipe) id: number) {
    return this.admin.getVeterinarian(id);
  }

  @Patch('veterinarians/:id')
  updateVet(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVetDto) {
    return this.admin.updateVeterinarian(id, dto);
  }

  @Delete('veterinarians/:id')
  @Roles(UserRole.ADMIN)
  deleteVet(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteVeterinarian(id);
  }

  // Shelters
  @Get('shelters')
  listShelters(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listShelters(q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Post('shelters')
  @Roles(UserRole.ADMIN)
  upsertShelter(@Body() dto: ShelterDto) {
    return this.admin.upsertShelter(dto);
  }

  @Delete('shelters/:id')
  @Roles(UserRole.ADMIN)
  deleteShelter(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteShelter(id);
  }

  // Temperaments
  @Get('temperaments')
  listTemperaments(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listTemperaments(q, Number(page) || 1, Number(limit) || 20, Number(id) || undefined);
  }

  @Post('temperaments')
  @Roles(UserRole.ADMIN)
  createTemperament(@Body() dto: TemperamentDto) {
    return this.admin.createTemperament(dto.name);
  }

  @Patch('temperaments/:id')
  @Roles(UserRole.ADMIN)
  updateTemperament(@Param('id', ParseIntPipe) id: number, @Body() dto: TemperamentDto) {
    return this.admin.updateTemperament(id, dto.name);
  }

  @Delete('temperaments/:id')
  @Roles(UserRole.ADMIN)
  deleteTemperament(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteTemperament(id);
  }

  // CMS
  @Get('cms/pages')
  listCmsPages(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('id') id?: string,
  ) {
    return this.admin.listCmsPages(q, Number(page) || 1, Number(limit) || 20, false, Number(id) || undefined);
  }

  @Get('cms/pages/:id')
  getCmsPage(@Param('id', ParseIntPipe) id: number) {
    return this.admin.getCmsPage(id);
  }

  @Post('cms/pages')
  @Roles(UserRole.ADMIN)
  upsertCmsPage(@Body() dto: CmsPageDto) {
    return this.admin.upsertCmsPage(dto);
  }

  @Delete('cms/pages/:id')
  @Roles(UserRole.ADMIN)
  deleteCmsPage(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteCmsPage(id);
  }
}
