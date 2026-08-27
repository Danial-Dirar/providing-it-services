import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { join } from 'path';
import hbs from 'hbs';

import { AppModule } from '../src/app.module';
import { ContentService } from '../src/content/content.service';
import { registerHandlebarsHelpers } from '../src/common/hbs-helpers';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

/**
 * Route-level smoke tests.
 *
 * These exist to catch the failures that are invisible until someone loads the
 * page: a template that references a field the controller stopped sending, a
 * slug that no longer resolves, an unescaped value landing in the HTML.
 */
describe('Site (e2e)', () => {
  let app: INestApplication;
  let content: ContentService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    const express = app as NestExpressApplication;
    const rootDir = join(__dirname, '..');

    express.useStaticAssets(join(rootDir, 'public'), { prefix: '/assets' });
    express.setBaseViewsDir(join(rootDir, 'views'));
    express.setViewEngine('hbs');
    express.set('view options', { layout: 'layouts/main' });
    hbs.registerPartials(join(rootDir, 'views', 'partials'));
    registerHandlebarsHelpers(hbs);

    content = moduleRef.get(ContentService);
    app.useGlobalFilters(new HttpExceptionFilter(content));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const staticPages = [
    '/', '/services', '/industries', '/work', '/about', '/careers',
    '/contact', '/privacy', '/terms',
  ];

  it.each(staticPages)('renders %s', async (path) => {
    const res = await request(app.getHttpServer()).get(path).expect(200);

    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<title>');
    expect(res.text).toContain('Providing IT Services');
    // An unrendered expression or a missing view-model field would show here.
    expect(res.text).not.toMatch(/\{\{|undefined|\[object Object\]/);
  });

  it('renders every service detail page', async () => {
    for (const service of new ContentService().services) {
      const res = await request(app.getHttpServer())
        .get(`/services/${service.slug}`)
        .expect(200);
      expect(res.text).toContain(service.title.replace(/&/g, '&amp;'));
      expect(res.text).not.toMatch(/\{\{|undefined/);
    }
  });

  it('renders every case study and role page', async () => {
    const seed = new ContentService();

    for (const study of seed.caseStudies) {
      await request(app.getHttpServer()).get(`/work/${study.slug}`).expect(200);
    }
    for (const role of seed.roles) {
      await request(app.getHttpServer()).get(`/careers/${role.slug}`).expect(200);
    }
  });

  it('returns an HTML 404 page for unknown routes', async () => {
    const res = await request(app.getHttpServer()).get('/does-not-exist').expect(404);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('This page is not here');
  });

  it('404s an unknown service slug rather than rendering an empty page', async () => {
    await request(app.getHttpServer()).get('/services/not-a-practice').expect(404);
  });

  it('serves a sitemap listing every service page', async () => {
    const res = await request(app.getHttpServer()).get('/sitemap.xml').expect(200);
    expect(res.headers['content-type']).toContain('application/xml');

    for (const service of new ContentService().services) {
      expect(res.text).toContain(`/services/${service.slug}`);
    }
  });

  it('keeps non-production out of the index', async () => {
    const res = await request(app.getHttpServer()).get('/robots.txt').expect(200);
    expect(res.text).toContain('Disallow: /');
  });

  it('reports health as JSON', async () => {
    const res = await request(app.getHttpServer()).get('/healthz').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('sets a canonical URL on every page', async () => {
    const res = await request(app.getHttpServer()).get('/about').expect(200);
    expect(res.text).toMatch(/<link rel="canonical" href="[^"]+\/about">/);
  });
});
