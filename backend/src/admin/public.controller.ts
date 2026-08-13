import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';

@Controller('i18n')
export class I18nPublicController {
  constructor(private readonly admin: AdminService) {}

  @Get(':locale')
  async getLocale(@Param('locale') locale: string) {
    const nested = await this.admin.getNestedTranslations(locale);
    if (!nested || Object.keys(nested).length === 0) {
      return {};
    }
    return nested;
  }
}

@Controller('ads')
export class AdsPublicController {
  constructor(private readonly admin: AdminService) {}

  @Get('active')
  getActive(@Query('placement') placement?: string) {
    return this.admin.getActiveAds(placement);
  }
}

@Controller('plans')
export class PlansPublicController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list() {
    return this.admin.listPlans(true);
  }
}

@Controller('pages')
export class PagesPublicController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list() {
    return this.admin.listPublishedPages();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.admin.getPublishedPageBySlug(slug);
  }
}

@Controller('web')
export class WebPublicController {
  constructor(private readonly admin: AdminService) {}

  @Get('config')
  config() {
    return this.admin.getWebConfig();
  }
}
