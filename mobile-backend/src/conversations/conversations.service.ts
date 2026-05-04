import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager, Not } from 'typeorm';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { MessageRead } from '../database/entities/message-read.entity';
import { Pet } from '../database/entities/pet.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly entityManager: EntityManager,
  ) {}

  async getUserConversations(userId: number) {
    const userPets = await this.entityManager.find(Pet, {
      where: { ownerId: userId },
    });

    if (userPets.length === 0) {
      return { conversations: [] };
    }

    const userPetIds = userPets.map((p) => p.id);

    const conversations = await this.entityManager
      .createQueryBuilder(Conversation, 'conversation')
      .leftJoinAndSelect('conversation.pet1', 'pet1')
      .leftJoinAndSelect('conversation.pet2', 'pet2')
      .leftJoinAndSelect('pet1.photos', 'pet1Photos')
      .leftJoinAndSelect('pet2.photos', 'pet2Photos')
      .where('conversation.isActive = :isActive', { isActive: true })
      .andWhere(
        '(conversation.pet1Id IN (:...userPetIds) OR conversation.pet2Id IN (:...userPetIds))',
        { userPetIds },
      )
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getMany();

    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const otherPet = userPetIds.includes(conv.pet1Id) ? conv.pet2 : conv.pet1;
        const lastMessage = await this.entityManager.findOne(Message, {
          where: { conversationId: conv.id },
          order: { createdAt: 'DESC' },
        });

        const unreadCount = await this.entityManager.count(Message, {
          where: {
            conversationId: conv.id,
            senderId: Not(userId),
            isRead: false,
          },
        });

        return {
          id: conv.id,
          pet: {
            id: otherPet.id,
            name: otherPet.name,
            photos: otherPet.photos,
          },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                sentAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
        };
      }),
    );

    return { conversations: conversationsWithLastMessage };
  }

  async getConversation(conversationId: number, userId: number) {
    const conversation = await this.entityManager.findOne(Conversation, {
      where: { id: conversationId },
      relations: ['pet1', 'pet2', 'pet1.owner', 'pet2.owner', 'match'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if conversation has a match (only matched users can chat)
    if (!conversation.matchId || !conversation.match) {
      throw new ForbiddenException('Conversation is not associated with a match');
    }

    // Check if user owns one of the pets
    const userPets = await this.entityManager.find(Pet, {
      where: { ownerId: userId },
    });
    const userPetIds = userPets.map((p) => p.id);

    if (
      !userPetIds.includes(conversation.pet1Id) &&
      !userPetIds.includes(conversation.pet2Id)
    ) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const otherPet =
      conversation.pet1Id === userPetIds[0] ? conversation.pet2 : conversation.pet1;

    // Get messages with pagination
    const page = 1; // Can be passed as parameter
    const limit = 50;
    const skip = 0; // (page - 1) * limit;

    const [messages, total] = await this.entityManager.findAndCount(Message, {
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    // Reverse to show oldest first
    messages.reverse();

    return {
      id: conversation.id,
      pet: {
        id: otherPet.id,
        name: otherPet.name,
        photos: otherPet.photos,
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        sentAt: msg.createdAt,
        isRead: msg.isRead,
      })),
      hasMore: total > limit,
      total,
    };
  }

  async sendMessage(conversationId: number, userId: number, createMessageDto: CreateMessageDto) {
    return this.entityManager.transaction(async (manager) => {
      const conversation = await manager.findOne(Conversation, {
        where: { id: conversationId },
        relations: ['match'],
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Check if conversation has a match
      if (!conversation.matchId || !conversation.match) {
        throw new ForbiddenException('Conversation is not associated with a match');
      }

      // Check if user owns one of the pets
      const userPets = await manager.find(Pet, {
        where: { ownerId: userId },
      });
      const userPetIds = userPets.map((p) => p.id);

      if (
        !userPetIds.includes(conversation.pet1Id) &&
        !userPetIds.includes(conversation.pet2Id)
      ) {
        throw new ForbiddenException('You do not have access to this conversation');
      }

      const message = manager.create(Message, {
        conversationId,
        senderId: userId,
        content: createMessageDto.content,
      });

      const savedMessage = await manager.save(message);

      // Update conversation last message time
      conversation.lastMessageAt = new Date();
      await manager.save(conversation);

      return {
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: savedMessage.senderId,
        sentAt: savedMessage.createdAt,
        isRead: savedMessage.isRead,
      };
    });
  }

  async markAsRead(conversationId: number, userId: number) {
    await this.entityManager.update(
      Message,
      {
        conversationId,
        senderId: Not(userId),
        isRead: false,
      },
      { isRead: true },
    );

    return { success: true };
  }
}

