import { Module } from '@nestjs/common';
import { SiteController } from './site.controller';
import { SeoController } from './seo.controller';

@Module({ controllers: [SiteController, SeoController] })
export class SiteModule {}
