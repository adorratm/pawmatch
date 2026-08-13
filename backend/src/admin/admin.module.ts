import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import {
  I18nPublicController,
  AdsPublicController,
  PlansPublicController,
  PagesPublicController,
  WebPublicController,
} from './public.controller';
import { RolesGuard } from '../common/guards/roles.guard';
import { InfraModule } from '../infra/infra.module';
import { AdminQueueBridge } from './admin-queue.bridge';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [InfraModule, UploadsModule],
  controllers: [
    AdminController,
    I18nPublicController,
    AdsPublicController,
    PlansPublicController,
    PagesPublicController,
    WebPublicController,
  ],
  providers: [AdminService, RolesGuard, AdminQueueBridge],
  exports: [AdminService],
})
export class AdminModule {}
