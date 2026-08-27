import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import hbs from 'hbs';

import { AppModule } from './app.module';
import { registerHandlebarsHelpers } from './common/hbs-helpers';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const rootDir = join(__dirname, '..');
  const isProduction = process.env.NODE_ENV === 'production';

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

  app.use(compression());

  // Behind a reverse proxy in production, trust the forwarded client IP so
  // rate limiting counts real visitors rather than the proxy.
  if (isProduction) app.set('trust proxy', 1);

  app.useStaticAssets(join(rootDir, 'public'), {
    prefix: '/assets',
    maxAge: isProduction ? '30d' : 0,
    etag: true,
  });

  app.setBaseViewsDir(join(rootDir, 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layouts/main' });
  hbs.registerPartials(join(rootDir, 'views', 'partials'));
  registerHandlebarsHelpers(hbs);

  // Cache-busting token for CSS and JS; changes on every deploy.
  const buildId = isProduction ? Date.now().toString(36) : 'dev';
  app.getHttpAdapter().getInstance().locals.buildId = buildId;

  const port = Number(process.env.PORT) || 3100;
  await app.listen(port, '0.0.0.0');

  new Logger('Bootstrap').log(
    `Providing IT Services running at http://localhost:${port} (${isProduction ? 'production' : 'development'})`,
  );
}

void bootstrap();
