import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { SupportTicket } from '../database/entities/support-ticket.entity';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private readonly entityManager: EntityManager) {}

  async createTicket(userId: number, dto: CreateSupportTicketDto) {
    const ticket = this.entityManager.create(SupportTicket, {
      userId,
      subject: dto.subject ?? null,
      message: dto.message,
      status: 'open',
    });
    await this.entityManager.save(ticket);
    return { success: true, id: ticket.id };
  }
}
