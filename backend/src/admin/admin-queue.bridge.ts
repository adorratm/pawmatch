import { Injectable, OnModuleInit } from '@nestjs/common';
import { QueuesService } from '../infra/queues.service';
import { AdminService } from './admin.service';

@Injectable()
export class AdminQueueBridge implements OnModuleInit {
  constructor(
    private readonly queues: QueuesService,
    private readonly admin: AdminService,
  ) {}

  onModuleInit() {
    this.queues.setBroadcastHandler((dto) => this.admin.broadcast(dto));
  }
}
