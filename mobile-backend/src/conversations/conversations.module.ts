import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { MessageRead } from '../database/entities/message-read.entity';
import { Pet } from '../database/entities/pet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, MessageRead, Pet]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}

