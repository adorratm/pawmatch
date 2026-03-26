import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from '../database/entities/match.entity';
import { MatchLike } from '../database/entities/match-like.entity';
import { MatchDislike } from '../database/entities/match-dislike.entity';
import { Pet } from '../database/entities/pet.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}


