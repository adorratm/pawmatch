import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserLocation } from './entities/user-location.entity';
import { OAuthAccount } from './entities/oauth-account.entity';
import { Pet } from './entities/pet.entity';
import { PetPhoto } from './entities/pet-photo.entity';
import { Temperament } from './entities/temperament.entity';
import { PetTemperament } from './entities/pet-temperament.entity';
import { Match } from './entities/match.entity';
import { MatchLike } from './entities/match-like.entity';
import { MatchDislike } from './entities/match-dislike.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { Notification } from './entities/notification.entity';
import { Rating } from './entities/rating.entity';
import { Veterinarian } from './entities/veterinarian.entity';
import { VeterinarianClinic } from './entities/veterinarian-clinic.entity';
import { VeterinarianService } from './entities/veterinarian-service.entity';
import { Appointment } from './entities/appointment.entity';
import { AppointmentSlot } from './entities/appointment-slot.entity';
import { Shelter } from './entities/shelter.entity';
import { ShelterPet } from './entities/shelter-pet.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          User,
          UserProfile,
          UserLocation,
          OAuthAccount,
          Pet,
          PetPhoto,
          Temperament,
          PetTemperament,
          Match,
          MatchLike,
          MatchDislike,
          Conversation,
          Message,
          MessageRead,
          Notification,
          Rating,
          Veterinarian,
          VeterinarianClinic,
          VeterinarianService,
          Appointment,
          AppointmentSlot,
          Shelter,
          ShelterPet,
        ],
        synchronize: false, // Mevcut veritabanı yapısını korumak için kapalı
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

