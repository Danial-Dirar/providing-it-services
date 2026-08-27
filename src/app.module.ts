import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { ContentModule } from './content/content.module';
import { SiteModule } from './site/site.module';
import { ContactModule } from './contact/contact.module';
import { HealthModule } from './health/health.module';
import { PageContextInterceptor } from './common/interceptors/page-context.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        // Site-wide ceiling; the contact endpoint tightens this further.
        { name: 'default', ttl: 60_000, limit: 240 },
      ],
    }),
    ContentModule,
    SiteModule,
    ContactModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: PageContextInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
