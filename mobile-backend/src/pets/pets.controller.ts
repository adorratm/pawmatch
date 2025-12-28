import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Controller('pets')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get('my-pets')
  async getMyPets(@CurrentUser() user: User) {
    return this.petsService.findByOwner(user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createPetDto: CreatePetDto,
  ) {
    return this.petsService.create(user.id, createPetDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petsService.update(id, user.id, updatePetDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.petsService.remove(id, user.id);
    return { message: 'Pet deleted successfully' };
  }

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file'))
  async addPhoto(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('isMain') isMain?: boolean,
  ) {
    return this.petsService.addPhoto(id, user.id, file, isMain === true);
  }

  @Delete(':id/photos/:photoId')
  async removePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @CurrentUser() user: User,
  ) {
    await this.petsService.removePhoto(photoId, user.id);
    return { message: 'Photo deleted successfully' };
  }
}


