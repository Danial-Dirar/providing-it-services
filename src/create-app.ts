import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import hbs from 'hbs';
import type { NextFunction, Request, Response } from 'express';

import { AppModule } from './app.module';
import { registerHandlebarsHelpers } from './common/hbs-helpers';
import { isIndexable, isProductionEnv } from './common/site-url';

/**
 * Locate the directory holding `views/` and `public/`.
 *
 * Locally that is one level above `dist/`. On Vercel the function root holds
 * the same layout, but the entrypoint may or may not be bundled, so probe for
 * the directory that actually exists rather than assuming a nesting depth.
 */
function findRootDir(): string {
  const candidates = [join(__dirname, '..'), process.cwd(), join(process.cwd(), '..')];
  return candidates.find((dir) => existsSync(join(dir, 'views'))) ?? join(__dirname, '..');
}

/** hbs reads the partials directory asynchronously; wait for it. */
function registerPartials(dir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    hbs.registerPartials(dir, (err?: Error) => (err ? reject(err) : resolve()));
  });
}

/**
 * Builds and configures the application without starting a listener.
 *
 * `main.ts` calls this and then listens; the serverless entrypoint calls it and
 * then hands Express to the platform. Both paths get identical configuration.
 */
export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const rootDir = findRootDir();
  const isProduction = isProductionEnv();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          // Inline styles are used for a handful of per-element custom
          // properties (stagger indexes, arc geometry) set from templates.
          styleSrc: ["'self'", "'unsafe-inline'"],
          // Fonts are self-hosted, so no third-party font origin is needed.
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'self'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: isProduction ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // robots.txt asks crawlers not to fetch; this tells any that do anyway not to
  // index. Both come off together via ALLOW_INDEXING at launch.
  if (!isIndexable()) {
    app.use((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      next();
    });
  }

  app.use(compression());

  // Behind a reverse proxy in production, trust the forwarded client IP so
  // rate limiting counts real visitors rather than the proxy.
  if (isProduction) app.set('trust proxy', 1);

  // On Vercel /assets/* is rewritten to the CDN copy and never reaches here,
  // but keeping this means the same build also runs on a plain Node server.
  app.useStaticAssets(join(rootDir, 'public'), {
    prefix: '/assets',
    maxAge: isProduction ? '30d' : 0,
    etag: true,
  });

  app.setBaseViewsDir(join(rootDir, 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layouts/main' });
  await registerPartials(join(rootDir, 'views', 'partials'));
  registerHandlebarsHelpers(hbs);

  // Cache-busting token for CSS and JS; changes on every deploy.
  const buildId =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ??
    (isProduction ? Date.now().toString(36) : 'dev');
  app.getHttpAdapter().getInstance().locals.buildId = buildId;

  return app;
}
