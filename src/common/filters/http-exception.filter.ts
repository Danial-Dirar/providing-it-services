import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ContentService } from '../../content/content.service';

/**
 * Renders HTML error pages for browser navigation and JSON for API routes.
 *
 * Without this an unmatched URL returns Nest's default JSON body, which is a
 * jarring thing for a visitor to land on.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Http');

  constructor(private readonly content: ContentService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.originalUrl} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const wantsJson =
      req.originalUrl.startsWith('/api') ||
      (req.headers.accept ?? '').includes('application/json');

    if (wantsJson) {
      const body =
        exception instanceof HttpException
          ? exception.getResponse()
          : { statusCode: status, message: 'Internal server error' };
      res.status(status).json(body);
      return;
    }

    const siteUrl = (process.env.SITE_URL || 'http://localhost:3100').replace(/\/$/, '');
    // `status` is a plain number here, so compare against the enum's value.
    const notFound = status === HttpStatus.NOT_FOUND.valueOf();

    res.status(status).render('pages/error', {
      company: this.content.company,
      nav: this.content.nav,
      navServices: this.content.services,
      year: new Date().getFullYear(),
      path: req.path,
      canonical: `${siteUrl}${req.path}`,
      siteUrl,
      page: 'error',
      meta: {
        title: notFound
          ? 'Page not found — Providing IT Services'
          : 'Something went wrong — Providing IT Services',
        description: 'The page you were looking for is not here.',
        noindex: true,
      },
      status,
      heading: notFound ? 'This page is not here' : 'Something went wrong at our end',
      body: notFound
        ? 'The address may have changed, or it may never have existed. The links below cover everything on the site.'
        : 'The request failed before we could render the page. It has been logged. Try again, or get in touch if it keeps happening.',
      services: this.content.services,
    });
  }
}
