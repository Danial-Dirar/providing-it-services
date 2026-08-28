import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RENDER_METADATA } from '@nestjs/common/constants';
import { Request } from 'express';
import { Observable, map } from 'rxjs';
import { ContentService } from '../../content/content.service';
import { resolveSiteUrl } from '../site-url';

/**
 * Merges site-wide context into every rendered view model.
 *
 * Page handlers only return what is specific to that page; company details,
 * navigation, the canonical URL and the copyright year land here so no
 * template has to be given them by hand.
 */
@Injectable()
export class PageContextInterceptor implements NestInterceptor {
  constructor(
    private readonly content: ContentService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Only handlers carrying @Render() produce a view model. API responses and
    // plain-text routes must pass through untouched.
    const template = this.reflector.get<string>(RENDER_METADATA, context.getHandler());
    if (!template) return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const siteUrl = resolveSiteUrl();

    return next.handle().pipe(
      map((data: unknown) => {
        // Only decorate view models (plain objects heading for a template).
        if (!data || typeof data !== 'object' || Array.isArray(data)) return data;

        const model = data as Record<string, unknown>;
        const path = req.path;

        return {
          company: this.content.company,
          nav: this.content.nav,
          navServices: this.content.services,
          year: new Date().getFullYear(),
          path,
          canonical: `${siteUrl}${path === '/' ? '' : path}`,
          siteUrl,
          ...model,
        };
      }),
    );
  }
}
