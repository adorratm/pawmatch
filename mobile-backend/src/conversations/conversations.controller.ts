import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async getConversations(@CurrentUser() user: User) {
    return this.conversationsService.getUserConversations(user.id);
  }

  @Get(':id')
  async getConversation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.conversationsService.getConversation(id, user.id);
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.conversationsService.sendMessage(id, user.id, createMessageDto);
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.conversationsService.markAsRead(id, user.id);
  }
}


