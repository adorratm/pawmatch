import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager, Not } from 'typeorm';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { Pet } from '../database/entities/pet.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly entityManager: EntityManager) {}

  private async assertConversationAccess(conversation: Conversation, userId: number) {
    const userPets = await this.entityManager.find(Pet, {
      where: { ownerId: userId },
    });
    const userPetIds = userPets.map((p) => p.id);
    const allowed =
      conversation.user1Id === userId ||
      (conversation.pet1Id != null && userPetIds.includes(conversation.pet1Id)) ||
      userPetIds.includes(conversation.pet2Id);
    if (!allowed) {
      throw new ForbiddenException('You do not have access to this conversation');
    }
    return userPetIds;
  }

  async getUserConversations(userId: number) {
    const userPets = await this.entityManager.find(Pet, {
      where: { ownerId: userId },
    });
    const userPetIds = userPets.map((p) => p.id);

    const qb = this.entityManager
      .createQueryBuilder(Conversation, 'conversation')
      .leftJoinAndSelect('conversation.pet1', 'pet1')
      .leftJoinAndSelect('conversation.pet2', 'pet2')
      .leftJoinAndSelect('pet1.photos', 'pet1Photos')
      .leftJoinAndSelect('pet2.photos', 'pet2Photos')
      .leftJoinAndSelect('conversation.user1', 'user1')
      .where('conversation.isActive = :isActive', { isActive: true });

    if (userPetIds.length > 0) {
      qb.andWhere(
        '(conversation.user1Id = :userId OR conversation.pet1Id IN (:...userPetIds) OR conversation.pet2Id IN (:...userPetIds))',
        { userId, userPetIds },
      );
    } else {
      qb.andWhere('conversation.user1Id = :userId', { userId });
    }

    const conversations = await qb.orderBy('conversation.lastMessageAt', 'DESC').getMany();

    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const isAdoption = conv.pet1Id == null;
        let petPayload: { id: number; name: string; photos?: any[] };
        if (isAdoption) {
          petPayload = {
            id: conv.pet2.id,
            name:
              conv.user1Id === userId
                ? conv.pet2.name
                : `${conv.user1?.firstName || 'İlgilenen'} · ${conv.pet2.name}`,
            photos: conv.pet2.photos,
          };
        } else {
          const otherPet = userPetIds.includes(conv.pet1Id!) ? conv.pet2 : conv.pet1!;
          petPayload = {
            id: otherPet.id,
            name: otherPet.name,
            photos: otherPet.photos,
          };
        }

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
          pet: petPayload,
          isAdoption,
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
      relations: {
        pet1: { owner: true, photos: true },
        pet2: { owner: true, photos: true },
        user1: true,
        match: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.matchId || !conversation.match) {
      throw new ForbiddenException('Conversation is not associated with a match');
    }

    const userPetIds = await this.assertConversationAccess(conversation, userId);

    const isAdoption = conversation.pet1Id == null;
    const otherPet = isAdoption
      ? conversation.pet2
      : userPetIds.includes(conversation.pet1Id!)
        ? conversation.pet2
        : conversation.pet1!;

    const page = 1;
    const limit = 50;
    const skip = 0;

    const [messages, total] = await this.entityManager.findAndCount(Message, {
      where: { conversationId },
      relations: { sender: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    messages.reverse();

    return {
      id: conversation.id,
      pet: {
        id: otherPet.id,
        name:
          isAdoption && conversation.user1Id !== userId && conversation.user1
            ? `${conversation.user1.firstName} · ${otherPet.name}`
            : otherPet.name,
        photos: otherPet.photos,
      },
      isAdoption,
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
        relations: { match: true },
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      if (!conversation.matchId || !conversation.match) {
        throw new ForbiddenException('Conversation is not associated with a match');
      }

      const userPets = await manager.find(Pet, {
        where: { ownerId: userId },
      });
      const userPetIds = userPets.map((p) => p.id);
      const allowed =
        conversation.user1Id === userId ||
        (conversation.pet1Id != null && userPetIds.includes(conversation.pet1Id)) ||
        userPetIds.includes(conversation.pet2Id);
      if (!allowed) {
        throw new ForbiddenException('You do not have access to this conversation');
      }

      const message = manager.create(Message, {
        conversationId,
        senderId: userId,
        content: createMessageDto.content,
      });

      const savedMessage = await manager.save(message);

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
