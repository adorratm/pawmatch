import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { QueuesService } from './queues.service';
import { SystemService } from './system.service';

@Module({
  providers: [SearchService, QueuesService, SystemService],
  exports: [SearchService, QueuesService, SystemService],
})
export class InfraModule {}
