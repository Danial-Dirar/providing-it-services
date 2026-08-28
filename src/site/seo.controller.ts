import { Controller, Get, Header } from '@nestjs/common';
import { ContentService } from '../content/content.service';
import { isIndexable, resolveSiteUrl } from '../common/site-url';

/** robots.txt and sitemap.xml, generated from the same content the pages use. */
@Controller()
export class SeoController {
  constructor(private readonly content: ContentService) {}

  private get siteUrl(): string {
    return resolveSiteUrl();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  robots(): string {
    // Keep staging out of the index; only allow crawling on the real domain.
    // Crawling is opt-in: previews, and any production deploy that has not had
    // ALLOW_INDEXING switched on, stay out of the index.
    return isIndexable()
      ? ['User-agent: *', 'Allow: /', '', `Sitemap: ${this.siteUrl}/sitemap.xml`, ''].join('\n')
      : ['User-agent: *', 'Disallow: /', ''].join('\n');
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  sitemap(): string {
    const today = new Date().toISOString().slice(0, 10);

    const urls: { loc: string; priority: string; changefreq: string }[] = [
      { loc: '/', priority: '1.0', changefreq: 'weekly' },
      { loc: '/services', priority: '0.9', changefreq: 'monthly' },
      { loc: '/industries', priority: '0.8', changefreq: 'monthly' },
      { loc: '/work', priority: '0.8', changefreq: 'monthly' },
      { loc: '/about', priority: '0.7', changefreq: 'monthly' },
      { loc: '/careers', priority: '0.7', changefreq: 'weekly' },
      { loc: '/contact', priority: '0.9', changefreq: 'yearly' },
      { loc: '/privacy', priority: '0.2', changefreq: 'yearly' },
      { loc: '/terms', priority: '0.2', changefreq: 'yearly' },
      ...this.content.services.map((s) => ({
        loc: `/services/${s.slug}`,
        priority: '0.8',
        changefreq: 'monthly',
      })),
      ...this.content.caseStudies.map((c) => ({
        loc: `/work/${c.slug}`,
        priority: '0.6',
        changefreq: 'yearly',
      })),
      ...this.content.roles.map((r) => ({
        loc: `/careers/${r.slug}`,
        priority: '0.5',
        changefreq: 'weekly',
      })),
    ];

    const body = urls
      .map(
        (u) =>
          `  <url>\n    <loc>${this.siteUrl}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  }
}
